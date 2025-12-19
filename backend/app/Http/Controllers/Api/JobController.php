<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobStatusLog;
use App\Services\GoogleSheetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class JobController extends Controller
{
    protected $googleSheetService;

    public function __construct(GoogleSheetService $googleSheetService)
    {
        $this->googleSheetService = $googleSheetService;
    }
    /**
     * Get list of jobs
     */
    public function index(Request $request)
    {
        $query = Job::with(['odp', 'assignedFe', 'creator', 'statusLogs.changer', 'notes.user', 'photos.uploader']);

        // Filter by role
        if ($request->user()->role === 'fe') {
            $query->where('assigned_fe_id', $request->user()->id);
        }

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('job_type')) {
            $query->where('job_type', $request->job_type);
        }

        if ($request->has('assigned_fe_id')) {
            $query->where('assigned_fe_id', $request->assigned_fe_id);
        }

        if ($request->has('date_from')) {
            $query->whereDate('scheduled_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('scheduled_date', '<=', $request->date_to);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('job_number', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('location_address', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 15);
        // Sort by tanggal desc, then by no (as integer) asc, then by created_at asc
        // Use +0 to force numeric sorting in SQLite
        $jobs = $query->orderBy('tanggal', 'desc')
            ->orderByRaw('(no + 0) ASC')
            ->orderBy('created_at', 'asc')
            ->orderBy('id', 'asc')
            ->paginate($perPage);

        return response()->json($jobs);
    }

    /**
     * Get single job
     */
    public function show($id)
    {
        $job = Job::withTrashed()->with([
            'odp',
            'assignedFe',
            'creator',
            'updater',
            'statusLogs.changer',
            'notes.user',
            'photos.uploader'
        ])->findOrFail($id);

        // Format janji_datang as time string (H:i) for frontend
        $jobData = $job->toArray();
        if ($job->janji_datang) {
            if (method_exists($job->janji_datang, 'format')) {
                $jobData['janji_datang'] = $job->janji_datang->format('H:i');
            } elseif (is_string($job->janji_datang)) {
                // If it's already a string, extract time part
                if (preg_match('/(\d{2}:\d{2})/', $job->janji_datang, $matches)) {
                    $jobData['janji_datang'] = $matches[1];
                }
            }
        }

        return response()->json($jobData);
    }

    /**
     * Create new job (Admin only)
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'no' => 'nullable|integer',
            'odp_id' => 'nullable|exists:odps,id',
            'tanggal' => 'required|date',
            'kategori' => 'nullable|string',
            'req_by' => 'nullable|string',
            'tiket_all_bnet' => 'nullable|string',
            'id_nama_pop_odp_jb' => 'nullable|string',
            'tikor' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'detail' => 'nullable|string',
            'janji_datang' => 'nullable|date_format:H:i',
            'petugas_1' => 'nullable|string',
            'petugas_2' => 'nullable|string',
            'petugas_3' => 'nullable|string',
            'ba' => 'nullable|boolean',
            'status' => 'required|in:done,re-schedule,waiting,open',
            'remarks' => 'nullable|string',
            'title' => 'nullable|string|max:255',
            'job_type' => 'nullable|in:installasi,gangguan,survey,maintenance,lainnya',
            'location_address' => 'nullable|string',
            'description' => 'nullable|string',
            'assigned_fe_id' => 'nullable|exists:users,id',
            'scheduled_date' => 'nullable|date',
            'deadline_at' => 'nullable|date',
            'priority' => 'nullable|in:low,medium,high,critical',
        ]);

        // Always generate unique job_number, ignore any input from frontend
        unset($validated['job_number']);
        // Auto generate no (store as integer)
        $validated['no'] = Job::generateJobNo();
        $validated['created_by'] = $request->user()->id;
        if (!isset($validated['status'])) {
            $validated['status'] = 'open';
        }
        // Convert BA checkbox to boolean
        if (isset($validated['ba'])) {
            $validated['ba'] = filter_var($validated['ba'], FILTER_VALIDATE_BOOLEAN);
        } else {
            $validated['ba'] = false;
        }
        // Set default values for old fields that might be required
        if (!isset($validated['title'])) {
            $validated['title'] = $validated['kategori'] ?? 'Job';
        }
        if (!isset($validated['scheduled_date'])) {
            $validated['scheduled_date'] = $validated['tanggal'] ?? now()->toDateString();
        }

        // Generate tikor from latitude and longitude if latitude/longitude is provided
        if (isset($validated['latitude']) && isset($validated['longitude'])) {
            if ($validated['latitude'] && $validated['longitude']) {
                $validated['tikor'] = $validated['latitude'] . ', ' . $validated['longitude'];
            }
        } elseif (empty($validated['tikor']) && (isset($validated['latitude']) || isset($validated['longitude']))) {
            // If only one coordinate is provided, still try to generate tikor
            $lat = $validated['latitude'] ?? '';
            $lng = $validated['longitude'] ?? '';
            if ($lat || $lng) {
                $validated['tikor'] = ($lat ? $lat : '') . ($lat && $lng ? ', ' : '') . ($lng ? $lng : '');
            }
        }

        // Retry mechanism to handle race condition
        $maxRetries = 5;
        $retry = 0;
        $job = null;
        
        while ($retry < $maxRetries) {
            try {
                $validated['job_number'] = Job::generateJobNumber();
                $job = Job::create($validated);
                break; // Success, exit loop
            } catch (\Illuminate\Database\QueryException $e) {
                // Check if it's a unique constraint violation
                if ($e->getCode() == 23000 || str_contains($e->getMessage(), 'UNIQUE constraint')) {
                    $retry++;
                    if ($retry >= $maxRetries) {
                        // If all retries failed, use timestamp-based fallback
                        $validated['job_number'] = 'JOB-' . now()->format('Ymd') . '-' . time();
                        $job = Job::create($validated);
                        break;
                    }
                    // Wait a bit before retrying (microseconds)
                    usleep(100000 * $retry); // 100ms, 200ms, 300ms, etc.
                } else {
                    // If it's a different error, re-throw it
                    throw $e;
                }
            }
        }

        // Create status log
        JobStatusLog::create([
            'job_id' => $job->id,
            'old_status' => null,
            'new_status' => $job->status,
            'changed_by' => $request->user()->id,
            'note' => 'Job created',
        ]);

        $job->load(['assignedFe', 'creator']);

        // Sync to Google Sheets
        $this->googleSheetService->syncJob($job);

        return response()->json($job, 201);
    }

    /**
     * Update job (Admin only)
     */
    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job = Job::findOrFail($id);

        // Cannot edit done jobs
        if ($job->status === 'done') {
            return response()->json(['message' => 'Cannot edit completed jobs'], 400);
        }

        $validated = $request->validate([
            'no' => 'nullable|integer',
            'odp_id' => 'nullable|exists:odps,id',
            'tanggal' => 'sometimes|date',
            'kategori' => 'nullable|string',
            'req_by' => 'nullable|string',
            'tiket_all_bnet' => 'nullable|string',
            'id_nama_pop_odp_jb' => 'nullable|string',
            'tikor' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'detail' => 'nullable|string',
            'janji_datang' => 'nullable|date_format:H:i',
            'petugas_1' => 'nullable|string',
            'petugas_2' => 'nullable|string',
            'petugas_3' => 'nullable|string',
            'ba' => 'nullable|boolean',
            'status' => 'sometimes|in:done,re-schedule,waiting,open',
            'remarks' => 'nullable|string',
            'title' => 'sometimes|string|max:255',
            'job_type' => 'sometimes|in:installasi,gangguan,survey,maintenance,lainnya',
            'location_address' => 'sometimes|string',
            'description' => 'nullable|string',
            'assigned_fe_id' => 'nullable|exists:users,id',
            'scheduled_date' => 'sometimes|date',
            'deadline_at' => 'nullable|date',
            'priority' => 'sometimes|in:low,medium,high,critical',
        ]);

        $oldStatus = $job->status;
        $oldFeId = $job->assigned_fe_id;

        // Generate tikor from latitude and longitude if latitude/longitude is provided
        // Always update tikor if latitude or longitude is changed
        if (isset($validated['latitude']) || isset($validated['longitude'])) {
            $latitude = $validated['latitude'] ?? $job->latitude;
            $longitude = $validated['longitude'] ?? $job->longitude;
            if ($latitude && $longitude) {
                $validated['tikor'] = $latitude . ', ' . $longitude;
            }
        } elseif (empty($validated['tikor']) || !isset($validated['tikor'])) {
            // If tikor is empty and no lat/lng provided, use existing values
            if ($job->latitude && $job->longitude) {
                $validated['tikor'] = $job->latitude . ', ' . $job->longitude;
            }
        }

        // Update status if FE is assigned/changed
        if (isset($validated['assigned_fe_id'])) {
            if ($oldFeId !== $validated['assigned_fe_id']) {
                $validated['status'] = 'assigned';
            }
        }

        $validated['updated_by'] = $request->user()->id;
        $job->update($validated);

        // Create status log if status changed
        if ($oldStatus !== $job->status) {
            JobStatusLog::create([
                'job_id' => $job->id,
                'old_status' => $oldStatus,
                'new_status' => $job->status,
                'changed_by' => $request->user()->id,
                'note' => 'Job updated by admin',
            ]);
        }

        $job->load(['assignedFe', 'creator', 'updater']);

        // Sync to Google Sheets
        $this->googleSheetService->syncJob($job);

        return response()->json($job);
    }

    /**
     * Update job status
     */
    public function updateStatus(Request $request, $id)
    {
        $job = Job::findOrFail($id);

        // FE can only update their own jobs
        if ($request->user()->role === 'fe' && $job->assigned_fe_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'new_status' => 'required|in:done,re-schedule,waiting,open',
            'note' => 'nullable|string',
        ]);

        $oldStatus = $job->status;
        $newStatus = $validated['new_status'];

        // Validation rules for status transitions
        if ($oldStatus === 'done') {
            return response()->json(['message' => 'Cannot change status of completed jobs'], 400);
        }

        $job->status = $newStatus;
        $job->updated_by = $request->user()->id;
        $job->save();

        // Create status log
        JobStatusLog::create([
            'job_id' => $job->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by' => $request->user()->id,
            'note' => $validated['note'] ?? null,
        ]);

        $job->load(['assignedFe', 'statusLogs.changer']);

        // Sync to Google Sheets
        $this->googleSheetService->syncJob($job);

        return response()->json($job);
    }

    /**
     * Cancel job (Admin only)
     */
    public function cancel(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job = Job::findOrFail($id);

        if (in_array($job->status, ['done', 'canceled'])) {
            return response()->json(['message' => 'Job already completed or canceled'], 400);
        }

        $validated = $request->validate([
            'note' => 'required|string',
        ]);

        $oldStatus = $job->status;
        $job->status = 'canceled';
        $job->updated_by = $request->user()->id;
        $job->save();

        JobStatusLog::create([
            'job_id' => $job->id,
            'old_status' => $oldStatus,
            'new_status' => 'canceled',
            'changed_by' => $request->user()->id,
            'note' => $validated['note'],
        ]);

        return response()->json($job);
    }

    /**
     * Add note to job
     */
    public function addNote(Request $request, $id)
    {
        $job = Job::findOrFail($id);

        // FE can only add notes to their own jobs
        if ($request->user()->role === 'fe' && $job->assigned_fe_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'note_type' => 'required|in:progress,result,issue,admin_instruction',
            'content' => 'required|string',
        ]);

        $note = $job->notes()->create([
            'user_id' => $request->user()->id,
            'note_type' => $validated['note_type'],
            'content' => $validated['content'],
        ]);

        $note->load('user');

        return response()->json($note, 201);
    }

    /**
     * Upload photo to job
     */
    public function uploadPhoto(Request $request, $id)
    {
        $job = Job::findOrFail($id);

        // FE can only upload photos to their own jobs
        if ($request->user()->role === 'fe' && $job->assigned_fe_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'photo' => 'required|image|max:5120', // 5MB max
            'caption' => 'nullable|string|max:255',
            'photo_type' => 'required|in:before,process,after,other',
        ]);

        $path = $request->file('photo')->store('job-photos', 'public');

        $photo = $job->photos()->create([
            'uploaded_by' => $request->user()->id,
            'photo_url' => $path,
            'caption' => $validated['caption'] ?? null,
            'photo_type' => $validated['photo_type'],
        ]);

        $photo->load('uploader');

        return response()->json($photo, 201);
    }

    /**
     * Delete photo
     */
    /**
     * Delete job (Admin only)
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job = Job::findOrFail($id);
        $jobNo = $job->no;
        $job->delete();

        // Delete from Google Sheets
        $this->googleSheetService->deleteJob($jobNo);

        return response()->json(['message' => 'Job deleted successfully']);
    }

    /**
     * Sync all jobs to Google Sheets (Admin only)
     */
    public function syncToGoogleSheets(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $success = $this->googleSheetService->syncAllJobs();

        if ($success) {
            return response()->json(['message' => 'All jobs synced to Google Sheets successfully']);
        }

        return response()->json(['message' => 'Failed to sync jobs to Google Sheets. Check configuration.'], 500);
    }

    public function deletePhoto(Request $request, $id, $photoId)
    {
        $job = Job::findOrFail($id);
        $photo = $job->photos()->findOrFail($photoId);

        // Only admin or photo uploader can delete
        if ($request->user()->role !== 'admin' && $photo->uploaded_by !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        Storage::disk('public')->delete($photo->photo_url);
        $photo->delete();

        return response()->json(['message' => 'Photo deleted']);
    }

    /**
     * Get deleted jobs (trash) - Admin only
     */
    public function trash(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $jobs = Job::onlyTrashed()
            ->with(['assignedFe', 'creator'])
            ->orderBy('deleted_at', 'desc')
            ->paginate(15);

        return response()->json($jobs);
    }

    /**
     * Restore deleted job - Admin only
     */
    public function restore(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job = Job::onlyTrashed()->findOrFail($id);
        $job->restore();

        // Re-sync to Google Sheets
        $this->googleSheetService->syncJob($job);

        return response()->json(['message' => 'Job restored successfully', 'job' => $job]);
    }

    /**
     * Permanently delete job - Admin only
     */
    public function forceDelete(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job = Job::onlyTrashed()->findOrFail($id);
        $jobNo = $job->no;
        $job->forceDelete();

        return response()->json(['message' => 'Job permanently deleted']);
    }
}


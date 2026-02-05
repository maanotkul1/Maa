<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HistoryJob;
use App\Models\HistoryJobPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class HistoryJobController extends Controller
{
    /**
     * Get list of history jobs
     */
    public function index(Request $request)
    {
        $query = HistoryJob::with(['creator:id,name', 'updater:id,name'])
            ->select(['id', 'job_number', 'job_type', 'nama_client', 'nama_client_wireless', 'nama_client_fo',
                      'tanggal_pekerjaan', 'tanggal_wireless', 'tanggal_fo', 'status', 'field_engineer_1',
                      'field_engineer_2', 'field_engineer_3', 'tikor_odp_jb', 'port_odp', 'redaman',
                      'created_by', 'updated_by', 'created_at', 'updated_at']);

        // Filter by role - FE can see jobs where their name appears in any field engineer field
        if ($request->user()->role === 'fe') {
            $userName = $request->user()->name;
            $query->where(function ($q) use ($userName) {
                $q->where('field_engineer_1', 'like', "%{$userName}%")
                  ->orWhere('field_engineer_2', 'like', "%{$userName}%")
                  ->orWhere('field_engineer_3', 'like', "%{$userName}%");
            });
        }

        // Filter by job type
        if ($request->has('job_type') && $request->job_type) {
            $query->where('job_type', $request->job_type);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('tanggal_dari')) {
            $query->whereDate('tanggal_pekerjaan', '>=', $request->tanggal_dari);
        }
        if ($request->has('tanggal_sampai')) {
            $query->whereDate('tanggal_pekerjaan', '<=', $request->tanggal_sampai);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('job_number', 'like', "%{$search}%")
                  ->orWhere('nama_client', 'like', "%{$search}%")
                  ->orWhere('nama_client_wireless', 'like', "%{$search}%")
                  ->orWhere('nama_client_fo', 'like', "%{$search}%")
                  ->orWhere('tikor_odp_jb', 'like', "%{$search}%")
                  ->orWhere('port_odp', 'like', "%{$search}%")
                  ->orWhere('field_engineer_1', 'like', "%{$search}%")
                  ->orWhere('field_engineer_2', 'like', "%{$search}%")
                  ->orWhere('field_engineer_3', 'like', "%{$search}%");
            });
        }

        // Order by
        $query->orderBy('tanggal_pekerjaan', 'desc')
              ->orderBy('created_at', 'desc');

        $perPage = $request->get('per_page', 15);
        $jobs = $query->paginate($perPage);

        return response()->json($jobs);
    }

    /**
     * Get single history job
     */
    public function show(Request $request, $id)
    {
        $job = HistoryJob::with(['creator', 'updater', 'photos'])->findOrFail($id);

        // FE can only view jobs where their name appears in any field engineer field
        if ($request->user()->role === 'fe') {
            $userName = $request->user()->name;
            $canView =
                (stripos($job->field_engineer_1 ?? '', $userName) !== false) ||
                (stripos($job->field_engineer_2 ?? '', $userName) !== false) ||
                (stripos($job->field_engineer_3 ?? '', $userName) !== false);

            if (!$canView) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        return response()->json($job);
    }

    /**
     * Create new history job
     */
    public function store(Request $request)
    {
        $jobType = $request->input('job_type');

        // Base rules - different based on job_type
        $rules = [
            'job_type' => 'required|in:instalasi,troubleshooting_fo,troubleshooting_wireless',
            'foto_rumah' => 'nullable|image|max:5120',
            'foto_pemasangan' => 'nullable|image|max:5120',
        ];

        // Conditional rules based on job_type ONLY
        if ($jobType === 'troubleshooting_wireless') {
            // Wireless uses different field names
            $rules += [
                'tanggal_wireless' => 'required|date',
                'nama_client_wireless' => 'required|string|max:255',
                'odp_pop_wireless' => 'nullable|string|max:255',
                'suspect_wireless' => 'nullable|string|max:255',
                'action_wireless' => 'nullable|string|max:255',
                'redaman_signal_wireless' => 'nullable|string|max:255',
                'tipe_kabel_wireless' => 'nullable|string|max:255',
                'petugas_fe_wireless' => 'nullable|string|max:255',
                'jam_datang' => 'nullable|date_format:H:i',
                'jam_selesai' => 'nullable|date_format:H:i',
                'note_wireless' => 'nullable|string',
            ];
        } else if ($jobType === 'troubleshooting_fo') {
            // FO uses separate fields
            $rules += [
                'tanggal_fo' => 'required|date',
                'nama_client_fo' => 'required|string|max:255',
                'odp_pop_fo' => 'nullable|string|max:255',
                'suspect_fo' => 'nullable|string|max:255',
                'action_fo' => 'nullable|string|max:255',
                'petugas_fe_fo' => 'nullable|string|max:255',
                'jam_datang_fo' => 'nullable|date_format:H:i',
                'jam_selesai_fo' => 'nullable|date_format:H:i',
                'note_fo' => 'nullable|string',
            ];
        } else {
            // Instalasi uses common fields
            $rules += [
                'nama_client' => 'required|string|max:255',
                'tanggal_pekerjaan' => 'required|date',
                'field_engineer_1' => 'nullable|string|max:255',
            ];
        }

        // Common optional fields for all types
        $rules += [
            'keterangan' => 'nullable|string',
        ];

        // Instalasi specific rules
        if ($jobType === 'instalasi') {
            $rules += [
                'panjang_kabel' => 'required|numeric|min:0',
                'tikor_odp_jb' => 'nullable|string|max:255',
                'port_odp' => 'nullable|string|max:50',
                'redaman' => 'nullable|string',
            ];
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        // Generate job number based on job type
        $jobNumber = HistoryJob::generateJobNumber($jobType);

        // Extract data based on job type
        if ($jobType === 'troubleshooting_wireless') {
            // Wireless uses different fields
            $data = $request->only([
                'job_type',
                'tanggal_wireless',
                'nama_client_wireless',
                'odp_pop_wireless',
                'suspect_wireless',
                'action_wireless',
                'redaman_signal_wireless',
                'tipe_kabel_wireless',
                'petugas_fe_wireless',
                'jam_datang',
                'jam_selesai',
                'note_wireless',
            ]);
            // Set defaults for common fields
            $data['nama_client'] = $request->input('nama_client_wireless') ?: 'N/A';
            $data['tanggal_pekerjaan'] = $request->input('tanggal_wireless') ?: now()->format('Y-m-d');
            $data['field_engineer_1'] = $request->input('petugas_fe_wireless') ?: 'N/A';
        } else if ($jobType === 'troubleshooting_fo') {
            // FO uses separate fields
            $data = $request->only([
                'job_type',
                'tanggal_fo',
                'nama_client_fo',
                'odp_pop_fo',
                'suspect_fo',
                'action_fo',
                'petugas_fe_fo',
                'jam_datang_fo',
                'jam_selesai_fo',
                'note_fo',
            ]);
            // Set defaults for common fields
            $data['nama_client'] = $request->input('nama_client_fo') ?: 'N/A';
            $data['tanggal_pekerjaan'] = $request->input('tanggal_fo') ?: now()->format('Y-m-d');
            $data['field_engineer_1'] = $request->input('petugas_fe_fo') ?: 'N/A';
        } else {
            // Instalasi
            $data = $request->only([
                'job_type',
                'nama_client',
                'tikor_odp_jb',
                'port_odp',
                'redaman',
                'field_engineer_1',
                'tanggal_pekerjaan',
                'panjang_kabel',
                'keterangan',
            ]);
            $data['field_engineer_2'] = null;
            $data['field_engineer_3'] = null;
        }

        $data['job_number'] = $jobNumber;
        $data['status'] = 'completed';
        $data['created_by'] = $request->user()->id;
        $data['updated_by'] = $request->user()->id;

        // Handle photo uploads
        if ($request->hasFile('foto_rumah')) {
            $data['foto_rumah'] = $request->file('foto_rumah')->store('history_jobs/photos', 'public');
        }

        if ($request->hasFile('foto_pemasangan')) {
            $data['foto_pemasangan'] = $request->file('foto_pemasangan')->store('history_jobs/photos', 'public');
        }

        $job = HistoryJob::create($data);

        // Handle additional photos - stored efficiently
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $photoPath = $photo->storeAs(
                    'history_jobs/photos',
                    $job->id . '_' . uniqid() . '.' . $photo->getClientOriginalExtension(),
                    'public'
                );
                HistoryJobPhoto::create([
                    'history_job_id' => $job->id,
                    'photo_path' => $photoPath,
                    'photo_type' => 'other',
                    'uploaded_by' => $request->user()->id,
                ]);
            }
        }

        return response()->json($job->load(['creator', 'photos']), 201);
    }

    /**
     * Update history job
     */
    public function update(Request $request, $id)
    {
        $job = HistoryJob::findOrFail($id);

        // FE can only update jobs where their name appears in any field engineer field
        if ($request->user()->role === 'fe') {
            $userName = $request->user()->name;
            $canEdit =
                (stripos($job->field_engineer_1 ?? '', $userName) !== false) ||
                (stripos($job->field_engineer_2 ?? '', $userName) !== false) ||
                (stripos($job->field_engineer_3 ?? '', $userName) !== false);

            if (!$canEdit) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $validator = Validator::make($request->all(), [
            'job_type' => 'sometimes|in:instalasi,troubleshooting_fo,troubleshooting_wireless',
            'nama_client' => 'sometimes|string|max:255',
            'tikor_odp_jb' => 'sometimes|string|max:255',
            'port_odp' => 'sometimes|string|max:50',
            'redaman' => 'nullable|numeric',
            'field_engineer_1' => 'nullable|string|max:255',
            'tanggal_pekerjaan' => 'sometimes|date',
            'panjang_kabel' => 'nullable|numeric',
            'keterangan' => 'nullable|string',
            'foto_rumah' => 'nullable|image|max:5120',
            'foto_pemasangan' => 'nullable|image|max:5120',
            // Wireless fields
            'tanggal_wireless' => 'nullable|date',
            'nama_client_wireless' => 'nullable|string|max:255',
            'odp_pop_wireless' => 'nullable|string|max:255',
            'suspect_wireless' => 'nullable|string|max:255',
            'action_wireless' => 'nullable|string|max:255',
            'redaman_signal_wireless' => 'nullable|string|max:255',
            'tipe_kabel_wireless' => 'nullable|string|max:255',
            'petugas_fe_wireless' => 'nullable|string|max:255',
            'jam_datang' => 'nullable|date_format:H:i',
            'jam_selesai' => 'nullable|date_format:H:i',
            'note_wireless' => 'nullable|string',
            // FO fields
            'tanggal_fo' => 'nullable|date',
            'nama_client_fo' => 'nullable|string|max:255',
            'odp_pop_fo' => 'nullable|string|max:255',
            'suspect_fo' => 'nullable|string|max:255',
            'action_fo' => 'nullable|string|max:255',
            'petugas_fe_fo' => 'nullable|string|max:255',
            'jam_datang_fo' => 'nullable|date_format:H:i',
            'jam_selesai_fo' => 'nullable|date_format:H:i',
            'note_fo' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Extract data based on job type
        $jobType = $request->input('job_type', $job->job_type);

        if ($jobType === 'troubleshooting_wireless') {
            // Wireless uses different fields
            $data = $request->only([
                'job_type',
                'tanggal_wireless',
                'nama_client_wireless',
                'odp_pop_wireless',
                'suspect_wireless',
                'action_wireless',
                'redaman_signal_wireless',
                'tipe_kabel_wireless',
                'petugas_fe_wireless',
                'jam_datang',
                'jam_selesai',
                'note_wireless',
            ]);
            if ($jobType === 'troubleshooting_wireless') {
                $data['nama_client'] = $request->input('nama_client_wireless') ?: $job->nama_client;
                $data['tanggal_pekerjaan'] = $request->input('tanggal_wireless') ?: $job->tanggal_pekerjaan;
                $data['field_engineer_1'] = $request->input('petugas_fe_wireless') ?: $job->field_engineer_1;
            }
        } else if ($jobType === 'troubleshooting_fo') {
            // FO uses separate fields
            $data = $request->only([
                'job_type',
                'tanggal_fo',
                'nama_client_fo',
                'odp_pop_fo',
                'suspect_fo',
                'action_fo',
                'petugas_fe_fo',
                'jam_datang_fo',
                'jam_selesai_fo',
                'note_fo',
            ]);
            $data['nama_client'] = $request->input('nama_client_fo') ?: $job->nama_client;
            $data['tanggal_pekerjaan'] = $request->input('tanggal_fo') ?: $job->tanggal_pekerjaan;
            $data['field_engineer_1'] = $request->input('petugas_fe_fo') ?: $job->field_engineer_1;
        } else {
            // Instalasi
            $data = $request->only([
                'job_type',
                'nama_client',
                'tikor_odp_jb',
                'port_odp',
                'redaman',
                'field_engineer_1',
                'tanggal_pekerjaan',
                'panjang_kabel',
                'keterangan',
            ]);
            $data['field_engineer_2'] = null;
            $data['field_engineer_3'] = null;
        }

        $data['updated_by'] = $request->user()->id;

        // Handle photo uploads
        if ($request->hasFile('foto_rumah')) {
            // Delete old photo
            if ($job->foto_rumah) {
                Storage::disk('public')->delete($job->foto_rumah);
            }
            $data['foto_rumah'] = $request->file('foto_rumah')->store('history_jobs/photos', 'public');
        }

        if ($request->hasFile('foto_pemasangan')) {
            // Delete old photo
            if ($job->foto_pemasangan) {
                Storage::disk('public')->delete($job->foto_pemasangan);
            }
            $data['foto_pemasangan'] = $request->file('foto_pemasangan')->store('history_jobs/photos', 'public');
        }

        $job->update($data);

        return response()->json($job->load(['creator', 'updater', 'photos']));
    }

    /**
     * Delete history job
     */
    public function destroy(Request $request, $id)
    {
        $job = HistoryJob::findOrFail($id);

        // Only admin can delete
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Collect all file paths to delete
        $filesToDelete = [];

        if ($job->foto_rumah) {
            $filesToDelete[] = $job->foto_rumah;
        }
        if ($job->foto_pemasangan) {
            $filesToDelete[] = $job->foto_pemasangan;
        }

        // Get all related photo paths
        $job->photos->each(function ($photo) use (&$filesToDelete) {
            $filesToDelete[] = $photo->photo_path;
        });

        // Delete all files at once
        if (!empty($filesToDelete)) {
            try {
                Storage::disk('public')->delete($filesToDelete);
            } catch (\Exception $e) {
                // Log error but don't block deletion
            }
        }

        $job->delete();

        return response()->json(['message' => 'History job deleted successfully'], 200);
    }

    /**
     * Upload additional photo
     */
    public function uploadPhoto(Request $request, $id)
    {
        $job = HistoryJob::findOrFail($id);

        // FE can only upload to jobs where their name appears in any field engineer field
        if ($request->user()->role === 'fe') {
            $userName = $request->user()->name;
            $canEdit =
                (stripos($job->field_engineer_1 ?? '', $userName) !== false) ||
                (stripos($job->field_engineer_2 ?? '', $userName) !== false) ||
                (stripos($job->field_engineer_3 ?? '', $userName) !== false);

            if (!$canEdit) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|max:5120',
            'photo_type' => 'nullable|in:rumah,pemasangan,other',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $photoPath = $request->file('photo')->store('history_jobs/photos', 'public');

        $photo = HistoryJobPhoto::create([
            'history_job_id' => $job->id,
            'photo_path' => $photoPath,
            'photo_type' => $request->photo_type ?? 'other',
            'description' => $request->description,
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json($photo->load('uploader'), 201);
    }

    /**
     * Delete photo
     */
    public function deletePhoto(Request $request, $id, $photoId)
    {
        $job = HistoryJob::findOrFail($id);
        $photo = HistoryJobPhoto::findOrFail($photoId);

        if ($photo->history_job_id !== $job->id) {
            return response()->json(['message' => 'Photo not found'], 404);
        }

        // FE can only delete photos from jobs where their name appears in any field engineer field
        if ($request->user()->role === 'fe') {
            $userName = $request->user()->name;
            $canDelete =
                (stripos($job->field_engineer_1 ?? '', $userName) !== false) ||
                (stripos($job->field_engineer_2 ?? '', $userName) !== false) ||
                (stripos($job->field_engineer_3 ?? '', $userName) !== false);

            if (!$canDelete) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        Storage::disk('public')->delete($photo->photo_path);
        $photo->delete();

        return response()->json(['message' => 'Photo deleted successfully']);
    }
}


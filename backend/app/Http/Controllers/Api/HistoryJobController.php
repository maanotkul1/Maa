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
        $query = HistoryJob::with(['creator', 'updater', 'photos']);

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
        $rules = [
            'job_type' => 'required|in:instalasi,troubleshooting_fo,troubleshooting_wireless',
            'nama_client' => 'required|string|max:255',
            'tanggal_pekerjaan' => 'required|date',
            'field_engineer_1' => 'nullable|string|max:255',
            'foto_rumah' => 'nullable|image|max:5120',
            'foto_pemasangan' => 'nullable|image|max:5120',
        ];

        // Conditional rules based on job_type ONLY
        $jobType = $request->input('job_type');

        if ($jobType === 'instalasi') {
            $rules += [
                'panjang_kabel' => 'required|numeric|min:0',
                'tikor_odp_jb' => 'nullable|string|max:255',
                'port_odp' => 'nullable|string|max:50',
                'redaman' => 'nullable|string',
            ];
        } else if ($jobType === 'troubleshooting_fo') {
            $rules += [
                'tikor_odp_jb' => 'required|string|max:255',
                'port_odp' => 'nullable|string|max:50',
                'redaman' => 'nullable|string',
                'detail_action' => 'nullable|string',
                'tipe_cut' => 'nullable|string|max:100',
                'tikor_cut' => 'nullable|string|max:255',
                'tipe_kabel' => 'nullable|string|max:100',
            ];
        } else if ($jobType === 'troubleshooting_wireless') {
            $rules += [
                'lokasi_site' => 'nullable|string|max:255',
                'area_ruangan' => 'nullable|string|max:255',
                'prioritas' => 'nullable|in:low,medium,high',
                'tanggal_waktu_pengerjaan' => 'nullable|date_format:Y-m-d\TH:i',
                'teknisi_id' => 'nullable|integer',
                'catatan_teknisi' => 'nullable|string',
                'port_odp' => 'nullable|string|max:50',
                'redaman' => 'nullable|string',
                'peralatan_radio' => 'nullable|boolean',
                'peralatan_kabel' => 'nullable|boolean',
                'peralatan_adaptor' => 'nullable|boolean',
                'peralatan_poe' => 'nullable|boolean',
                'peralatan_rj45' => 'nullable|boolean',
                'peralatan_router_switch' => 'nullable|boolean',
                'peralatan_ap' => 'nullable|boolean',
                'peralatan_lainnya' => 'nullable|boolean',
                'peralatan_lainnya_keterangan' => 'nullable|string|max:255',
            ];
        }

        // Common optional fields for all types
        $rules += [
            'keterangan' => 'nullable|string',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        // Generate job number
        $jobNumber = HistoryJob::generateJobNumber();

        $data = $request->only([
            'job_type',
            'nama_client',
            'tikor_odp_jb',
            'port_odp',
            'redaman',
            'field_engineer_1',
            'tanggal_pekerjaan',
            'panjang_kabel',
            'detail_action',
            'tipe_cut',
            'tikor_cut',
            'tipe_kabel',
            'keterangan',
            // Wireless fields
            'lokasi_site',
            'area_ruangan',
            'prioritas',
            'tanggal_waktu_pengerjaan',
            'teknisi_id',
            'catatan_teknisi',
            // Equipment/Damage fields
            'peralatan_radio',
            'peralatan_kabel',
            'peralatan_adaptor',
            'peralatan_poe',
            'peralatan_rj45',
            'peralatan_router_switch',
            'peralatan_ap',
            'peralatan_lainnya',
            'peralatan_lainnya_keterangan',
        ]);

        // Ensure field_engineer_1 is set (even if empty string)
        $data['field_engineer_1'] = $request->input('field_engineer_1', '');
        $data['field_engineer_2'] = null;
        $data['field_engineer_3'] = null;

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
            'detail_action' => 'nullable|string',
            'tipe_cut' => 'nullable|string|max:100',
            'tikor_cut' => 'nullable|string|max:255',
            'tipe_kabel' => 'nullable|string|max:100',
            'keterangan' => 'nullable|string',
            'foto_rumah' => 'nullable|image|max:5120',
            'foto_pemasangan' => 'nullable|image|max:5120',
            // Wireless fields
            'lokasi_site' => 'nullable|string|max:255',
            'area_ruangan' => 'nullable|string|max:255',
            'prioritas' => 'nullable|in:low,medium,high',
            'tanggal_waktu_pengerjaan' => 'nullable|date_format:Y-m-d\TH:i',
            'jenis_perangkat' => 'nullable|string|max:100',
            'brand_perangkat' => 'nullable|string|max:100',
            'model_perangkat' => 'nullable|string|max:100',
            'ip_address_perangkat' => 'nullable|ip',
            'ssid' => 'nullable|string|max:255',
            'interface_radio' => 'nullable|in:2_4ghz,5ghz,dual_band',
            'mac_address' => 'nullable|string|max:50',
            'keluhan_list' => 'nullable|json',
            'keluhan_detail' => 'nullable|string',
            'signal_strength_rssi' => 'nullable|string|max:100',
            'channel' => 'nullable|string|max:50',
            'channel_width' => 'nullable|string|max:50',
            'jumlah_client' => 'nullable|integer',
            'status_dhcp' => 'nullable|in:not_checked,active,error',
            'ping_latency' => 'nullable|string|max:50',
            'packet_loss' => 'nullable|string|max:50',
            'interference' => 'nullable|string',
            'authentication_issue' => 'nullable|string',
            'log_error' => 'nullable|string',
            'tindakan_list' => 'nullable|json',
            'detail_tindakan_wireless' => 'nullable|string',
            'status_koneksi_wireless' => 'nullable|in:unknown,connected,disconnected,unstable',
            'status_internet' => 'nullable|in:unknown,online,offline,intermittent',
            'kondisi_setelah_tindakan' => 'nullable|string',
            'feedback_user' => 'nullable|string',
            'status_akhir' => 'nullable|in:solved,monitoring,escalated',
            'escalation_reason' => 'nullable|string',
            'escalated_to' => 'nullable|string|max:255',
            'catatan_teknisi' => 'nullable|string',
            'rekomendasi_jangka_panjang' => 'nullable|string',
            'rencana_tindak_lanjut' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only([
            'job_type',
            'nama_client',
            'tikor_odp_jb',
            'port_odp',
            'redaman',
            'field_engineer_1',
            'tanggal_pekerjaan',
            'panjang_kabel',
            'detail_action',
            'tipe_cut',
            'tikor_cut',
            'tipe_kabel',
            'keterangan',
            // Wireless fields
            'lokasi_site',
            'area_ruangan',
            'prioritas',
            'tanggal_waktu_pengerjaan',
            'jenis_perangkat',
            'brand_perangkat',
            'model_perangkat',
            'ip_address_perangkat',
            'ssid',
            'interface_radio',
            'mac_address',
            'keluhan_list',
            'keluhan_detail',
            'signal_strength_rssi',
            'channel',
            'channel_width',
            'jumlah_client',
            'status_dhcp',
            'ping_latency',
            'packet_loss',
            'interference',
            'authentication_issue',
            'log_error',
            'tindakan_list',
            'detail_tindakan_wireless',
            'status_koneksi_wireless',
            'status_internet',
            'kondisi_setelah_tindakan',
            'feedback_user',
            'status_akhir',
            'escalation_reason',
            'escalated_to',
            'catatan_teknisi',
            'rekomendasi_jangka_panjang',
            'rencana_tindak_lanjut',
        ]);

        // Ensure field_engineer_1 is set (even if empty string)
        $data['field_engineer_1'] = $request->input('field_engineer_1', '');
        $data['field_engineer_2'] = null;
        $data['field_engineer_3'] = null;

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

        // Delete photos (non-blocking - async would be better but delete sync for now)
        if ($job->foto_rumah) {
            try {
                Storage::disk('public')->delete($job->foto_rumah);
            } catch (\Exception $e) {
                // Log error but don't block deletion
            }
        }
        if ($job->foto_pemasangan) {
            try {
                Storage::disk('public')->delete($job->foto_pemasangan);
            } catch (\Exception $e) {
                // Log error but don't block deletion
            }
        }

        // Delete related photos
        foreach ($job->photos as $photo) {
            try {
                Storage::disk('public')->delete($photo->photo_path);
            } catch (\Exception $e) {
                // Log error but continue
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


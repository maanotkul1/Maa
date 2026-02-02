<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ToolData;
use App\Services\ToolDataService;
use App\Services\QRCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ToolDataController extends Controller
{
    protected $toolDataService;
    protected $qrCodeService;

    public function __construct(ToolDataService $toolDataService, QRCodeService $qrCodeService)
    {
        $this->toolDataService = $toolDataService;
        $this->qrCodeService = $qrCodeService;
    }

    /**
     * Get all tools with filters
     */
    public function index(Request $request)
    {
        $filters = $request->only(['status', 'kategori_tools', 'month', 'search']);
        $perPage = $request->get('per_page', 15);

        $tools = $this->toolDataService->getToolsWithFilters($filters, $perPage);

        return response()->json($tools);
    }

    /**
     * Get single tool
     */
    public function show($id)
    {
        $tool = ToolData::findOrFail($id);

        return response()->json([
            'data' => $tool,
        ]);
    }

    /**
     * Create new tool
     */
    public function store(Request $request)
    {
        // Only admin can create
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nama_tools' => 'required|string|max:255',
            'kategori_tools' => 'required|string|max:100',
            'merek_tipe' => 'nullable|string|max:255',
            'nomor_seri' => 'nullable|string|max:255',
            'kondisi' => 'required|in:baik,rusak,maintenance,hilang',
            'status_kepemilikan' => 'required|in:milik_perusahaan,pribadi_fe',
            'field_engineer_name' => 'nullable|string|max:255',
            'tanggal_terima' => 'nullable|date',
            'catatan_keterangan' => 'nullable|string',
            'foto_tool' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Prepare data for service
            $data = [
                'nama_tools' => $request->nama_tools,
                'kategori_tools' => $request->kategori_tools,
                'data_tools' => [
                    'merek_tipe' => $request->merek_tipe,
                    'nomor_seri' => $request->nomor_seri,
                    'kondisi' => $request->kondisi,
                    'status_kepemilikan' => $request->status_kepemilikan,
                    'field_engineer_name' => $request->field_engineer_name,
                    'tanggal_terima' => $request->tanggal_terima,
                    'catatan_keterangan' => $request->catatan_keterangan,
                ],
            ];

            // Handle file upload
            if ($request->hasFile('foto_tool')) {
                $data['data_tools']['foto_tool'] = $request->file('foto_tool')->store('tools', 'public');
            }

            $tool = $this->toolDataService->createTool($data);

            // Auto-generate kode_tool if not exists (format: T{id_padded})
            if (!isset($tool->data_tools['kode_tool']) || empty($tool->data_tools['kode_tool'])) {
                $kodeTools = $tool->data_tools ?? [];
                $kodeTools['kode_tool'] = 'T' . str_pad($tool->id, 7, '0', STR_PAD_LEFT);
                $tool->update(['data_tools' => $kodeTools]);
            }

            return response()->json([
                'message' => 'Tools berhasil dibuat',
                'data' => $tool,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update tool (with 1-month validation)
     */
    public function update(Request $request, $id)
    {
        // Only admin can update
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tool = ToolData::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nama_tools' => 'sometimes|string|max:255',
            'kategori_tools' => 'sometimes|string|max:100',
            'deskripsi' => 'nullable|string',
            'status' => 'sometimes|in:aktif,non-aktif',
            'data_tools' => 'nullable|array',
            'keterangan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $this->toolDataService->updateTool($tool, $request->all());

            return response()->json([
                'message' => 'Tools berhasil diperbarui',
                'data' => $tool->refresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Delete tool
     */
    public function destroy(Request $request, $id)
    {
        // Only admin can delete
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tool = ToolData::find($id);

        if (!$tool) {
            return response()->json([
                'success' => false,
                'message' => 'Tools tidak ditemukan (ID: ' . $id . ')',
            ], 404);
        }

        try {
            // Hard delete the tool
            $tool->forceDelete();

            // Reset auto-increment tools number if needed
            $this->resetToolNumberSequence();

            return response()->json([
                'success' => true,
                'message' => 'Tools berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset tools number sequence when tools are deleted
     */
    private function resetToolNumberSequence()
    {
        // Get the last tools ID
        $lastTool = ToolData::withTrashed()->latest('id')->first();

        try {
            if ($lastTool) {
                // Set sequence to last tool ID
                \DB::statement("DELETE FROM sqlite_sequence WHERE name='tools_data'");
                \DB::statement("INSERT INTO sqlite_sequence (name, seq) VALUES ('tools_data', " . ($lastTool->id) . ")");
            } else {
                // If no tools left, reset sequence to 0
                \DB::statement("DELETE FROM sqlite_sequence WHERE name='tools_data'");
            }
        } catch (\Exception $e) {
            // For other databases or if sequence doesn't exist, just skip
        }
    }

    /**
     * Get tool history
     */
    public function getHistory($id, Request $request)
    {
        $tool = ToolData::findOrFail($id);
        $perPage = $request->get('per_page', 20);

        $history = $this->toolDataService->getToolHistory($id, $perPage);

        return response()->json([
            'data' => $history,
        ]);
    }

    /**
     * Get tool monthly recaps
     */
    public function getMonthlyRecaps($id, Request $request)
    {
        $tool = ToolData::findOrFail($id);
        $perPage = $request->get('per_page', 12);

        $recaps = $this->toolDataService->getMonthlyRecaps($id, $perPage);

        return response()->json([
            'data' => $recaps,
        ]);
    }

    /**
     * Get statistics
     */
    public function getStatistics()
    {
        $stats = $this->toolDataService->getStatistics();

        return response()->json($stats);
    }

    /**
     * Generate monthly recaps
     */
    public function generateRecaps(Request $request)
    {
        // Only admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $bulanTahun = $request->get('bulan_tahun'); // Optional: specific month
            $count = $this->toolDataService->generateMonthlyRecap($bulanTahun);

            return response()->json([
                'message' => 'Rekap bulanan berhasil dibuat',
                'recap_count' => $count,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Scan custom QR code to get tool update form
     * Can search by:
     * 1. kode_tool (string code like "T0001") - PRIMARY search in JSON data_tools
     * 2. ID (integer) - fallback numeric lookup
     */
    public function scanCustomQR(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tools_number' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $searchTerm = trim($request->tools_number);
            $tool = null;

            // Priority 1: Search by kode_tool in JSON data (case-insensitive)
            $allTools = ToolData::all();
            foreach ($allTools as $t) {
                // Handle both array and string data_tools (for db consistency)
                $dataTools = is_array($t->data_tools) ? $t->data_tools : json_decode($t->data_tools, true);
                if (isset($dataTools['kode_tool'])) {
                    if (strtolower($dataTools['kode_tool']) === strtolower($searchTerm)) {
                        $tool = $t;
                        break;
                    }
                }
            }

            // Priority 2: If not found by kode_tool, try by ID (if numeric)
            if (!$tool && is_numeric($searchTerm)) {
                $tool = ToolData::find((int)$searchTerm);
            }

            // Priority 3: If still not found, search by nama_tools (case-insensitive)
            if (!$tool) {
                $tool = ToolData::where('nama_tools', 'like', '%' . $searchTerm . '%')
                    ->first();
            }

            if (!$tool) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tools tidak ditemukan dengan kode: ' . $searchTerm . '. Pastikan kode tools sudah ada di sistem.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Tools ditemukan',
                'data' => [
                    'id' => $tool->id,
                    'tools_number' => $tool->id,
                    'nama_tools' => $tool->nama_tools,
                    'kategori_tools' => $tool->kategori_tools,
                    'status' => $tool->status,
                    'data_tools' => $tool->data_tools,
                    'last_month_update' => $tool->last_month_update,
                    'created_at' => $tool->created_at,
                    'updated_at' => $tool->updated_at,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tools tidak ditemukan atau terjadi kesalahan: ' . $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update tool data instantly (tanpa tunggu 1 bulan)
     * Endpoint untuk update data tools langsung dari QR Scanner
     */
    public function updateToolInstant(Request $request, $id)
    {
        $tool = ToolData::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'kondisi' => 'nullable|in:baik,rusak,maintenance,hilang',
            'lokasi' => 'nullable|string|max:255',
            'catatan_keterangan' => 'nullable|string',
            'status_kepemilikan' => 'nullable|in:milik_perusahaan,pribadi_fe',
            'field_engineer_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data_tools = $tool->data_tools ?? [];

            // Update fields yang dikirim
            if ($request->has('kondisi')) {
                $data_tools['kondisi'] = $request->kondisi;
            }
            if ($request->has('lokasi')) {
                $data_tools['lokasi'] = $request->lokasi;
            }
            if ($request->has('catatan_keterangan')) {
                $data_tools['catatan_keterangan'] = $request->catatan_keterangan;
            }
            if ($request->has('status_kepemilikan')) {
                $data_tools['status_kepemilikan'] = $request->status_kepemilikan;
            }
            if ($request->has('field_engineer_name')) {
                $data_tools['field_engineer_name'] = $request->field_engineer_name;
            }

            $data_tools['last_updated_at'] = now()->toDateTimeString();

            $tool->data_tools = $data_tools;
            $tool->save();

            return response()->json([
                'success' => true,
                'message' => 'Data tools berhasil diperbarui langsung',
                'data' => $tool,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal update data tools: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate unique tool code for new tools
     * Contoh: T260126001 (T + tanggal + nomor urut)
     */
    public function generateToolCode(Request $request)
    {
        try {
            $date = date('ymd'); // Format: 260122 untuk 26 Januari 2026
            $today_count = ToolData::whereDate('created_at', now())->count();
            $sequence = str_pad($today_count + 1, 3, '0', STR_PAD_LEFT);

            $code = 'T' . $date . $sequence;

            return response()->json([
                'success' => true,
                'code' => $code,
                'description' => 'Kode tool unik (T + tanggal + nomor urut)',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal generate kode: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get QR Code image for tool
     * Returns PNG image data as data URI
     */
    public function getQRCode($id)
    {
        try {
            $tool = ToolData::find($id);

            if (!$tool) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tools tidak ditemukan',
                ], 404);
            }

            // Generate QR code image
            $qrImage = $this->qrCodeService->generateQRCodeImage($tool);

            if (!$qrImage) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal generate QR code',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $tool->id,
                    'kode_tool' => $tool->data_tools['kode_tool'] ?? 'T' . str_pad($tool->id, 7, '0', STR_PAD_LEFT),
                    'nama_tools' => $tool->nama_tools,
                    'qr_image' => $qrImage, // Data URI PNG
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download QR Code as PNG file
     */
    public function downloadQRCode($id)
    {
        try {
            $tool = ToolData::find($id);

            if (!$tool) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tools tidak ditemukan',
                ], 404);
            }

            // Get kode_tool
            $dataTools = is_array($tool->data_tools)
                ? $tool->data_tools
                : json_decode($tool->data_tools, true);

            $kodeTools = $dataTools['kode_tool'] ?? 'T' . str_pad($tool->id, 7, '0', STR_PAD_LEFT);

            // Generate QR code image
            $qrImage = $this->qrCodeService->generateQRCodeImage($tool);

            if (!$qrImage) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal generate QR code',
                ], 500);
            }

            // Extract base64 from data URI and decode
            $imageData = explode(',', $qrImage)[1] ?? '';
            $imageBinary = base64_decode($imageData);

            return response($imageBinary, 200)
                ->header('Content-Type', 'image/png')
                ->header('Content-Disposition', 'attachment; filename="QR_' . $kodeTools . '.png"');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\ToolAssignment;
use App\Models\ToolHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;

class ToolController extends Controller
{
    /**
     * Get list of tools
     */
    public function index(Request $request)
    {
        // Build eager load list based on available schema
        $eagerLoad = ['creator', 'updater'];
        if (Schema::hasColumn('tools', 'field_engineer_id')) {
            $eagerLoad[] = 'fieldEngineer';
        }
        // currentAssignment uses tool_assignments table which should exist
        $eagerLoad[] = 'currentAssignment.fieldEngineer';

        $query = Tool::with($eagerLoad);

        // Filter by kondisi
        if ($request->has('kondisi') && $request->kondisi) {
            $query->where('kondisi', $request->kondisi);
        }

        // Filter by kategori (only if column exists)
        if ($request->has('kategori') && $request->kategori && Schema::hasColumn('tools', 'kategori')) {
            $query->where('kategori', $request->kategori);
        }

        // Filter by jenis (backward compatibility)
        if ($request->has('jenis_tool') && $request->jenis_tool) {
            $query->where('jenis_tool', $request->jenis_tool);
        }

        // Filter by assigned FE (direct assignment via field_engineer_id)
        if ($request->has('field_engineer_id') && $request->field_engineer_id && Schema::hasColumn('tools', 'field_engineer_id')) {
            $query->where('field_engineer_id', $request->field_engineer_id);
        }

        // Filter by status kepemilikan (only if column exists)
        if ($request->has('status_kepemilikan') && $request->status_kepemilikan && Schema::hasColumn('tools', 'status_kepemilikan')) {
            $query->where('status_kepemilikan', $request->status_kepemilikan);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_tool', 'like', "%{$search}%")
                  ->orWhere('nama_tool', 'like', "%{$search}%")
                  ->orWhere('jenis_tool', 'like', "%{$search}%");

                // Only search on columns that exist
                if (Schema::hasColumn('tools', 'kategori')) {
                    $q->orWhere('kategori', 'like', "%{$search}%");
                }
                if (Schema::hasColumn('tools', 'merek_tipe')) {
                    $q->orWhere('merek_tipe', 'like', "%{$search}%");
                }
                if (Schema::hasColumn('tools', 'nomor_seri')) {
                    $q->orWhere('nomor_seri', 'like', "%{$search}%");
                }
            });
        }

        $query->orderBy('created_at', 'desc');

        $perPage = $request->get('per_page', 15);
        $tools = $query->paginate($perPage);

        return response()->json($tools);
    }

    /**
     * Get single tool
     */
    public function show($id)
    {
        $eagerLoad = [
            'creator',
            'updater',
            'assignments.fieldEngineer',
            'assignments.assigner',
            'assignments.returner'
        ];

        if (Schema::hasColumn('tools', 'field_engineer_id')) {
            $eagerLoad[] = 'fieldEngineer';
        }

        $tool = Tool::with($eagerLoad)->findOrFail($id);

        return response()->json($tool);
    }

    /**
     * Create new tool
     */
    public function store(Request $request)
    {
        // Only admin can create tools
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $hasKategori = Schema::hasColumn('tools', 'kategori');
        $hasStatusKepemilikan = Schema::hasColumn('tools', 'status_kepemilikan');

        $validator = Validator::make($request->all(), [
            'kode_tool' => 'nullable|string|max:50|unique:tools,kode_tool',
            'nama_tool' => 'required|string|max:255',
            'kategori' => $hasKategori ? 'required|in:alat_fo,alat_ukur,alat_listrik,alat_mekanik,apd,lainnya' : 'nullable',
            'merek_tipe' => 'nullable|string|max:255',
            'nomor_seri' => 'nullable|string|max:100',
            'kondisi' => 'required|in:baik,rusak,maintenance,hilang,perlu_perbaikan',
            'status_kepemilikan' => $hasStatusKepemilikan ? 'required|in:milik_perusahaan,pribadi_fe' : 'nullable',
            'field_engineer_id' => 'nullable|exists:users,id',
            'field_engineer_name' => 'nullable|string|max:255',
            'tanggal_terima' => 'nullable|date',
            'tanggal_kalibrasi_terakhir' => 'nullable|date',
            'tanggal_maintenance_terakhir' => 'nullable|date',
            'catatan_keterangan' => 'nullable|string',
            'foto_tool' => 'nullable|image|max:5120',
            // Backward compatibility fields
            'jenis_tool' => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string',
            'lokasi' => 'nullable|string|max:255',
            'tanggal_pembelian' => 'nullable|date',
            'harga' => 'nullable|numeric',
            'catatan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only([
            'kode_tool',
            'nama_tool',
            'kategori',
            'merek_tipe',
            'nomor_seri',
            'kondisi',
            'status_kepemilikan',
            'field_engineer_id',
            'field_engineer_name',
            'tanggal_terima',
            'tanggal_kalibrasi_terakhir',
            'tanggal_maintenance_terakhir',
            'catatan_keterangan',
            'jenis_tool', // Backward compatibility
            'deskripsi', // Backward compatibility
            'lokasi', // Backward compatibility
            'tanggal_pembelian', // Backward compatibility
            'harga', // Backward compatibility
            'catatan', // Backward compatibility
        ]);

        // Drop fields that are not present in the current schema (handles sqlite without newer migrations)
        foreach (['kategori', 'merek_tipe', 'nomor_seri', 'status_kepemilikan', 'field_engineer_id', 'field_engineer_name', 'tanggal_terima', 'tanggal_kalibrasi_terakhir', 'tanggal_maintenance_terakhir', 'catatan_keterangan', 'foto_tool'] as $column) {
            if (!Schema::hasColumn('tools', $column)) {
                unset($data[$column]);
            }
        }

        // Backward compatibility: ensure jenis_tool is populated when the column exists and is NOT NULL in older schemas
        if (Schema::hasColumn('tools', 'jenis_tool')) {
            $data['jenis_tool'] = $data['jenis_tool'] ?? ($data['kategori'] ?? 'general');
        }

        // Generate kode_tool if not provided
        if (empty($data['kode_tool'])) {
            $data['kode_tool'] = 'TOOL-' . strtoupper(uniqid());
        }

        // Handle photo upload - use efficient file naming
        if ($request->hasFile('foto_tool') && Schema::hasColumn('tools', 'foto_tool')) {
            $file = $request->file('foto_tool');
            $data['foto_tool'] = $file->storeAs(
                'tools/photos',
                'tool_' . uniqid() . '.' . $file->getClientOriginalExtension(),
                'public'
            );
        }

        $data['created_by'] = $request->user()->id;
        $data['updated_by'] = $request->user()->id;

        $tool = Tool::create($data);

        // Record history
        ToolHistory::create([
            'tool_id' => $tool->id,
            'nama_tool' => $tool->nama_tool,
            'kategori' => $tool->kategori,
            'merek_tipe' => $tool->merek_tipe,
            'nomor_seri' => $tool->nomor_seri,
            'kondisi' => $tool->kondisi,
            'status_kepemilikan' => $tool->status_kepemilikan,
            'field_engineer_id' => $tool->field_engineer_id,
            'field_engineer_name' => $tool->field_engineer_name,
            'tanggal_terima' => $tool->tanggal_terima,
            'catatan_keterangan' => $tool->catatan_keterangan,
            'foto_tool' => $tool->foto_tool,
            'tanggal_update' => now()->toDateString(),
            'created_by' => $request->user()->id,
        ]);

        $loadRelations = ['creator', 'updater'];
        if (Schema::hasColumn('tools', 'field_engineer_id')) {
            $loadRelations[] = 'fieldEngineer';
        }

        return response()->json($tool->load($loadRelations), 201);
    }

    /**
     * Update tool
     */
    public function update(Request $request, $id)
    {
        // Only admin can update tools
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tool = Tool::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'kode_tool' => 'sometimes|string|max:50|unique:tools,kode_tool,' . $id,
            'nama_tool' => 'sometimes|string|max:255',
            'kategori' => 'sometimes|in:alat_fo,alat_ukur,alat_listrik,alat_mekanik,apd,lainnya',
            'merek_tipe' => 'nullable|string|max:255',
            'nomor_seri' => 'nullable|string|max:100',
            'kondisi' => 'sometimes|in:baik,rusak,maintenance,hilang,perlu_perbaikan',
            'status_kepemilikan' => 'sometimes|in:milik_perusahaan,pribadi_fe',
            'field_engineer_id' => 'nullable|exists:users,id',
            'field_engineer_name' => 'nullable|string|max:255',
            'tanggal_terima' => 'nullable|date',
            'tanggal_kalibrasi_terakhir' => 'nullable|date',
            'tanggal_maintenance_terakhir' => 'nullable|date',
            'catatan_keterangan' => 'nullable|string',
            'foto_tool' => 'nullable|image|max:5120',
            // Backward compatibility fields
            'jenis_tool' => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string',
            'lokasi' => 'nullable|string|max:255',
            'tanggal_pembelian' => 'nullable|date',
            'harga' => 'nullable|numeric',
            'catatan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only([
            'kode_tool',
            'nama_tool',
            'kategori',
            'merek_tipe',
            'nomor_seri',
            'kondisi',
            'status_kepemilikan',
            'field_engineer_id',
            'field_engineer_name',
            'tanggal_terima',
            'tanggal_kalibrasi_terakhir',
            'tanggal_maintenance_terakhir',
            'catatan_keterangan',
            'jenis_tool', // Backward compatibility
            'deskripsi', // Backward compatibility
            'lokasi', // Backward compatibility
            'tanggal_pembelian', // Backward compatibility
            'harga', // Backward compatibility
            'catatan', // Backward compatibility
        ]);

        // Drop fields that are not present in the current schema
        foreach (['kategori', 'merek_tipe', 'nomor_seri', 'status_kepemilikan', 'field_engineer_id', 'field_engineer_name', 'tanggal_terima', 'tanggal_kalibrasi_terakhir', 'tanggal_maintenance_terakhir', 'catatan_keterangan', 'foto_tool'] as $column) {
            if (!Schema::hasColumn('tools', $column)) {
                unset($data[$column]);
            }
        }

        // Handle photo upload
        if ($request->hasFile('foto_tool') && Schema::hasColumn('tools', 'foto_tool')) {
            // Delete old photo
            if ($tool->foto_tool) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($tool->foto_tool);
            }
            $data['foto_tool'] = $request->file('foto_tool')->store('tools/photos', 'public');
        }

        $data['updated_by'] = $request->user()->id;

        $tool->update($data);

        // Record history
        ToolHistory::create([
            'tool_id' => $tool->id,
            'nama_tool' => $tool->nama_tool,
            'kategori' => $tool->kategori,
            'merek_tipe' => $tool->merek_tipe,
            'nomor_seri' => $tool->nomor_seri,
            'kondisi' => $tool->kondisi,
            'status_kepemilikan' => $tool->status_kepemilikan,
            'field_engineer_id' => $tool->field_engineer_id,
            'field_engineer_name' => $tool->field_engineer_name,
            'tanggal_terima' => $tool->tanggal_terima,
            'catatan_keterangan' => $tool->catatan_keterangan,
            'foto_tool' => $tool->foto_tool,
            'tanggal_update' => now()->toDateString(),
            'created_by' => $request->user()->id,
        ]);

        $loadRelations = ['creator', 'updater', 'currentAssignment.fieldEngineer'];
        if (Schema::hasColumn('tools', 'field_engineer_id')) {
            $loadRelations[] = 'fieldEngineer';
        }

        return response()->json($tool->load($loadRelations));
    }

    /**
     * Delete tool
     */
    public function destroy(Request $request, $id)
    {
        // Only admin can delete tools
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tool = Tool::findOrFail($id);

        // Check if tool is currently assigned
        $isAssigned = $tool->getCurrentAssignment();
        if (!$isAssigned && Schema::hasColumn('tools', 'field_engineer_id')) {
            $isAssigned = !empty($tool->field_engineer_id);
        }
        if ($isAssigned) {
            return response()->json([
                'message' => 'Cannot delete tool that is currently assigned to a field engineer'
            ], 422);
        }

        // Delete photo if exists (with error handling)
        if (Schema::hasColumn('tools', 'foto_tool') && $tool->foto_tool) {
            try {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($tool->foto_tool);
            } catch (\Exception $e) {
                // Log error but don't block deletion
            }
        }

        $tool->delete();

        return response()->json(['message' => 'Tool deleted successfully'], 200);
    }

    /**
     * Assign tool to field engineer
     */
    public function assign(Request $request, $id)
    {
        // Admin can assign to anyone, FE can only assign to themselves
        if ($request->user()->role === 'fe') {
            // FE can only assign tool to themselves
            $request->merge(['field_engineer_id' => $request->user()->id]);
        } elseif ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tool = Tool::findOrFail($id);

        // Check if tool is already assigned
        if ($tool->getCurrentAssignment()) {
            return response()->json([
                'message' => 'Tool is already assigned to a field engineer'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'field_engineer_id' => $request->user()->role === 'admin' ? 'required|exists:users,id' : 'nullable',
            'tanggal_assign' => 'required|date',
            'keterangan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $assignment = ToolAssignment::create([
            'tool_id' => $tool->id,
            'field_engineer_id' => $request->field_engineer_id,
            'tanggal_assign' => $request->tanggal_assign,
            'status' => 'assigned',
            'keterangan' => $request->keterangan,
            'assigned_by' => $request->user()->id,
        ]);

        return response()->json($assignment->load(['tool', 'fieldEngineer', 'assigner']), 201);
    }

    /**
     * Return tool from field engineer
     */
    public function return(Request $request, $id, $assignmentId)
    {
        // Only admin can return tools
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tool = Tool::findOrFail($id);
        $assignment = ToolAssignment::findOrFail($assignmentId);

        if ($assignment->tool_id !== $tool->id) {
            return response()->json(['message' => 'Assignment not found'], 404);
        }

        if ($assignment->status !== 'assigned') {
            return response()->json([
                'message' => 'Tool is not currently assigned'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'tanggal_return' => 'required|date',
            'kondisi' => 'sometimes|in:baik,rusak,maintenance,hilang,perlu_perbaikan',
            'keterangan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $assignment->update([
            'tanggal_return' => $request->tanggal_return,
            'status' => 'returned',
            'keterangan' => $request->keterangan,
            'returned_by' => $request->user()->id,
        ]);

        // Update tool condition if provided
        if ($request->has('kondisi')) {
            $tool->update(['kondisi' => $request->kondisi]);
        }

        return response()->json($assignment->load(['tool', 'fieldEngineer', 'returner']));
    }

    /**
     * Get tools assigned to current FE
     */
    public function myTools(Request $request)
    {
        if ($request->user()->role !== 'fe') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get tools assigned via field_engineer_id or via assignments
        $hasFieldEngineerId = Schema::hasColumn('tools', 'field_engineer_id');

        $tools = Tool::where(function ($q) use ($request, $hasFieldEngineerId) {
            if ($hasFieldEngineerId) {
                $q->where('field_engineer_id', $request->user()->id);
            }
            $q->orWhereHas('assignments', function ($subQ) use ($request) {
                $subQ->where('field_engineer_id', $request->user()->id)
                     ->where('status', 'assigned');
            });
        });

        $eagerLoad = ['currentAssignment'];
        if ($hasFieldEngineerId) {
            $eagerLoad[] = 'fieldEngineer';
        }

        return response()->json($tools->with($eagerLoad)->get());
    }
}


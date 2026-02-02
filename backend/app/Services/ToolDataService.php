<?php

namespace App\Services;

use App\Models\Tool;
use App\Models\ToolData;
use App\Models\ToolDataHistory;
use App\Models\ToolMonthlyRecap;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ToolDataService
{
    /**
     * Create new tool data
     */
    public function createTool(array $data): ToolData
    {
        $tool = ToolData::create([
            'nama_tools' => $data['nama_tools'],
            'kategori_tools' => $data['kategori_tools'],
            'deskripsi' => $data['deskripsi'] ?? null,
            'status' => $data['status'] ?? 'aktif',
            'data_tools' => $data['data_tools'] ?? [],
            'last_month_update' => Carbon::now()->format('Y-m'),
        ]);

        // Record in history
        $this->recordHistory(
            $tool->id,
            'CREATE',
            null,
            $tool->toArray(),
            'Tools berhasil dibuat'
        );

        return $tool;
    }

    /**
     * Update tool data - removed monthly restriction, auto create recap
     */
    public function updateTool(ToolData $tool, array $data): bool
    {
        // Keep old data for history
        $oldData = $tool->toArray();

        // Create automatic recap of old data before update
        $this->createAutoRecap($tool, $oldData);

        // Update tool
        $tool->update([
            'nama_tools' => $data['nama_tools'] ?? $tool->nama_tools,
            'kategori_tools' => $data['kategori_tools'] ?? $tool->kategori_tools,
            'deskripsi' => $data['deskripsi'] ?? $tool->deskripsi,
            'status' => $data['status'] ?? $tool->status,
            'data_tools' => $data['data_tools'] ?? $tool->data_tools,
            'last_month_update' => Carbon::now()->format('Y-m'),
        ]);

        // Refresh to get updated_at
        $tool->refresh();

        // Record in history
        $this->recordHistory(
            $tool->id,
            'UPDATE',
            $oldData,
            $tool->toArray(),
            $data['keterangan'] ?? 'Tools diperbarui'
        );

        return true;
    }

    /**
     * Create automatic recap before updating tool data
     */
    private function createAutoRecap(ToolData $tool, array $oldData): void
    {
        $currentMonth = Carbon::now()->format('Y-m');

        // Check if recap already exists for current month
        $existingRecap = ToolMonthlyRecap::where('tools_id', $tool->id)
            ->where('bulan_tahun', $currentMonth)
            ->first();

        if (!$existingRecap) {
            // Count changes in current month
            $startDate = Carbon::now()->startOfMonth();
            $endDate = Carbon::now()->endOfMonth();

            $changeCount = ToolDataHistory::where('tools_id', $tool->id)
                ->whereBetween('tanggal_aksi', [$startDate, $endDate])
                ->count();

            // Create recap with snapshot of current data
            ToolMonthlyRecap::create([
                'tools_id' => $tool->id,
                'bulan_tahun' => $currentMonth,
                'data_tools_snapshot' => $oldData,
                'total_perubahan_dalam_bulan' => $changeCount,
                'tanggal_rekap' => Carbon::now(),
            ]);
        }
    }

    /**
     * Delete tool data
     */
    public function deleteTool(ToolData $tool): bool
    {
        $oldData = $tool->toArray();

        // Record before deletion
        $this->recordHistory(
            $tool->id,
            'DELETE',
            $oldData,
            null,
            'Tools dihapus'
        );

        // Soft delete
        $tool->delete();

        return true;
    }

    /**
     * Record history of tool data change
     */
    public function recordHistory(
        int $toolId,
        string $aksi,
        ?array $dataLama,
        ?array $dataBaru,
        string $keterangan = null
    ): ToolDataHistory
    {
        return ToolDataHistory::create([
            'tools_id' => $toolId,
            'aksi' => $aksi,
            'data_lama' => $dataLama,
            'data_baru' => $dataBaru,
            'tanggal_aksi' => Carbon::now(),
            'user_id' => Auth::id(),
            'keterangan' => $keterangan,
        ]);
    }

    /**
     * Generate monthly recap for a specific month
     */
    public function generateMonthlyRecap(string $bulanTahun = null): int
    {
        $bulanTahun = $bulanTahun ?? Carbon::now()->subMonth()->format('Y-m');
        $recapCount = 0;

        // Get all tools
        $tools = ToolData::all();

        foreach ($tools as $tool) {
            // Check if recap already exists
            $existingRecap = ToolMonthlyRecap::where('tools_id', $tool->id)
                ->where('bulan_tahun', $bulanTahun)
                ->exists();

            if (!$existingRecap) {
                // Count changes in this month
                $startDate = Carbon::createFromFormat('Y-m', $bulanTahun)->startOfMonth();
                $endDate = Carbon::createFromFormat('Y-m', $bulanTahun)->endOfMonth();

                $changeCount = ToolDataHistory::where('tools_id', $tool->id)
                    ->whereBetween('tanggal_aksi', [$startDate, $endDate])
                    ->count();

                // Create recap
                ToolMonthlyRecap::create([
                    'tools_id' => $tool->id,
                    'bulan_tahun' => $bulanTahun,
                    'data_tools_snapshot' => $tool->toArray(),
                    'total_perubahan_dalam_bulan' => $changeCount,
                    'tanggal_rekap' => Carbon::now(),
                ]);

                $recapCount++;
            }
        }

        return $recapCount;
    }

    /**
     * Get tool history with pagination
     */
    public function getToolHistory(int $toolId, int $perPage = 20)
    {
        return ToolDataHistory::where('tools_id', $toolId)
            ->with('user')
            ->orderBy('tanggal_aksi', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get monthly recaps for tool
     */
    public function getMonthlyRecaps(int $toolId, int $perPage = 12)
    {
        return ToolMonthlyRecap::where('tools_id', $toolId)
            ->orderBy('bulan_tahun', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get tools with filters
     */
    public function getToolsWithFilters(array $filters, int $perPage = 15)
    {
        $query = ToolData::query();

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by category
        if (!empty($filters['kategori_tools'])) {
            $query->where('kategori_tools', $filters['kategori_tools']);
        }

        // Filter by month
        if (!empty($filters['month'])) {
            $query->where('last_month_update', 'like', $filters['month'] . '%');
        }

        // Search
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama_tools', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('updated_at', 'desc')->paginate($perPage);
    }

    /**
     * Get statistics for dashboard
     */
    public function getStatistics(): array
    {
        // Use Tool model from tools table (primary source of truth)
        $tools = Tool::whereNull('deleted_at')->get();

        // Count assigned tools
        $toolsAssigned = DB::table('tools')
            ->join('tool_assignments', 'tools.id', '=', 'tool_assignments.tool_id')
            ->where('tool_assignments.status', 'assigned')
            ->whereNull('tools.deleted_at')
            ->distinct('tools.id')
            ->count('tools.id');

        return [
            'data' => $tools->map(function ($tool) {
                return [
                    'id' => $tool->id,
                    'kode_tool' => $tool->kode_tool,
                    'nama_tool' => $tool->nama_tool,
                    'kategori' => $tool->kategori,
                    'merek_tipe' => $tool->merek_tipe,
                    'kondisi' => $tool->kondisi,
                    'status_kepemilikan' => $tool->status_kepemilikan,
                    'created_at' => $tool->created_at,
                ];
            })->toArray(),
            'summary' => [
                'total_tools' => $tools->count(),
                'tools_baik' => $tools->where('kondisi', 'baik')->count(),
                'tools_rusak' => $tools->where('kondisi', 'rusak')->count(),
                'tools_perlu_perbaikan' => $tools->where('kondisi', 'perlu_perbaikan')->count(),
                'tools_hilang' => $tools->where('kondisi', 'hilang')->count(),
                'tools_assigned' => $toolsAssigned,
                'total_history' => ToolDataHistory::count(),
                'total_recaps' => ToolMonthlyRecap::count(),
            ]
        ];
    }
}

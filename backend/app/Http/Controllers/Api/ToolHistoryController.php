<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\ToolHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ToolHistoryController extends Controller
{
    /**
     * Get history for a specific tool
     */
    public function getToolHistory($toolId)
    {
        $tool = Tool::findOrFail($toolId);

        $history = ToolHistory::where('tool_id', $toolId)
            ->with(['creator', 'updater'])
            ->orderBy('tanggal_update', 'desc')
            ->get();

        return response()->json([
            'tool' => $tool,
            'history' => $history,
        ]);
    }

    /**
     * Create history entry when tool is updated
     */
    public function recordHistory(Tool $tool)
    {
        $user = Auth::user();

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
            'created_by' => $user?->id,
        ]);
    }

    /**
     * Download all history for a tool as CSV/Excel
     */
    public function downloadHistory($toolId)
    {
        $tool = Tool::findOrFail($toolId);

        $history = ToolHistory::where('tool_id', $toolId)
            ->with(['creator', 'updater'])
            ->orderBy('tanggal_update', 'asc')
            ->get();

        // Create CSV file
        $fileName = "History-Tools-{$tool->nama_tool}-{$tool->kode_tool}-" . now()->format('Y-m-d-His') . ".csv";

        return response()->stream(function () use ($tool, $history) {
            $handle = fopen('php://output', 'w');

            // Set header
            fputcsv($handle, ['Tool History - ' . $tool->nama_tool . ' (' . $tool->kode_tool . ')']);
            fputcsv($handle, []);

            // Headers
            fputcsv($handle, [
                'Tanggal Update',
                'Nama Tool',
                'Kategori',
                'Merek/Tipe',
                'Nomor Seri',
                'Kondisi',
                'Status Kepemilikan',
                'Field Engineer',
                'Tanggal Terima',
                'Catatan/Keterangan',
                'Dibuat Oleh',
                'Dibuat Pada',
            ]);

            // Data rows
            foreach ($history as $record) {
                fputcsv($handle, [
                    $record->tanggal_update?->format('d-m-Y') ?? '-',
                    $record->nama_tool,
                    $record->kategori,
                    $record->merek_tipe ?? '-',
                    $record->nomor_seri ?? '-',
                    ucfirst(str_replace('_', ' ', $record->kondisi)),
                    ucfirst(str_replace('_', ' ', $record->status_kepemilikan)),
                    $record->field_engineer_name ?? '-',
                    $record->tanggal_terima?->format('d-m-Y') ?? '-',
                    $record->catatan_keterangan ?? '-',
                    $record->creator?->name ?? '-',
                    $record->created_at->format('d-m-Y H:i:s'),
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$fileName\"",
        ]);
    }

    /**
     * Download all tool histories as CSV/Excel
     */
    public function downloadAllHistories()
    {
        $histories = ToolHistory::with(['tool', 'creator'])
            ->orderBy('tool_id')
            ->orderBy('tanggal_update', 'asc')
            ->get();

        $fileName = "All-Tools-History-" . now()->format('Y-m-d-His') . ".csv";

        return response()->stream(function () use ($histories) {
            $handle = fopen('php://output', 'w');

            // Set header
            fputcsv($handle, ['All Tools History Report']);
            fputcsv($handle, ['Generated on: ' . now()->format('d-m-Y H:i:s')]);
            fputcsv($handle, []);

            // Headers
            fputcsv($handle, [
                'Kode Tool',
                'Nama Tool',
                'Kategori',
                'Merek/Tipe',
                'Nomor Seri',
                'Kondisi',
                'Status Kepemilikan',
                'Field Engineer',
                'Tanggal Terima',
                'Catatan/Keterangan',
                'Tanggal Update',
                'Dibuat Oleh',
                'Dibuat Pada',
            ]);

            // Data rows
            foreach ($histories as $record) {
                fputcsv($handle, [
                    $record->tool?->kode_tool ?? '-',
                    $record->nama_tool,
                    $record->kategori,
                    $record->merek_tipe ?? '-',
                    $record->nomor_seri ?? '-',
                    ucfirst(str_replace('_', ' ', $record->kondisi)),
                    ucfirst(str_replace('_', ' ', $record->status_kepemilikan)),
                    $record->field_engineer_name ?? '-',
                    $record->tanggal_terima?->format('d-m-Y') ?? '-',
                    $record->catatan_keterangan ?? '-',
                    $record->tanggal_update?->format('d-m-Y') ?? '-',
                    $record->creator?->name ?? '-',
                    $record->created_at->format('d-m-Y H:i:s'),
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$fileName\"",
        ]);
    }

    /**
     * Recap all existing tools data into history table
     */
    public function recapAllTools(Request $request)
    {
        // Only admin can do this
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $user = $request->user();
            $recapCount = 0;
            $skipCount = 0;

            // Get all tools
            $tools = Tool::all();

            foreach ($tools as $tool) {
                // Check if tool already has history
                $existingHistory = ToolHistory::where('tool_id', $tool->id)->exists();

                if (!$existingHistory) {
                    // Create initial history record for this tool
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
                        'tanggal_update' => $tool->created_at->toDateString(),
                        'created_by' => $user->id,
                    ]);
                    $recapCount++;
                } else {
                    $skipCount++;
                }
            }

            return response()->json([
                'message' => 'Recap data tools berhasil dilakukan',
                'recap_count' => $recapCount,
                'skip_count' => $skipCount,
                'total_tools' => count($tools),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal melakukan recap data tools',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

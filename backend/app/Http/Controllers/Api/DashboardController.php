<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HistoryJob;
use App\Models\Tool;
use App\Models\ToolAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get admin dashboard data
     */
    public function admin(Request $request)
    {
        // Single query for history jobs statistics by status and job_type (exclude soft deletes)
        $historyJobStats = DB::table('history_jobs')
            ->whereNull('deleted_at')
            ->select('status', 'job_type', DB::raw('count(*) as count'))
            ->groupBy('status', 'job_type')
            ->get();

        // Query for kategori_job statistics (for FO and Wireless troubleshooting)
        $historyJobByKategori = DB::table('history_jobs')
            ->whereNull('deleted_at')
            ->select('kategori_job', DB::raw('count(*) as count'))
            ->groupBy('kategori_job')
            ->get();

        // Calculate history job totals from queries
        $historyJobsByStatus = $historyJobStats->groupBy('status')->map(fn($group) => $group->sum('count'));
        $historyJobsByType = $historyJobStats->groupBy('job_type')->map(fn($group) => $group->sum('count'));
        $historyJobsByKategori = $historyJobByKategori->groupBy('kategori_job')->map(fn($group) => $group->sum('count'));

        $totalHistoryJobs = $historyJobStats->sum('count');
        $historyJobsCompleted = $historyJobsByStatus->get('completed', 0);
        $historyJobsInstalasi = $historyJobsByType->get('instalasi', 0);
        $historyJobsTroubleshooting = $historyJobsByType->get('troubleshooting', 0);
        // FO can be from job_type 'troubleshooting_fo' or from kategori_job 'troubleshooting_fo'
        $historyJobsFO = ($historyJobsByType->get('troubleshooting_fo', 0) + $historyJobsByKategori->get('troubleshooting_fo', 0));
        // Wireless can be from job_type 'troubleshooting_wireless' or from kategori_job 'troubleshooting_wireless'
        $historyJobsWireless = ($historyJobsByType->get('troubleshooting_wireless', 0) + $historyJobsByKategori->get('troubleshooting_wireless', 0));

        // Get all tools from tools_data table and extract kondisi from JSON
        $allTools = DB::table('tools_data')->whereNull('deleted_at')->get();

        // Count by kondisi and status_kepemilikan from data_tools JSON
        $kondisiCounts = [];
        $kepemilikanCounts = [];

        foreach($allTools as $tool) {
            $dataTools = is_array($tool->data_tools) ? $tool->data_tools : json_decode($tool->data_tools, true);

            // Count by kondisi
            $kondisi = $dataTools['kondisi'] ?? null;
            if ($kondisi) {
                if (!isset($kondisiCounts[$kondisi])) {
                    $kondisiCounts[$kondisi] = 0;
                }
                $kondisiCounts[$kondisi]++;
            }

            // Count by kepemilikan
            $kepemilikan = $dataTools['status_kepemilikan'] ?? null;
            if ($kepemilikan) {
                if (!isset($kepemilikanCounts[$kepemilikan])) {
                    $kepemilikanCounts[$kepemilikan] = 0;
                }
                $kepemilikanCounts[$kepemilikan]++;
            }
        }

        $totalTools = count($allTools);
        $toolsBaik = $kondisiCounts['baik'] ?? 0;
        $toolsRusak = $kondisiCounts['rusak'] ?? 0;
        // Maintenance can be from 'maintenance' or 'perlu_perbaikan'
        $toolsPerluPerbaikan = ($kondisiCounts['maintenance'] ?? 0) + ($kondisiCounts['perlu_perbaikan'] ?? 0);
        $toolsHilang = $kondisiCounts['hilang'] ?? 0;

        // Tools assigned count - check for 'assigned' status in kepemilikan or from assignment table
        $toolsAssigned = $kepemilikanCounts['assigned'] ?? 0;

        // Format data for charts
        $toolsByKondisi = collect($kondisiCounts);

        // Calculate percentages for tools
        $toolsPercentages = [];
        if ($totalTools > 0) {
            $toolsPercentages = [
                'baik' => round(($toolsBaik / $totalTools) * 100, 2),
                'rusak' => round(($toolsRusak / $totalTools) * 100, 2),
                'perlu_perbaikan' => round(($toolsPerluPerbaikan / $totalTools) * 100, 2),
                'hilang' => round(($toolsHilang / $totalTools) * 100, 2),
                'assigned' => round(($toolsAssigned / $totalTools) * 100, 2),
            ];
        }

        // Calculate percentages for history jobs (removed pending & cancelled - only completed)
        $historyJobsPercentages = [];
        if ($totalHistoryJobs > 0) {
            $historyJobsPercentages = [
                'completed' => round(($historyJobsCompleted / $totalHistoryJobs) * 100, 2),
                'instalasi' => round(($historyJobsInstalasi / $totalHistoryJobs) * 100, 2),
                'troubleshooting' => round(($historyJobsTroubleshooting / $totalHistoryJobs) * 100, 2),
                'fo' => round(($historyJobsFO / $totalHistoryJobs) * 100, 2),
                'wireless' => round(($historyJobsWireless / $totalHistoryJobs) * 100, 2),
            ];
        }

        // Recent history jobs with all relations loaded
        $recentHistoryJobs = HistoryJob::with(['creator:id,name,email', 'photos'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'summary' => [
                'total_history_jobs' => $totalHistoryJobs,
                'history_jobs_completed' => $historyJobsCompleted,
                'history_jobs_instalasi' => $historyJobsInstalasi,
                'history_jobs_troubleshooting' => $historyJobsTroubleshooting,
                'history_jobs_fo' => $historyJobsFO,
                'history_jobs_wireless' => $historyJobsWireless,
                'total_tools' => $totalTools,
                'tools_baik' => $toolsBaik,
                'tools_rusak' => $toolsRusak,
                'tools_perlu_perbaikan' => $toolsPerluPerbaikan,
                'tools_hilang' => $toolsHilang,
                'tools_assigned' => $toolsAssigned,
            ],
            'percentages' => [
                'tools' => $toolsPercentages,
                'history_jobs' => $historyJobsPercentages,
            ],
            'charts' => [
                'history_jobs_by_status' => $historyJobsByStatus,
                'history_jobs_by_type' => $historyJobsByType,
                'tools_by_kondisi' => $toolsByKondisi,
            ],
            'recent_history_jobs' => $recentHistoryJobs,
        ], 200, [
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Get FE dashboard data (kept for compatibility, but redirects to admin)
     */
    public function fe(Request $request)
    {
        // Since only admin exists, return admin data
        return $this->admin($request);
    }
}


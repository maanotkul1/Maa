<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get admin dashboard data
     */
    public function admin(Request $request)
    {
        // Total jobs today (by tanggal field)
        $totalJobsToday = Job::whereDate('tanggal', today())->count();

        // Jobs by status today
        $jobsDone = Job::whereDate('tanggal', today())
            ->where('status', 'done')
            ->count();

        $jobsWaiting = Job::whereDate('tanggal', today())
            ->where('status', 'waiting')
            ->count();

        $jobsOpen = Job::whereDate('tanggal', today())
            ->where('status', 'open')
            ->count();

        $jobsReschedule = Job::whereDate('tanggal', today())
            ->where('status', 're-schedule')
            ->count();

        // Jobs by status (all time, for chart)
        $jobsByStatus = Job::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        // Jobs by Petugas 1 (for chart)
        $jobsByFe = Job::select('petugas_1 as name', DB::raw('count(*) as count'))
            ->whereNotNull('petugas_1')
            ->where('petugas_1', '!=', '')
            ->groupBy('petugas_1')
            ->get();

        // Recent jobs
        $recentJobs = Job::with(['assignedFe', 'creator'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'summary' => [
                'total_jobs_today' => $totalJobsToday,
                'jobs_done' => $jobsDone,
                'jobs_waiting' => $jobsWaiting,
                'jobs_open' => $jobsOpen,
                'jobs_reschedule' => $jobsReschedule,
            ],
            'charts' => [
                'jobs_by_status' => $jobsByStatus,
                'jobs_by_fe' => $jobsByFe,
            ],
            'recent_jobs' => $recentJobs,
        ]);
    }

    /**
     * Get FE dashboard data
     */
    public function fe(Request $request)
    {
        $userName = $request->user()->name;

        // Total jobs today (assigned to this FE by name)
        $totalJobsToday = Job::whereDate('tanggal', today())
            ->where(function($q) use ($userName) {
                $q->where('petugas_1', $userName)
                  ->orWhere('petugas_2', $userName)
                  ->orWhere('petugas_3', $userName);
            })
            ->count();

        // Jobs by status today
        $jobsDone = Job::whereDate('tanggal', today())
            ->where('status', 'done')
            ->where(function($q) use ($userName) {
                $q->where('petugas_1', $userName)
                  ->orWhere('petugas_2', $userName)
                  ->orWhere('petugas_3', $userName);
            })
            ->count();

        $jobsWaiting = Job::whereDate('tanggal', today())
            ->where('status', 'waiting')
            ->where(function($q) use ($userName) {
                $q->where('petugas_1', $userName)
                  ->orWhere('petugas_2', $userName)
                  ->orWhere('petugas_3', $userName);
            })
            ->count();

        $jobsOpen = Job::whereDate('tanggal', today())
            ->where('status', 'open')
            ->where(function($q) use ($userName) {
                $q->where('petugas_1', $userName)
                  ->orWhere('petugas_2', $userName)
                  ->orWhere('petugas_3', $userName);
            })
            ->count();

        // Today's jobs
        $todayJobs = Job::whereDate('tanggal', today())
            ->where(function($q) use ($userName) {
                $q->where('petugas_1', $userName)
                  ->orWhere('petugas_2', $userName)
                  ->orWhere('petugas_3', $userName);
            })
            ->with(['creator'])
            ->orderBy('janji_datang', 'asc')
            ->get();

        // This week's jobs
        $weekStart = now()->startOfWeek();
        $weekEnd = now()->endOfWeek();
        
        $weekJobs = Job::whereBetween('tanggal', [$weekStart, $weekEnd])
            ->whereNotIn('status', ['done'])
            ->where(function($q) use ($userName) {
                $q->where('petugas_1', $userName)
                  ->orWhere('petugas_2', $userName)
                  ->orWhere('petugas_3', $userName);
            })
            ->with(['creator'])
            ->orderBy('tanggal', 'asc')
            ->get();

        return response()->json([
            'summary' => [
                'total_jobs_today' => $totalJobsToday,
                'jobs_done' => $jobsDone,
                'jobs_waiting' => $jobsWaiting,
                'jobs_open' => $jobsOpen,
            ],
            'today_jobs' => $todayJobs,
            'week_jobs' => $weekJobs,
        ]);
    }
}


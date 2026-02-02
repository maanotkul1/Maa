<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GoogleSheetService;
use Illuminate\Http\Request;

class GoogleSheetController extends Controller
{
    protected $googleSheetService;

    public function __construct(GoogleSheetService $googleSheetService)
    {
        $this->googleSheetService = $googleSheetService;
    }

    /**
     * Check if Google Sheets is configured
     */
    public function status()
    {
        return response()->json([
            'configured' => $this->googleSheetService->isConfigured(),
            'spreadsheet_id' => config('services.google.spreadsheet_id'),
        ]);
    }

    /**
     * Sync history jobs to Google Sheets
     */
    public function syncHistoryJobs(Request $request)
    {
        if (!$this->googleSheetService->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Google Sheets is not configured'
            ], 400);
        }

        $success = $this->googleSheetService->syncHistoryJobs();

        return response()->json([
            'success' => $success,
            'message' => $success
                ? 'History Jobs synced successfully to Google Sheets'
                : 'Failed to sync History Jobs to Google Sheets'
        ]);
    }

    /**
     * Sync tools to Google Sheets
     */
    public function syncTools(Request $request)
    {
        if (!$this->googleSheetService->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Google Sheets is not configured'
            ], 400);
        }

        $success = $this->googleSheetService->syncTools();

        return response()->json([
            'success' => $success,
            'message' => $success
                ? 'Tools synced successfully to Google Sheets'
                : 'Failed to sync Tools to Google Sheets'
        ]);
    }

    /**
     * Sync all data to Google Sheets
     */
    public function syncAll(Request $request)
    {
        if (!$this->googleSheetService->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Google Sheets is not configured'
            ], 400);
        }

        $historyJobsSuccess = $this->googleSheetService->syncHistoryJobs();
        $toolsSuccess = $this->googleSheetService->syncTools();

        return response()->json([
            'success' => $historyJobsSuccess && $toolsSuccess,
            'history_jobs' => $historyJobsSuccess ? 'synced' : 'failed',
            'tools' => $toolsSuccess ? 'synced' : 'failed',
            'message' => ($historyJobsSuccess && $toolsSuccess)
                ? 'All data synced successfully to Google Sheets'
                : 'Some data failed to sync to Google Sheets'
        ]);
    }
}

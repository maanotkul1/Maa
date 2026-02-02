<?php

namespace App\Observers;

use App\Models\HistoryJob;
use App\Services\GoogleSheetService;
use Illuminate\Support\Facades\Log;

class HistoryJobObserver
{
    protected $googleSheetService;

    public function __construct(GoogleSheetService $googleSheetService)
    {
        $this->googleSheetService = $googleSheetService;
    }

    /**
     * Handle the HistoryJob "created" event.
     */
    public function created(HistoryJob $historyJob): void
    {
        try {
            $this->googleSheetService->syncHistoryJobs();
        } catch (\Exception $e) {
            Log::error('Failed to sync history job to Google Sheets on create: ' . $e->getMessage());
        }
    }

    /**
     * Handle the HistoryJob "updated" event.
     */
    public function updated(HistoryJob $historyJob): void
    {
        try {
            $this->googleSheetService->syncHistoryJobs();
        } catch (\Exception $e) {
            Log::error('Failed to sync history job to Google Sheets on update: ' . $e->getMessage());
        }
    }

    /**
     * Handle the HistoryJob "deleted" event.
     */
    public function deleted(HistoryJob $historyJob): void
    {
        try {
            $this->googleSheetService->syncHistoryJobs();
        } catch (\Exception $e) {
            Log::error('Failed to sync history jobs to Google Sheets on delete: ' . $e->getMessage());
        }
    }

    /**
     * Handle the HistoryJob "restored" event.
     */
    public function restored(HistoryJob $historyJob): void
    {
        try {
            $this->googleSheetService->syncHistoryJobs();
        } catch (\Exception $e) {
            Log::error('Failed to sync history jobs to Google Sheets on restore: ' . $e->getMessage());
        }
    }
}

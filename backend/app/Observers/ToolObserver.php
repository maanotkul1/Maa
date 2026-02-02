<?php

namespace App\Observers;

use App\Models\Tool;
use App\Services\GoogleSheetService;
use Illuminate\Support\Facades\Log;

class ToolObserver
{
    protected $googleSheetService;

    public function __construct(GoogleSheetService $googleSheetService)
    {
        $this->googleSheetService = $googleSheetService;
    }

    /**
     * Handle the Tool "created" event.
     */
    public function created(Tool $tool): void
    {
        try {
            $this->googleSheetService->syncTools();
        } catch (\Exception $e) {
            Log::error('Failed to sync tool to Google Sheets on create: ' . $e->getMessage());
        }
    }

    /**
     * Handle the Tool "updated" event.
     */
    public function updated(Tool $tool): void
    {
        try {
            $this->googleSheetService->syncTools();
        } catch (\Exception $e) {
            Log::error('Failed to sync tool to Google Sheets on update: ' . $e->getMessage());
        }
    }

    /**
     * Handle the Tool "deleted" event.
     */
    public function deleted(Tool $tool): void
    {
        try {
            $this->googleSheetService->syncTools();
        } catch (\Exception $e) {
            Log::error('Failed to sync tools to Google Sheets on delete: ' . $e->getMessage());
        }
    }

    /**
     * Handle the Tool "restored" event.
     */
    public function restored(Tool $tool): void
    {
        try {
            $this->googleSheetService->syncTools();
        } catch (\Exception $e) {
            Log::error('Failed to sync tools to Google Sheets on restore: ' . $e->getMessage());
        }
    }
}

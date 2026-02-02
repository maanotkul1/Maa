<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\GoogleSheetService;

class SyncGoogleSheets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sheets:sync {--history-jobs} {--tools} {--all}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync data to Google Sheets (History Jobs and/or Tools)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $googleSheetService = app(GoogleSheetService::class);

        if (!$googleSheetService->isConfigured()) {
            $this->error('Google Sheets is not configured. Please check your credentials.');
            return 1;
        }

        $syncHistoryJobs = $this->option('history-jobs') || $this->option('all');
        $syncTools = $this->option('tools') || $this->option('all');

        // If no specific option, sync all
        if (!$syncHistoryJobs && !$syncTools) {
            $syncHistoryJobs = true;
            $syncTools = true;
        }

        if ($syncHistoryJobs) {
            $this->info('Syncing History Jobs...');
            if ($googleSheetService->syncHistoryJobs()) {
                $this->info('✓ History Jobs synced successfully');
            } else {
                $this->error('✗ Failed to sync History Jobs');
            }
        }

        if ($syncTools) {
            $this->info('Syncing Tools...');
            if ($googleSheetService->syncTools()) {
                $this->info('✓ Tools synced successfully');
            } else {
                $this->error('✗ Failed to sync Tools');
            }
        }

        $this->info('Done!');
        return 0;
    }
}

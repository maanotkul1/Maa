<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\HistoryJob;
use App\Models\Tool;
use App\Observers\HistoryJobObserver;
use App\Observers\ToolObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers for Google Sheets sync
        HistoryJob::observe(HistoryJobObserver::class);
        Tool::observe(ToolObserver::class);
    }
}

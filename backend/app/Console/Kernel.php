<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Generate monthly recaps setiap hari 1 bulan pada jam 00:00
        // Atau bisa dijalankan manually dengan: php artisan tool:generate-monthly-recaps
        $schedule->command('tool:generate-monthly-recaps')
                 ->monthlyOn(1, '00:00')
                 ->description('Generate monthly recaps untuk semua tools');

        // Alternatif: Jalankan setiap akhir bulan
        // Bisa gunakan package tambahan atau set ini dengan cron yang lebih kompleks
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}

<?php

namespace App\Console\Commands;

use App\Services\ToolDataService;
use Illuminate\Console\Command;

class GenerateToolMonthlyRecaps extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tool:generate-monthly-recaps {--month= : Bulan dalam format Y-m}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate monthly recap for all tools. Biasanya dijalankan setiap akhir bulan.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $service = app(ToolDataService::class);

        // Get month from option or use last month
        $month = $this->option('month') ?? \Carbon\Carbon::now()->subMonth()->format('Y-m');

        try {
            $count = $service->generateMonthlyRecap($month);

            $this->info("✓ Successfully generated {$count} monthly recaps for {$month}");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("✗ Error: " . $e->getMessage());

            return Command::FAILURE;
        }
    }
}

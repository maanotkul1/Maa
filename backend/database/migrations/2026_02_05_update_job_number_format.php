<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration updates job number format based on job_type:
     * - Troubleshooting FO: TF + YY + MM + Counter (e.g., TF260200)
     * - Troubleshooting Wireless: TW + YY + MM + Counter (e.g., TW260200)
     * - Instalasi: J + YY + MM + Counter (e.g., J260200) - unchanged
     */
    public function up(): void
    {
        // Get all history jobs
        $jobs = DB::table('history_jobs')->get();

        foreach ($jobs as $job) {
            $newJobNumber = null;

            // Determine new prefix and extract numeric part
            if ($job->job_type === 'troubleshooting_fo') {
                $newJobNumber = $this->convertToFormat($job->job_number, 'TF');
            } elseif ($job->job_type === 'troubleshooting_wireless') {
                $newJobNumber = $this->convertToFormat($job->job_number, 'TW');
            } else {
                // Instalasi - ensure J format
                $newJobNumber = $this->convertToFormat($job->job_number, 'J');
            }

            if ($newJobNumber && $newJobNumber !== $job->job_number) {
                DB::table('history_jobs')
                    ->where('id', $job->id)
                    ->update(['job_number' => $newJobNumber]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert job numbers back to J format for all
        $jobs = DB::table('history_jobs')->get();

        foreach ($jobs as $job) {
            if (preg_match('/^(TF|TW|J)(.+)$/', $job->job_number, $matches)) {
                $newJobNumber = 'J' . $matches[2];
                if ($newJobNumber !== $job->job_number) {
                    DB::table('history_jobs')
                        ->where('id', $job->id)
                        ->update(['job_number' => $newJobNumber]);
                }
            }
        }
    }

    /**
     * Convert job number to target format
     */
    private function convertToFormat(string $jobNumber, string $targetPrefix): ?string
    {
        // Extract numeric part (everything after the prefix)
        if (preg_match('/^(?:J|TF|TW)(.+)$/', $jobNumber, $matches)) {
            return $targetPrefix . $matches[1];
        }

        return null;
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Delete all existing history jobs to reset with new format
        DB::table('history_jobs')->truncate();
        DB::table('history_job_photos')->truncate();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Migration is irreversible - this truncates data
    }
};

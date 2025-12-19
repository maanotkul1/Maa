<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For SQLite, we need to recreate the table
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('job_status_logs', function (Blueprint $table) {
                $table->dropColumn(['old_status', 'new_status']);
            });
            
            Schema::table('job_status_logs', function (Blueprint $table) {
                $table->string('old_status')->nullable()->after('job_id');
                $table->string('new_status')->after('old_status');
            });
        } else {
            // For MySQL/PostgreSQL
            DB::statement("ALTER TABLE job_status_logs MODIFY COLUMN old_status ENUM('done', 're-schedule', 'waiting', 'open', 'assigned', 'on_progress', 'pending', 'canceled', 'overdue') NULL");
            DB::statement("ALTER TABLE job_status_logs MODIFY COLUMN new_status ENUM('done', 're-schedule', 'waiting', 'open', 'assigned', 'on_progress', 'pending', 'canceled', 'overdue') NOT NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('job_status_logs', function (Blueprint $table) {
                $table->dropColumn(['old_status', 'new_status']);
            });
            
            Schema::table('job_status_logs', function (Blueprint $table) {
                $table->enum('old_status', ['open', 'assigned', 'on_progress', 'pending', 'done', 'canceled', 'overdue'])->nullable()->after('job_id');
                $table->enum('new_status', ['open', 'assigned', 'on_progress', 'pending', 'done', 'canceled', 'overdue'])->after('old_status');
            });
        } else {
            DB::statement("ALTER TABLE job_status_logs MODIFY COLUMN old_status ENUM('open', 'assigned', 'on_progress', 'pending', 'done', 'canceled', 'overdue') NULL");
            DB::statement("ALTER TABLE job_status_logs MODIFY COLUMN new_status ENUM('open', 'assigned', 'on_progress', 'pending', 'done', 'canceled', 'overdue') NOT NULL");
        }
    }
};


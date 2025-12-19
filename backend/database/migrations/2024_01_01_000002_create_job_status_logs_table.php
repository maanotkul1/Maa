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
        Schema::create('job_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('field_jobs')->onDelete('cascade');
            $table->enum('old_status', ['done', 're-schedule', 'waiting', 'open', 'assigned', 'on_progress', 'pending', 'canceled', 'overdue'])->nullable();
            $table->enum('new_status', ['done', 're-schedule', 'waiting', 'open', 'assigned', 'on_progress', 'pending', 'canceled', 'overdue']);
            $table->foreignId('changed_by')->constrained('users')->onDelete('cascade');
            $table->text('note')->nullable();
            $table->timestamps();
            
            $table->index('job_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_status_logs');
    }
};


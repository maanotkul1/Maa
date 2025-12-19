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
        Schema::create('field_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('job_number')->unique();
            $table->string('title');
            $table->enum('job_type', ['installasi', 'gangguan', 'survey', 'maintenance', 'lainnya'])->default('installasi');
            $table->text('location_address');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('description')->nullable();
            $table->foreignId('assigned_fe_id')->nullable()->constrained('users')->onDelete('set null');
            $table->date('scheduled_date');
            $table->datetime('deadline_at')->nullable();
            $table->enum('status', ['open', 'assigned', 'on_progress', 'pending', 'done', 'canceled', 'overdue'])->default('open');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['status', 'scheduled_date']);
            $table->index('assigned_fe_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('field_jobs');
    }
};


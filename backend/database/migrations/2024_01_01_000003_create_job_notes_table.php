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
        Schema::create('job_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('field_jobs')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('note_type', ['progress', 'result', 'issue', 'admin_instruction'])->default('progress');
            $table->text('content');
            $table->timestamps();
            
            $table->index('job_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_notes');
    }
};


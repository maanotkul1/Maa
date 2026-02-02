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
        Schema::create('history_job_photos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('history_job_id');
            $table->string('photo_path');
            $table->enum('photo_type', ['rumah', 'pemasangan', 'other'])->default('other');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('history_job_id')->references('id')->on('history_jobs')->onDelete('cascade');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('history_job_id');
            $table->index('photo_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('history_job_photos');
    }
};


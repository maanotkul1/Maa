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
        Schema::create('job_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('field_jobs')->onDelete('cascade');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->string('photo_url');
            $table->string('caption')->nullable();
            $table->enum('photo_type', ['before', 'process', 'after', 'other'])->default('other');
            $table->timestamps();
            
            $table->index('job_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_photos');
    }
};


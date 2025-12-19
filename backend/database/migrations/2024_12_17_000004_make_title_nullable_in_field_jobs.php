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
        Schema::table('field_jobs', function (Blueprint $table) {
            $table->string('title')->nullable()->change();
            $table->string('job_type')->nullable()->change();
            $table->text('location_address')->nullable()->change();
            $table->date('scheduled_date')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('field_jobs', function (Blueprint $table) {
            $table->string('title')->nullable(false)->change();
            $table->enum('job_type', ['installasi', 'gangguan', 'survey', 'maintenance', 'lainnya'])->default('installasi')->change();
            $table->text('location_address')->nullable(false)->change();
            $table->date('scheduled_date')->nullable(false)->change();
        });
    }
};


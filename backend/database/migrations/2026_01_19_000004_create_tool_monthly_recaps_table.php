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
        Schema::create('tool_monthly_recaps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tools_id');
            $table->string('bulan_tahun'); // Format: 2026-01
            $table->json('data_tools_snapshot'); // Snapshot data tools pada akhir bulan
            $table->integer('total_perubahan_dalam_bulan')->default(0); // Total history dalam bulan
            $table->timestamp('tanggal_rekap')->useCurrent();
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('tools_id')->references('id')->on('tools_data')->onDelete('cascade');

            // Indexes dan constraint
            $table->index('tools_id');
            $table->index('bulan_tahun');
            $table->unique(['tools_id', 'bulan_tahun']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_monthly_recaps');
    }
};

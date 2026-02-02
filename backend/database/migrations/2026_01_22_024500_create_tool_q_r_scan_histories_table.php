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
        Schema::create('tool_q_r_scan_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tool_qr_update_id')->index();
            $table->unsignedBigInteger('tools_data_id')->index();
            $table->string('scan_code')->unique(); // Untuk tracking scan
            $table->dateTime('scanned_at');
            $table->string('device_type')->nullable(); // mobile, web
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('scan_data')->nullable(); // Data saat scan
            $table->enum('status', ['success', 'failed', 'invalid'])->default('success');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('tool_qr_update_id')
                ->references('id')
                ->on('tool_q_r_updates')
                ->onDelete('cascade');

            $table->foreign('tools_data_id')
                ->references('id')
                ->on('tools_data')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_q_r_scan_histories');
    }
};

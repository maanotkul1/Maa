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
        Schema::create('tool_q_r_updates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tools_data_id')->index();
            $table->string('qr_code')->unique();
            $table->string('qr_hash')->unique();
            $table->dateTime('generated_at');
            $table->dateTime('expired_at')->nullable();
            $table->dateTime('last_scanned_at')->nullable();
            $table->integer('scan_count')->default(0);
            $table->enum('status', ['active', 'expired', 'used'])->default('active');
            $table->json('scan_history')->nullable();
            $table->timestamps();
            $table->softDeletes();

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
        Schema::dropIfExists('tool_q_r_updates');
    }
};

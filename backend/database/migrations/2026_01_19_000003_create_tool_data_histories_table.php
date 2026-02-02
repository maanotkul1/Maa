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
        Schema::create('tool_data_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tools_id');
            $table->enum('aksi', ['CREATE', 'UPDATE', 'DELETE'])->default('UPDATE');
            $table->json('data_lama')->nullable(); // Snapshot data sebelum diubah
            $table->json('data_baru')->nullable(); // Snapshot data setelah diubah
            $table->timestamp('tanggal_aksi')->useCurrent();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->text('keterangan')->nullable(); // Deskripsi perubahan
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('tools_id')->references('id')->on('tools_data')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index('tools_id');
            $table->index('aksi');
            $table->index('tanggal_aksi');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_data_histories');
    }
};

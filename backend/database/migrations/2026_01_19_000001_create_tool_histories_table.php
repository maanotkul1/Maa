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
        Schema::create('tool_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tool_id');
            $table->string('nama_tool');
            $table->string('kategori');
            $table->string('merek_tipe')->nullable();
            $table->string('nomor_seri')->nullable();
            $table->string('kondisi');
            $table->string('status_kepemilikan');
            $table->unsignedBigInteger('field_engineer_id')->nullable();
            $table->string('field_engineer_name')->nullable();
            $table->date('tanggal_terima')->nullable();
            $table->text('catatan_keterangan')->nullable();
            $table->string('foto_tool')->nullable();
            $table->date('tanggal_update')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('tool_id')->references('id')->on('tools')->onDelete('cascade');
            $table->foreign('field_engineer_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index('tool_id');
            $table->index('tanggal_update');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_histories');
    }
};

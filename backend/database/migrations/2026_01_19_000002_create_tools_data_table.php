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
        Schema::create('tools_data', function (Blueprint $table) {
            $table->id();
            $table->string('nama_tools');
            $table->string('kategori_tools');
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['aktif', 'non-aktif'])->default('aktif');
            $table->json('data_tools')->nullable(); // JSON untuk menyimpan field-field tools
            $table->string('last_month_update')->nullable(); // Format: 2026-01
            $table->timestamps();
            $table->softDeletes();

            $table->index('kategori_tools');
            $table->index('status');
            $table->index('last_month_update');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tools_data');
    }
};

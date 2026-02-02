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
        Schema::create('tools', function (Blueprint $table) {
            $table->id();
            $table->string('kode_tool')->unique();
            $table->string('nama_tool');
            $table->string('jenis_tool'); // e.g., 'multimeter', 'crimping_tool', 'fiber_tester', etc.
            $table->enum('kondisi', ['baik', 'rusak', 'perlu_perbaikan', 'hilang'])->default('baik');
            $table->text('deskripsi')->nullable();
            $table->string('lokasi')->nullable(); // Where the tool is currently located
            $table->date('tanggal_pembelian')->nullable();
            $table->decimal('harga', 12, 2)->nullable();
            $table->text('catatan')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('jenis_tool');
            $table->index('kondisi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tools');
    }
};


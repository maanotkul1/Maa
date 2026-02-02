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
        Schema::create('history_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('job_number')->unique();
            $table->enum('job_type', ['instalasi', 'troubleshooting'])->default('instalasi');
            
            // Common fields
            $table->string('nama_client');
            $table->string('tikor_odp_jb'); // Tikor ODP untuk instalasi, Tikor ODP/JB untuk troubleshooting
            $table->string('port_odp');
            $table->string('foto_rumah')->nullable();
            $table->string('foto_pemasangan')->nullable();
            $table->decimal('redaman', 8, 2)->nullable();
            $table->unsignedBigInteger('field_engineer_id');
            $table->date('tanggal_pekerjaan');
            
            // Fields for Instalasi
            $table->decimal('panjang_kabel', 8, 2)->nullable(); // Only for instalasi
            
            // Fields for Troubleshooting
            $table->text('detail_action')->nullable(); // Only for troubleshooting
            $table->string('tipe_cut')->nullable(); // Only for troubleshooting
            $table->string('tikor_cut')->nullable(); // Only for troubleshooting
            $table->string('tipe_kabel')->nullable(); // Only for troubleshooting
            
            // Additional fields
            $table->text('keterangan')->nullable();
            $table->string('status')->default('completed'); // completed, pending, cancelled
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('field_engineer_id')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('job_type');
            $table->index('tanggal_pekerjaan');
            $table->index('field_engineer_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('history_jobs');
    }
};


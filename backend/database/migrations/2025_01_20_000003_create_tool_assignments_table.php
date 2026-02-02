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
        Schema::create('tool_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tool_id');
            $table->unsignedBigInteger('field_engineer_id');
            $table->date('tanggal_assign');
            $table->date('tanggal_return')->nullable();
            $table->enum('status', ['assigned', 'returned', 'lost'])->default('assigned');
            $table->text('keterangan')->nullable();
            $table->unsignedBigInteger('assigned_by')->nullable();
            $table->unsignedBigInteger('returned_by')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('tool_id')->references('id')->on('tools')->onDelete('cascade');
            $table->foreign('field_engineer_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('assigned_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('returned_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('tool_id');
            $table->index('field_engineer_id');
            $table->index('status');
            $table->index('tanggal_assign');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_assignments');
    }
};


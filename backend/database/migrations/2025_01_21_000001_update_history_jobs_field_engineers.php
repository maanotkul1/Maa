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
        Schema::table('history_jobs', function (Blueprint $table) {
            // Drop foreign key and index first
            $table->dropForeign(['field_engineer_id']);
            $table->dropIndex(['field_engineer_id']);
            
            // Drop old column
            $table->dropColumn('field_engineer_id');
            
            // Add new text columns for 3 field engineers
            $table->string('field_engineer_1')->nullable()->after('redaman');
            $table->string('field_engineer_2')->nullable()->after('field_engineer_1');
            $table->string('field_engineer_3')->nullable()->after('field_engineer_2');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('history_jobs', function (Blueprint $table) {
            // Drop new columns
            $table->dropColumn(['field_engineer_1', 'field_engineer_2', 'field_engineer_3']);
            
            // Restore old column
            $table->unsignedBigInteger('field_engineer_id')->after('redaman');
            $table->foreign('field_engineer_id')->references('id')->on('users')->onDelete('restrict');
            $table->index('field_engineer_id');
        });
    }
};


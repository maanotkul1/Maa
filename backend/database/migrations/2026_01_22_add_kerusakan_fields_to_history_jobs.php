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
            // Add missing kerusakan fields
            if (!Schema::hasColumn('history_jobs', 'peralatan_lainnya')) {
                $table->boolean('peralatan_lainnya')->default(false)->nullable()->after('peralatan_ap');
            }
            if (!Schema::hasColumn('history_jobs', 'peralatan_lainnya_keterangan')) {
                $table->string('peralatan_lainnya_keterangan')->nullable()->after('peralatan_lainnya');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('history_jobs', function (Blueprint $table) {
            if (Schema::hasColumn('history_jobs', 'peralatan_lainnya')) {
                $table->dropColumn('peralatan_lainnya');
            }
            if (Schema::hasColumn('history_jobs', 'peralatan_lainnya_keterangan')) {
                $table->dropColumn('peralatan_lainnya_keterangan');
            }
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('history_jobs', function (Blueprint $table) {
            // Add new FO (troubleshooting_fo) fields
            $table->date('tanggal_fo')->nullable()->after('tanggal_pekerjaan');
            $table->string('nama_client_fo')->nullable()->after('tanggal_fo');
            $table->string('odp_pop_fo')->nullable()->after('nama_client_fo');
            $table->string('suspect_fo')->nullable()->after('odp_pop_fo');
            $table->string('action_fo')->nullable()->after('suspect_fo');
            $table->string('petugas_fe_fo')->nullable()->after('action_fo');
            $table->time('jam_datang_fo')->nullable()->after('petugas_fe_fo');
            $table->time('jam_selesai_fo')->nullable()->after('jam_datang_fo');
            $table->longText('note_fo')->nullable()->after('jam_selesai_fo');
        });
    }

    public function down(): void
    {
        Schema::table('history_jobs', function (Blueprint $table) {
            $table->dropColumn([
                'tanggal_fo',
                'nama_client_fo',
                'odp_pop_fo',
                'suspect_fo',
                'action_fo',
                'petugas_fe_fo',
                'jam_datang_fo',
                'jam_selesai_fo',
                'note_fo',
            ]);
        });
    }
};

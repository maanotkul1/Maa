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
            // Add new wireless troubleshooting simplified fields
            $table->date('tanggal_wireless')->nullable()->after('tanggal_pekerjaan');
            $table->string('nama_client_wireless')->nullable()->after('tanggal_wireless');
            $table->string('odp_pop_wireless')->nullable()->after('nama_client_wireless');
            $table->string('suspect_wireless')->nullable()->after('odp_pop_wireless');
            $table->string('action_wireless')->nullable()->after('suspect_wireless');
            $table->string('redaman_signal_wireless')->nullable()->after('action_wireless');
            $table->string('tipe_kabel_wireless')->nullable()->after('redaman_signal_wireless');
            $table->string('petugas_fe_wireless')->nullable()->after('tipe_kabel_wireless');
            $table->time('jam_datang')->nullable()->after('petugas_fe_wireless');
            $table->time('jam_selesai')->nullable()->after('jam_datang');
            $table->longText('note_wireless')->nullable()->after('jam_selesai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('history_jobs', function (Blueprint $table) {
            $table->dropColumn([
                'tanggal_wireless',
                'nama_client_wireless',
                'odp_pop_wireless',
                'suspect_wireless',
                'action_wireless',
                'redaman_signal_wireless',
                'tipe_kabel_wireless',
                'petugas_fe_wireless',
                'jam_datang',
                'jam_selesai',
                'note_wireless',
            ]);
        });
    }
};

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
            // Check if kategori_job doesn't exist, add it
            if (!Schema::hasColumn('history_jobs', 'kategori_job')) {
                $table->string('kategori_job')->nullable()->default('troubleshooting_fo')->after('job_type');
            }

            // Section 1: Informasi Umum
            if (!Schema::hasColumn('history_jobs', 'lokasi_site')) {
                $table->string('lokasi_site')->nullable()->after('kategori_job');
                $table->string('area_ruangan')->nullable()->after('lokasi_site');
                $table->string('prioritas')->nullable()->after('area_ruangan');
                $table->dateTime('tanggal_waktu_pengerjaan')->nullable()->after('prioritas');
            }

            // Section 2: Perangkat Wireless
            if (!Schema::hasColumn('history_jobs', 'jenis_perangkat')) {
                $table->string('jenis_perangkat')->nullable()->after('tanggal_waktu_pengerjaan');
                $table->string('brand_perangkat')->nullable()->after('jenis_perangkat');
                $table->string('model_perangkat')->nullable()->after('brand_perangkat');
                $table->string('ip_address_perangkat')->nullable()->after('model_perangkat');
                $table->string('ssid')->nullable()->after('ip_address_perangkat');
                $table->string('interface_radio')->nullable()->after('ssid');
                $table->string('mac_address')->nullable()->after('interface_radio');
            }

            // Section 3: Keluhan
            if (!Schema::hasColumn('history_jobs', 'keluhan_list')) {
                $table->json('keluhan_list')->nullable()->after('mac_address');
                $table->text('keluhan_detail')->nullable()->after('keluhan_list');
            }

            // Section 4: Analisa
            if (!Schema::hasColumn('history_jobs', 'signal_strength_rssi')) {
                $table->string('signal_strength_rssi')->nullable()->after('keluhan_detail');
                $table->string('channel')->nullable()->after('signal_strength_rssi');
                $table->string('channel_width')->nullable()->after('channel');
                $table->integer('jumlah_client')->nullable()->after('channel_width');
                $table->string('status_dhcp')->nullable()->after('jumlah_client');
                $table->string('ping_latency')->nullable()->after('status_dhcp');
                $table->string('packet_loss')->nullable()->after('ping_latency');
                $table->text('interference')->nullable()->after('packet_loss');
                $table->text('authentication_issue')->nullable()->after('interference');
                $table->text('log_error')->nullable()->after('authentication_issue');
            }

            // Section 5: Tindakan
            if (!Schema::hasColumn('history_jobs', 'tindakan_list')) {
                $table->json('tindakan_list')->nullable()->after('log_error');
                $table->text('detail_tindakan_wireless')->nullable()->after('tindakan_list');
            }

            // Section 6: Hasil
            if (!Schema::hasColumn('history_jobs', 'status_koneksi_wireless')) {
                $table->string('status_koneksi_wireless')->nullable()->after('detail_tindakan_wireless');
                $table->string('status_internet')->nullable()->after('status_koneksi_wireless');
                $table->text('kondisi_setelah_tindakan')->nullable()->after('status_internet');
                $table->text('feedback_user')->nullable()->after('kondisi_setelah_tindakan');
            }

            // Section 7: Status Akhir
            if (!Schema::hasColumn('history_jobs', 'status_akhir')) {
                $table->string('status_akhir')->nullable()->after('feedback_user');
                $table->text('escalation_reason')->nullable()->after('status_akhir');
                $table->string('escalated_to')->nullable()->after('escalation_reason');
            }

            // Section 8: Catatan & Rekomendasi
            if (!Schema::hasColumn('history_jobs', 'catatan_teknisi')) {
                $table->text('catatan_teknisi')->nullable()->after('escalated_to');
                $table->text('rekomendasi_jangka_panjang')->nullable()->after('catatan_teknisi');
                $table->text('rencana_tindak_lanjut')->nullable()->after('rekomendasi_jangka_panjang');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('history_jobs', function (Blueprint $table) {
            $columns = [
                'kategori_job',
                'lokasi_site',
                'area_ruangan',
                'prioritas',
                'tanggal_waktu_pengerjaan',
                'jenis_perangkat',
                'brand_perangkat',
                'model_perangkat',
                'ip_address_perangkat',
                'ssid',
                'interface_radio',
                'mac_address',
                'keluhan_list',
                'keluhan_detail',
                'signal_strength_rssi',
                'channel',
                'channel_width',
                'jumlah_client',
                'status_dhcp',
                'ping_latency',
                'packet_loss',
                'interference',
                'authentication_issue',
                'log_error',
                'tindakan_list',
                'detail_tindakan_wireless',
                'status_koneksi_wireless',
                'status_internet',
                'kondisi_setelah_tindakan',
                'feedback_user',
                'status_akhir',
                'escalation_reason',
                'escalated_to',
                'catatan_teknisi',
                'rekomendasi_jangka_panjang',
                'rencana_tindak_lanjut',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('history_jobs', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

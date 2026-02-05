<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class HistoryJob extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'history_jobs';

    protected $fillable = [
        'job_number',
        'job_type',
        'nama_client',
        'tikor_odp_jb',
        'port_odp',
        'foto_rumah',
        'foto_pemasangan',
        'redaman',
        'field_engineer_1',
        'field_engineer_2',
        'field_engineer_3',
        'tanggal_pekerjaan',
        'panjang_kabel',
        'detail_action',
        'tipe_cut',
        'tikor_cut',
        'tipe_kabel',
        'keterangan',
        'status',
        'created_by',
        'updated_by',
        // FO Troubleshooting Fields (simplified)
        'tanggal_fo',
        'nama_client_fo',
        'odp_pop_fo',
        'suspect_fo',
        'action_fo',
        'petugas_fe_fo',
        'jam_datang_fo',
        'jam_selesai_fo',
        'note_fo',
        // Wireless Troubleshooting Fields (simplified)
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
        // Old wireless fields (keeping for backward compatibility)
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
        // Equipment/Damage fields for wireless
        'peralatan_radio',
        'peralatan_kabel',
        'peralatan_adaptor',
        'peralatan_poe',
        'peralatan_rj45',
        'peralatan_router_switch',
        'peralatan_ap',
        'peralatan_lainnya',
        'peralatan_lainnya_keterangan',
        // Teknisi field
        'teknisi_id',
    ];
    protected $casts = [
        'tanggal_pekerjaan' => 'date',
        'redaman' => 'decimal:2',
        'panjang_kabel' => 'decimal:2',
        'peralatan_radio' => 'boolean',
        'peralatan_kabel' => 'boolean',
        'peralatan_adaptor' => 'boolean',
        'peralatan_poe' => 'boolean',
        'peralatan_rj45' => 'boolean',
        'peralatan_router_switch' => 'boolean',
        'peralatan_ap' => 'boolean',
        'peralatan_lainnya' => 'boolean',
    ];


    /**
     * Get the user who created the history job
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the history job
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all photos for this history job
     */
    public function photos(): HasMany
    {
        return $this->hasMany(HistoryJobPhoto::class, 'history_job_id');
    }

    /**
     * Generate unique job number based on job type
     * Format:
     * - Instalasi: J + YYMM + Counter (e.g., J26020, J26021, J26022)
     * - Troubleshooting FO: TF + YYMM + Counter (e.g., TF26020, TF26021, TF26022)
     * - Troubleshooting Wireless: TW + YYMM + Counter (e.g., TW26020, TW26021, TW26022)
     *
     * If a job is deleted, the next job will reuse the lowest available counter for that month.
     * Counters reset monthly.
     */
    public static function generateJobNumber(?string $jobType = null): string
    {
        $year = now()->format('y');  // 2 digit year (26 for 2026)
        $month = now()->format('m');  // 2 digit month (01, 02, etc)

        // Determine prefix based on job type (without day)
        if ($jobType === 'troubleshooting_fo') {
            $prefix = 'TF' . $year . $month;
        } elseif ($jobType === 'troubleshooting_wireless') {
            $prefix = 'TW' . $year . $month;
        } else {
            // Default for instalasi or null
            $prefix = 'J' . $year . $month;
        }

        // Get all existing job numbers for this month (including deleted ones)
        $existingJobs = self::where('job_number', 'like', $prefix . '%')
            ->withTrashed()
            ->pluck('job_number')
            ->toArray();

        // Extract counters from existing job numbers
        $usedCounters = [];
        foreach ($existingJobs as $jobNum) {
            $counter = str_replace($prefix, '', $jobNum);
            if (is_numeric($counter) && strlen($counter) <= 2) {
                $usedCounters[] = (int) $counter;
            }
        }

        // Find the lowest available counter starting from 00
        $nextCounter = 0;
        sort($usedCounters);
        foreach ($usedCounters as $counter) {
            if ($counter === $nextCounter) {
                $nextCounter++;
            } else {
                break;
            }
        }

        $jobNumber = $prefix . str_pad($nextCounter, 2, '0', STR_PAD_LEFT);
        return $jobNumber;
    }
}


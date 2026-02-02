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
        // Wireless Troubleshooting Fields
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
     * Generate unique job number
     */
    public static function generateJobNumber(): string
    {
        // Format: J + YY + MM + Counter (e.g., J260100)
        $year = now()->format('y');  // 2 digit year (26 for 2026)
        $month = now()->format('m');  // 2 digit month (01, 02, etc)
        $prefix = 'J' . $year . $month;

        // Find the maximum counter for current year-month
        $maxCounter = self::where('job_number', 'like', $prefix . '%')
            ->withTrashed()
            ->get()
            ->map(function ($job) use ($prefix) {
                $number = str_replace($prefix, '', $job->job_number);
                return (int) $number;
            })
            ->max() ?? 0;

        $nextCounter = $maxCounter + 1;
        $jobNumber = $prefix . str_pad($nextCounter, 2, '0', STR_PAD_LEFT);

        // Ensure uniqueness (handle race conditions)
        $maxAttempts = 10;
        $attempts = 0;
        while (self::where('job_number', $jobNumber)->withTrashed()->exists() && $attempts < $maxAttempts) {
            $nextCounter++;
            $jobNumber = $prefix . str_pad($nextCounter, 2, '0', STR_PAD_LEFT);
            $attempts++;
        }

        // Fallback to timestamp if still not unique
        if ($attempts >= $maxAttempts) {
            $jobNumber = $prefix . time();
        }

        return $jobNumber;
    }
}


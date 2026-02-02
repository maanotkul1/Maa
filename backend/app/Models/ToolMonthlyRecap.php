<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ToolMonthlyRecap extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tool_monthly_recaps';

    protected $fillable = [
        'tools_id',
        'bulan_tahun',
        'data_tools_snapshot',
        'total_perubahan_dalam_bulan',
        'tanggal_rekap',
    ];

    protected $casts = [
        'data_tools_snapshot' => 'array',
        'tanggal_rekap' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Make recap read-only
    public function updateOrFail($attributes = [], $options = [])
    {
        throw new \Exception('Monthly recap records are read-only and cannot be modified.');
    }

    public function update(array $attributes = [], array $options = [])
    {
        throw new \Exception('Monthly recap records are read-only and cannot be modified.');
    }

    /**
     * Get the tool data
     */
    public function tool(): BelongsTo
    {
        return $this->belongsTo(ToolData::class, 'tools_id');
    }

    /**
     * Get formatted month year
     */
    public function getFormattedBulanTahunAttribute(): string
    {
        return \Carbon\Carbon::createFromFormat('Y-m', $this->bulan_tahun)
            ->translatedFormat('F Y', locale: 'id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ToolData extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tools_data';

    protected $fillable = [
        'nama_tools',
        'kategori_tools',
        'deskripsi',
        'status',
        'data_tools',
        'last_month_update',
        'qr_code',
        'qr_identifier',
    ];

    protected $casts = [
        'data_tools' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Generate QR code & identifier when creating
        static::creating(function ($model) {
            if (!$model->qr_identifier) {
                $model->qr_identifier = 'TOOL-' . Str::uuid();
            }
            if (!$model->qr_code) {
                $model->generateQRCode();
            }
        });
    }

    /**
     * Generate QR code for this tool
     */
    public function generateQRCode()
    {
        if (!$this->qr_identifier) {
            $this->qr_identifier = 'TOOL-' . Str::uuid();
        }

        $qrIdentifier = $this->qr_identifier;

        // Using simple QR code generation (can use endroid/qr-code package)
        // For now, storing the identifier that can be used to generate QR
        $this->qr_code = $qrIdentifier;

        return $this;
    }

    /**
     * Get all history records for this tool
     */
    public function histories(): HasMany
    {
        return $this->hasMany(ToolDataHistory::class, 'tools_id');
    }

    /**
     * Get all monthly recap records for this tool
     */
    public function monthlyRecaps(): HasMany
    {
        return $this->hasMany(ToolMonthlyRecap::class, 'tools_id');
    }

    /**
     * Get all QR updates for this tool
     */
    public function qrUpdates(): HasMany
    {
        return $this->hasMany(ToolQRUpdate::class, 'tools_data_id');
    }

    /**
     * Get all scan histories for this tool
     */
    public function qrScanHistories(): HasMany
    {
        return $this->hasMany(ToolQRScanHistory::class, 'tools_data_id');
    }

    /**
     * Get latest month update
     */
    public function getLatestMonthUpdateAttribute()
    {
        return $this->last_month_update ?
            \Carbon\Carbon::createFromFormat('Y-m', $this->last_month_update)->translatedFormat('F Y', locale: 'id') :
            'Belum pernah diupdate';
    }

    /**
     * Check if tool can be updated - no time restriction anymore
     * Always returns true as updates can happen anytime
     */
    public function canBeUpdated(): bool
    {
        return true; // Always allowed to update - recap is auto-created
    }

    /**
     * Get remaining days until next update
     * No longer applicable - always 0
     */
    public function getRemainingDaysUntilUpdate(): int
    {
        return 0; // No waiting period
    }
}

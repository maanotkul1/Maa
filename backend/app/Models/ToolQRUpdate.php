<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class ToolQRUpdate extends Model
{
    use SoftDeletes;

    protected $table = 'tool_q_r_updates';

    protected $fillable = [
        'tools_data_id',
        'qr_code',
        'qr_hash',
        'generated_at',
        'expired_at',
        'last_scanned_at',
        'scan_count',
        'status',
        'scan_history',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'expired_at' => 'datetime',
        'last_scanned_at' => 'datetime',
        'scan_history' => 'array',
    ];

    /**
     * Get the tool data
     */
    public function toolData(): BelongsTo
    {
        return $this->belongsTo(ToolData::class, 'tools_data_id');
    }

    /**
     * Get all scan histories
     */
    public function scanHistories(): HasMany
    {
        return $this->hasMany(ToolQRScanHistory::class, 'tool_qr_update_id');
    }

    /**
     * Check if QR is still valid
     */
    public function isValid(): bool
    {
        if ($this->status === 'expired' || $this->status === 'used') {
            return false;
        }

        if ($this->expired_at && $this->expired_at->isPast()) {
            $this->update(['status' => 'expired']);
            return false;
        }

        return true;
    }

    /**
     * Check if QR can be scanned (1 month rule)
     */
    public function canBeScanned(): bool
    {
        $toolData = $this->toolData;

        if (!$toolData) {
            return false;
        }

        // Check if 1 month has passed since last update
        if ($toolData->last_month_update) {
            $lastUpdate = Carbon::createFromFormat('Y-m', $toolData->last_month_update);
            $now = Carbon::now();

            if ($now->diffInMonths($lastUpdate) < 1) {
                return false; // Belum waktunya update
            }
        }

        return $this->isValid();
    }

    /**
     * Get remaining validity days
     */
    public function getRemainingValidityDays(): int
    {
        if (!$this->expired_at) {
            return -1; // No expiry
        }

        return max(0, Carbon::now()->diffInDays($this->expired_at, false));
    }

    /**
     * Get scan percentage (max 100)
     */
    public function getScanPercentage(): float
    {
        if ($this->scan_count <= 0) {
            return 0;
        }

        // Assuming max 30 scans per month
        return min(100, ($this->scan_count / 30) * 100);
    }

    /**
     * Mark as used (after successful scan update)
     */
    public function markAsUsed(): void
    {
        $this->update([
            'status' => 'used',
            'last_scanned_at' => Carbon::now(),
        ]);

        // Update the tool data's last_month_update
        if ($this->toolData) {
            $this->toolData->update([
                'last_month_update' => Carbon::now()->format('Y-m'),
            ]);
        }
    }
}

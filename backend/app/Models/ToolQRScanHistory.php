<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolQRScanHistory extends Model
{
    protected $table = 'tool_q_r_scan_histories';

    protected $fillable = [
        'tool_qr_update_id',
        'tools_data_id',
        'scan_code',
        'scanned_at',
        'device_type',
        'ip_address',
        'user_agent',
        'scan_data',
        'status',
        'notes',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
        'scan_data' => 'array',
    ];

    /**
     * Get the QR update
     */
    public function qrUpdate(): BelongsTo
    {
        return $this->belongsTo(ToolQRUpdate::class, 'tool_qr_update_id');
    }

    /**
     * Get the tool data
     */
    public function toolData(): BelongsTo
    {
        return $this->belongsTo(ToolData::class, 'tools_data_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolAssignment extends Model
{
    use HasFactory;

    protected $table = 'tool_assignments';

    protected $fillable = [
        'tool_id',
        'field_engineer_id',
        'tanggal_assign',
        'tanggal_return',
        'status',
        'keterangan',
        'assigned_by',
        'returned_by',
    ];

    protected $casts = [
        'tanggal_assign' => 'date',
        'tanggal_return' => 'date',
    ];

    /**
     * Get the tool
     */
    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class, 'tool_id');
    }

    /**
     * Get the field engineer
     */
    public function fieldEngineer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'field_engineer_id');
    }

    /**
     * Get the user who assigned the tool
     */
    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Get the user who returned the tool
     */
    public function returner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'returned_by');
    }
}


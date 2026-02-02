<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ToolHistory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tool_histories';

    protected $fillable = [
        'tool_id',
        'nama_tool',
        'kategori',
        'merek_tipe',
        'nomor_seri',
        'kondisi',
        'status_kepemilikan',
        'field_engineer_id',
        'field_engineer_name',
        'tanggal_terima',
        'catatan_keterangan',
        'foto_tool',
        'tanggal_update',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'tanggal_terima' => 'date',
        'tanggal_update' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the tool this history belongs to
     */
    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    /**
     * Get the user who created this history record
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this history record
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}

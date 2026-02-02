<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tool extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tools';

    protected $fillable = [
        'kode_tool',
        'nama_tool',
        'kategori',
        'merek_tipe',
        'nomor_seri',
        'jenis_tool', // Keep for backward compatibility
        'kondisi',
        'status_kepemilikan',
        'field_engineer_id',
        'field_engineer_name',
        'tanggal_terima',
        'tanggal_kalibrasi_terakhir',
        'tanggal_maintenance_terakhir',
        'catatan_keterangan',
        'foto_tool',
        'deskripsi', // Keep for backward compatibility
        'lokasi', // Keep for backward compatibility
        'tanggal_pembelian', // Keep for backward compatibility
        'harga', // Keep for backward compatibility
        'catatan', // Keep for backward compatibility
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'tanggal_terima' => 'date',
        'tanggal_kalibrasi_terakhir' => 'date',
        'tanggal_maintenance_terakhir' => 'date',
        'tanggal_pembelian' => 'date', // Keep for backward compatibility
        'harga' => 'decimal:2', // Keep for backward compatibility
    ];

    /**
     * Get the user who created the tool
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the tool
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all assignments for this tool
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(ToolAssignment::class, 'tool_id');
    }

    /**
     * Get current assignment relationship (for eager loading)
     */
    public function currentAssignment(): HasOne
    {
        return $this->hasOne(ToolAssignment::class, 'tool_id')
            ->where('status', 'assigned')
            ->latest('tanggal_assign');
    }

    /**
     * Get current assignment model instance (not for eager loading)
     */
    public function getCurrentAssignment()
    {
        return $this->assignments()
            ->where('status', 'assigned')
            ->latest('tanggal_assign')
            ->first();
    }

    /**
     * Get current assigned FE
     */
    public function currentFieldEngineer()
    {
        $assignment = $this->getCurrentAssignment();
        return $assignment ? $assignment->fieldEngineer : null;
    }

    /**
     * Get the field engineer assigned to this tool (direct assignment)
     */
    public function fieldEngineer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'field_engineer_id');
    }

    /**
     * Get all history records for this tool
     */
    public function histories(): HasMany
    {
        return $this->hasMany(ToolHistory::class, 'tool_id');
    }
}


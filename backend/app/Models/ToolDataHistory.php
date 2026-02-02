<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ToolDataHistory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tool_data_histories';

    protected $fillable = [
        'tools_id',
        'aksi',
        'data_lama',
        'data_baru',
        'tanggal_aksi',
        'user_id',
        'keterangan',
    ];

    protected $casts = [
        'data_lama' => 'array',
        'data_baru' => 'array',
        'tanggal_aksi' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the tool data
     */
    public function tool(): BelongsTo
    {
        return $this->belongsTo(ToolData::class, 'tools_id');
    }

    /**
     * Get the user who made the change
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get list of changed fields
     */
    public function getChangedFieldsAttribute(): array
    {
        if (!$this->data_lama || !$this->data_baru) {
            return [];
        }

        $changed = [];
        foreach ($this->data_baru as $key => $value) {
            $oldValue = $this->data_lama[$key] ?? null;
            if ($oldValue !== $value) {
                $changed[$key] = [
                    'from' => $oldValue,
                    'to' => $value,
                ];
            }
        }

        return $changed;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobStatusLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'old_status',
        'new_status',
        'changed_by',
        'note',
    ];

    /**
     * Get the job for this status log
     */
    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    /**
     * Get the user who changed the status
     */
    public function changer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}


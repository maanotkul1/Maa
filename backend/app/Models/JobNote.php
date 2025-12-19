<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'user_id',
        'note_type',
        'content',
    ];

    /**
     * Get the job for this note
     */
    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    /**
     * Get the user who created this note
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}


<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'uploaded_by',
        'photo_url',
        'caption',
        'photo_type',
    ];

    /**
     * Get the job for this photo
     */
    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    /**
     * Get the user who uploaded this photo
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}


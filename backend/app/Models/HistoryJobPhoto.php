<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoryJobPhoto extends Model
{
    use HasFactory;

    protected $table = 'history_job_photos';

    protected $fillable = [
        'history_job_id',
        'photo_path',
        'photo_type',
        'description',
        'uploaded_by',
    ];

    /**
     * Get the history job
     */
    public function historyJob(): BelongsTo
    {
        return $this->belongsTo(HistoryJob::class, 'history_job_id');
    }

    /**
     * Get the user who uploaded the photo
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}


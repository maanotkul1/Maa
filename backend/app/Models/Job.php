<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Job extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'field_jobs';

    protected $fillable = [
        'job_number',
        'no',
        'odp_id',
        'tanggal',
        'kategori',
        'req_by',
        'tiket_all_bnet',
        'id_nama_pop_odp_jb',
        'tikor',
        'detail',
        'janji_datang',
        'petugas_1',
        'petugas_2',
        'petugas_3',
        'ba',
        'status',
        'remarks',
        'title',
        'job_type',
        'location_address',
        'latitude',
        'longitude',
        'description',
        'assigned_fe_id',
        'scheduled_date',
        'deadline_at',
        'priority',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'no' => 'integer',
        'tanggal' => 'date',
        'janji_datang' => 'datetime',
        'ba' => 'boolean',
        'scheduled_date' => 'date',
        'deadline_at' => 'datetime',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    /**
     * Get janji_datang formatted as time (H:i)
     */
    public function getJanjiDatangTimeAttribute()
    {
        if (!$this->janji_datang) {
            return null;
        }
        
        // If it's already a Carbon instance from datetime cast
        if (method_exists($this->janji_datang, 'format')) {
            return $this->janji_datang->format('H:i');
        }
        
        // If it's a string, try to parse it
        if (is_string($this->janji_datang)) {
            // If already in H:i format
            if (preg_match('/^\d{2}:\d{2}$/', $this->janji_datang)) {
                return $this->janji_datang;
            }
            // If in H:i:s format
            if (preg_match('/^(\d{2}:\d{2}):\d{2}/', $this->janji_datang, $matches)) {
                return $matches[1];
            }
        }
        
        return $this->janji_datang;
    }

    /**
     * Generate unique job number
     */
    public static function generateJobNumber(): string
    {
        $date = now()->format('Ymd');
        $prefix = 'JOB-' . $date . '-';
        
        // Get all today's jobs with the prefix
        $todayJobs = self::where('job_number', 'like', $prefix . '%')
            ->pluck('job_number')
            ->toArray();
        
        $maxNumber = 0;
        foreach ($todayJobs as $jobNum) {
            // Extract number from job_number (format: JOB-YYYYMMDD-XXXX)
            if (preg_match('/-(\d{4})$/', $jobNum, $matches)) {
                $num = (int) $matches[1];
                if ($num > $maxNumber) {
                    $maxNumber = $num;
                }
            }
        }
        
        $number = $maxNumber + 1;
        
        // Ensure number doesn't exceed 9999
        if ($number > 9999) {
            // Use timestamp as fallback
            return 'JOB-' . $date . '-' . time();
        }
        
        return $prefix . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Generate sequential job number (1, 2, 3, ...)
     */
    public static function generateJobNo(): int
    {
        $lastJob = self::whereNotNull('no')
            ->where('no', '!=', '')
            ->orderBy('id', 'desc')
            ->first();
        
        if ($lastJob && $lastJob->no) {
            return (int) $lastJob->no + 1;
        }
        
        return 1;
    }

    /**
     * Get the ODP for this job
     */
    public function odp(): BelongsTo
    {
        return $this->belongsTo(Odp::class, 'odp_id');
    }

    /**
     * Get the FE assigned to this job
     */
    public function assignedFe(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_fe_id');
    }

    /**
     * Get the user who created this job
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this job
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all status logs for this job
     */
    public function statusLogs(): HasMany
    {
        return $this->hasMany(JobStatusLog::class);
    }

    /**
     * Get all notes for this job
     */
    public function notes(): HasMany
    {
        return $this->hasMany(JobNote::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get all photos for this job
     */
    public function photos(): HasMany
    {
        return $this->hasMany(JobPhoto::class)->orderBy('created_at', 'desc');
    }

    /**
     * Check if job is overdue
     */
    public function isOverdue(): bool
    {
        if (!$this->deadline_at) {
            return false;
        }

        return $this->deadline_at->isPast() 
            && !in_array($this->status, ['done', 'canceled']);
    }
}


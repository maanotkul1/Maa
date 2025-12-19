<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Odp extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'kode_odp',
        'nama_odp',
        'area_cluster',
        'alamat',
        'latitude',
        'longitude',
        'status',
        'keterangan',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function jobs()
    {
        return $this->hasMany(Job::class, 'odp_id');
    }

    public function activeJobs()
    {
        return $this->hasMany(Job::class, 'odp_id')->whereNotIn('status', ['done', 'canceled']);
    }
}


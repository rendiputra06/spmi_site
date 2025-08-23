<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode',
        'nama',
        'periode_id',
        'tanggal_mulai',
        'tanggal_selesai',
        'deskripsi',
        'status',
        'is_locked',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'status' => 'boolean',
        'is_locked' => 'boolean',
    ];

    public function periode()
    {
        return $this->belongsTo(Periode::class, 'periode_id');
    }

    public function standars()
    {
        return $this->belongsToMany(StandarMutu::class, 'audit_session_standars', 'audit_session_id', 'standar_id');
    }

    public function units()
    {
        return $this->hasMany(AuditSessionUnit::class, 'audit_session_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode',
        'nama',
        'tipe', // universitas, fakultas, prodi, unit
        'parent_id',
        'leader_id',
        'leader_nama',
        'leader_jabatan',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(Unit::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Unit::class, 'parent_id');
    }

    public function leaderDosen()
    {
        return $this->belongsTo(Dosen::class, 'leader_id');
    }
}

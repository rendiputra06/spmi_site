<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonevEvaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'monev_session_id',
        'unit_id',
        'mata_kuliah_id',
        'dosen_id',
        'area',
    ];

    public function session()
    {
        return $this->belongsTo(MonevSession::class, 'monev_session_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function mataKuliah()
    {
        return $this->belongsTo(MataKuliah::class, 'mata_kuliah_id');
    }

    public function dosen()
    {
        return $this->belongsTo(Dosen::class);
    }
}

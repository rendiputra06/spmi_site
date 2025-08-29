<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonevSessionProdi extends Model
{
    use HasFactory;

    protected $fillable = [
        'monev_session_id',
        'unit_id',
        'gjm_dosen_id',
    ];

    public function session()
    {
        return $this->belongsTo(MonevSession::class, 'monev_session_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function gjm()
    {
        return $this->belongsTo(Dosen::class, 'gjm_dosen_id');
    }
}

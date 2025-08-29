<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonevSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'periode_id',
        'tahun',
        'tanggal_mulai',
        'tanggal_selesai',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];

    public function periode()
    {
        return $this->belongsTo(Periode::class);
    }

    public function prodis()
    {
        return $this->hasMany(MonevSessionProdi::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Periode extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode',
        'nama',
        'mulai',
        'selesai',
        'keterangan',
        'status',
        'is_active',
    ];

    protected $casts = [
        'mulai' => 'date',
        'selesai' => 'date',
        'status' => 'boolean',
        'is_active' => 'boolean',
    ];
}

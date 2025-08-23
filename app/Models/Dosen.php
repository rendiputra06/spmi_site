<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dosen extends Model
{
    use HasFactory;
    
    protected $table = 'dosen';

    protected $fillable = [
        'nidn',
        'nama',
        'email',
        'prodi',
        'jabatan',
        'pangkat_golongan',
        'pendidikan_terakhir',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];
}

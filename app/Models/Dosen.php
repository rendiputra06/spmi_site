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
        'user_id',
        'prodi',
        'jabatan',
        'pangkat_golongan',
        'pendidikan_terakhir',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

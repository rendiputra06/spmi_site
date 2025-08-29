<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MataKuliah extends Model
{
    use HasFactory;

    protected $table = 'mata_kuliah';

    protected $fillable = [
        'kode',
        'nama',
        'sks',
        'status',
        'unit_id',
    ];

    protected $casts = [
        'status' => 'boolean',
        'sks' => 'integer',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}

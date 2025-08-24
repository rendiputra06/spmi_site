<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StandarMutu extends Model
{
    protected $table = 'standar_mutu';
    protected $fillable = ['kode', 'nama', 'deskripsi', 'status'];

    public function indikator()
    {
        return $this->hasMany(Indikator::class, 'standar_id')->orderBy('urutan');
    }

    // Relasi ke Pertanyaan melalui Indikator (untuk counting via withCount)
    public function pertanyaan()
    {
        return $this->hasManyThrough(
            Pertanyaan::class,    // Model target
            Indikator::class,     // Model perantara
            'standar_id',         // Foreign key di tabel indikator yang merujuk ke standar_mutu
            'indikator_id',       // Foreign key di tabel pertanyaan yang merujuk ke indikator
            'id',                 // Local key di tabel standar_mutu
            'id'                  // Local key di tabel indikator
        );
    }
}

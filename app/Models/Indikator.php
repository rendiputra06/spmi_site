<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Indikator extends Model
{
    protected $table = 'indikator';
    protected $fillable = [
        'standar_id',
        'nama',
        'kriteria_penilaian',
        'jenis_pengukuran',
        'target_pencapaian',
        'urutan',
    ];

    public function standar()
    {
        return $this->belongsTo(StandarMutu::class, 'standar_id');
    }
    public function pertanyaan()
    {
        return $this->hasMany(Pertanyaan::class, 'indikator_id')->orderBy('urutan');
    }
}

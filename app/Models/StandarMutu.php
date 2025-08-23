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
}

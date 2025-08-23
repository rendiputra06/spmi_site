<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pertanyaan extends Model
{
    protected $table = 'pertanyaan';
    protected $fillable = ['indikator_id', 'isi', 'urutan'];

    public function indikator()
    {
        return $this->belongsTo(Indikator::class, 'indikator_id');
    }
}

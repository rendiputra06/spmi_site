<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonevTemplateQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id', 'pertanyaan', 'tipe', 'keterangan', 'aspek_penilaian', 'skala', 'urutan',
    ];

    protected $casts = [
        'skala' => 'array',
    ];

    public function template()
    {
        return $this->belongsTo(MonevTemplate::class, 'template_id');
    }
}

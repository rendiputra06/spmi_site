<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonevTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama', 'deskripsi',
    ];

    public function questions()
    {
        return $this->hasMany(MonevTemplateQuestion::class, 'template_id')->orderBy('urutan');
    }
}

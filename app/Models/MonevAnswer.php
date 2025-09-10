<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonevAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id', 'question_id', 'nilai', 'catatan',
    ];

    public function submission()
    {
        return $this->belongsTo(MonevSubmission::class, 'submission_id');
    }

    public function question()
    {
        return $this->belongsTo(MonevTemplateQuestion::class, 'question_id');
    }
}

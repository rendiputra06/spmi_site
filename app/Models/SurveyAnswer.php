<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SurveyAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id', 'question_id', 'value_text', 'value_numeric'
    ];

    public function assignment()
    {
        return $this->belongsTo(SurveyAssignment::class, 'assignment_id');
    }

    public function question()
    {
        return $this->belongsTo(SurveyQuestion::class);
    }
}

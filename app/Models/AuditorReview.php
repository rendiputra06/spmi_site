<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditorReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'auditee_submission_id',
        'score',
        'reviewer_note',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'score' => 'decimal:1',
    ];

    public function submission()
    {
        return $this->belongsTo(AuditeeSubmission::class, 'auditee_submission_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}

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
        'outcome_status',
        'special_note',
        'is_submitted',
        'submitted_at',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'submitted_at' => 'datetime',
        'is_submitted' => 'boolean',
        // score is discrete 0/1/2
        'score' => 'integer',
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

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AuditeeSubmission extends Model
{
    use SoftDeletes;

    protected $table = 'audit_auditee_submissions';

    protected $fillable = [
        'audit_session_id',
        'unit_id',
        'standar_mutu_id',
        'indikator_id',
        'pertanyaan_id',
        'note',
        'status',
        'submitted_by',
        'submitted_at',
        'score',
        'reviewer_note',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function documents()
    {
        return $this->belongsToMany(Document::class, 'audit_auditee_submission_documents', 'submission_id', 'document_id');
    }

    public function session()
    {
        return $this->belongsTo(AuditSession::class, 'audit_session_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function standar()
    {
        return $this->belongsTo(StandarMutu::class, 'standar_mutu_id');
    }

    public function indikator()
    {
        return $this->belongsTo(Indikator::class, 'indikator_id');
    }

    public function pertanyaan()
    {
        return $this->belongsTo(Pertanyaan::class, 'pertanyaan_id');
    }
}

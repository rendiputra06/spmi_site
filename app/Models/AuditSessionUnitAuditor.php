<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditSessionUnitAuditor extends Model
{
    use HasFactory;

    protected $fillable = [
        'audit_session_unit_id',
        'dosen_id',
        'role', // auditor|auditee
    ];

    public function sessionUnit()
    {
        return $this->belongsTo(AuditSessionUnit::class, 'audit_session_unit_id');
    }

    public function dosen()
    {
        return $this->belongsTo(Dosen::class, 'dosen_id');
    }
}

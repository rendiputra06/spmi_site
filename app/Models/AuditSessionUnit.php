<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditSessionUnit extends Model
{
    use HasFactory;

    protected $fillable = [
        'audit_session_id',
        'unit_id',
    ];

    public function session()
    {
        return $this->belongsTo(AuditSession::class, 'audit_session_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function auditors()
    {
        return $this->hasMany(AuditSessionUnitAuditor::class, 'audit_session_unit_id');
    }
}

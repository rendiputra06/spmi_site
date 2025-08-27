<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class AuditSessionAuditorReport extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'audit_session_id',
        'unit_id',
        'uploaded_by',
        'title',
        'notes',
        // legacy mirror fields for quick access
        'file_path',
        'mime',
        'size',
    ];

    public function session()
    {
        return $this->belongsTo(AuditSession::class, 'audit_session_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('auditor_reports')
            ->useDisk('public')
            ->singleFile();
    }
}

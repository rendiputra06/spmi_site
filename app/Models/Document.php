<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Document extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'unit_id',
        'uploaded_by',
        'title',
        'description',
        'category',
        'status',
        // keep legacy fields for compatibility
        'file_path',
        'mime',
        'size',
    ];

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
        $this->addMediaCollection('documents')
            ->useDisk(config('filesystems.default'))
            ->singleFile();
    }
}

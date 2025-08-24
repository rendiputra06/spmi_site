<?php

namespace App\Providers;

use App\Models\MediaFolder;
use App\Policies\MediaFolderPolicy;
use App\Models\Document;
use App\Policies\DocumentPolicy;
use App\Models\AuditeeSubmission;
use App\Policies\AuditeeSubmissionReviewPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        MediaFolder::class => MediaFolderPolicy::class,
        AuditeeSubmission::class => AuditeeSubmissionReviewPolicy::class,
        Document::class => DocumentPolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}

<?php

namespace App\Providers;

use App\Models\MediaFolder;
use App\Models\StandarMutu;
use App\Policies\MediaFolderPolicy;
use App\Policies\StandarMutuPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        MediaFolder::class => MediaFolderPolicy::class,
        StandarMutu::class => StandarMutuPolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}

<?php

namespace App\Providers;

use App\Models\Menu;
use App\Models\User;
use App\Models\SettingApp;
use Spatie\Permission\Models\Role;
use App\Observers\GlobalActivityLogger;
use Illuminate\Support\ServiceProvider;
use Spatie\Permission\Models\Permission;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        User::observe(GlobalActivityLogger::class);
        Role::observe(GlobalActivityLogger::class);
        Permission::observe(GlobalActivityLogger::class);
        Menu::observe(GlobalActivityLogger::class);
        SettingApp::observe(GlobalActivityLogger::class);
    
    	// Ensure generated URLs use HTTPS in production or when APP_URL is HTTPS
        try {
            $appUrl = config('app.url');
            if (app()->environment('production') || (is_string($appUrl) && str_starts_with($appUrl, 'https://'))) {
                URL::forceScheme('https');
            }
        } catch (\Throwable $e) {
            // no-op: do not break boot if config not available
        }
    }
}

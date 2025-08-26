<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        // MENU: Dashboard
        Menu::create([
            'title' => 'Dashboard',
            'icon' => 'Home',
            'route' => '/dashboard',
            'order' => 1,
            'permission_name' => 'dashboard-view',
        ]);

        // Self-service: Profil Dosen (visible to users who have access to view their own dosen data)
        Menu::create([
            'title' => 'Biodata',
            'icon' => 'IdCard',
            'route' => '/my/dosen',
            'order' => 2,
            'permission_name' => 'my-dosen-view',
        ]);

        // GROUP: Access
        $access = Menu::create([
            'title' => 'Access',
            'icon' => 'Contact',
            'route' => '#',
            'order' => 20,
            'permission_name' => 'access-view',
        ]);

        Menu::create([
            'title' => 'Permissions',
            'icon' => 'AlertOctagon',
            'route' => '/permissions',
            'order' => 21,
            'permission_name' => 'permission-view',
            'parent_id' => $access->id,
        ]);

        Menu::create([
            'title' => 'Users',
            'icon' => 'Users',
            'route' => '/users',
            'order' => 22,
            'permission_name' => 'users-view',
            'parent_id' => $access->id,
        ]);

        Menu::create([
            'title' => 'Roles',
            'icon' => 'AlertTriangle',
            'route' => '/roles',
            'order' => 24,
            'permission_name' => 'roles-view',
            'parent_id' => $access->id,
        ]);

        // GROUP: Settings
        $settings = Menu::create([
            'title' => 'Settings',
            'icon' => 'Settings',
            'route' => '#',
            'order' => 30,
            'permission_name' => 'settings-view',
        ]);

        Menu::create([
            'title' => 'Menu Manager',
            'icon' => 'Menu',
            'route' => '/menus',
            'order' => 31,
            'permission_name' => 'menu-view',
            'parent_id' => $settings->id,
        ]);

        Menu::create([
            'title' => 'App Settings',
            'icon' => 'AtSign',
            'route' => '/settingsapp',
            'order' => 32,
            'permission_name' => 'app-settings-view',
            'parent_id' => $settings->id,
        ]);

        Menu::create([
            'title' => 'Backup',
            'icon' => 'Inbox',
            'route' => '/backup',
            'order' => 3,
            'permission_name' => 'backup-view',
            'parent_id' => $settings->id,
        ]);

        // GROUP: Utilities
        $utilities = Menu::create([
            'title' => 'Utilities',
            'icon' => 'CreditCard',
            'route' => '#',
            'order' => 40,
            'permission_name' => 'utilities-view',
        ]);

        Menu::create([
            'title' => 'Audit Logs',
            'icon' => 'Activity',
            'route' => '/audit-logs',
            'order' => 2,
            'permission_name' => 'log-view',
            'parent_id' => $utilities->id,
        ]);

        Menu::create([
            'title' => 'File Manager',
            'icon' => 'Folder',
            'route' => '/files',
            'order' => 3,
            'permission_name' => 'filemanager-view',
            'parent_id' => $utilities->id,
        ]);
        // GROUP: Master Data
        $master_data = Menu::create([
            'title' => 'Master Data',
            'icon' => 'CreditCard',
            'route' => '#',
            'order' => 5,
            'permission_name' => 'master-data-view',
        ]);

        Menu::create([
            'title' => 'Dosen',
            'icon' => 'UserCircle',
            'route' => '/dosen',
            'order' => 2,
            'permission_name' => 'dosen-view',
            'parent_id' => $master_data->id,
        ]);

        Menu::create([
            'title' => 'Units',
            'icon' => 'Building2',
            'route' => '/units',
            'order' => 3,
            'permission_name' => 'units-view',
            'parent_id' => $master_data->id,
        ]);

        Menu::create([
            'title' => 'Periode',
            'icon' => 'CalendarRange',
            'route' => '/periodes',
            'order' => 4,
            'permission_name' => 'periodes-view',
            'parent_id' => $master_data->id,
        ]);
        
        Menu::create([
            'title' => 'Standar Mutu',
            'icon' => 'CheckCircle',
            'route' => '/standar-mutu',
            'order' => 2,
            'permission_name' => 'standar-mutu-view',
        ]);
        Menu::create([
            'title' => 'Audit Mutu Internal',
            'icon' => 'ClipboardCheck',
            'route' => '/audit-internal',
            'order' => 3,
            'permission_name' => 'audit-internal-view',
        ]);
        // Admin: Surveys management (Monev Dosen)
        Menu::create([
            'title' => 'Surveys',
            'icon' => 'ListChecks',
            'route' => '/admin/surveys',
            'order' => 4,
            'permission_name' => 'monev-dosen-manage',
        ]);

        Menu::create([
            'title' => 'Documents',
            'icon' => 'FileText',
            'route' => '/documents',
            'order' => 5,
            'permission_name' => 'documents-view',
        ]);
        // Monev Dosen (self-service survey)
        Menu::create([
            'title' => 'Monev Dosen',
            'icon' => 'ListChecks',
            'route' => '/monev-dosen',
            'order' => 6,
            'permission_name' => 'monev-dosen-view',
        ]);
        
        $permissions = Menu::pluck('permission_name')->unique()->filter();

        foreach ($permissions as $permName) {
            Permission::firstOrCreate(['name' => $permName]);
        }

        $role = Role::firstOrCreate(['name' => 'user']);
        $role->givePermissionTo('dashboard-view');
    }
}

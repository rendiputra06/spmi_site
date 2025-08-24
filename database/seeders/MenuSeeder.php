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
            'title' => 'Documents',
            'icon' => 'FileText',
            'route' => '/documents',
            'order' => 4,
            'permission_name' => 'documents-view',
        ]);

        $permissions = Menu::pluck('permission_name')->unique()->filter();

        foreach ($permissions as $permName) {
            Permission::firstOrCreate(['name' => $permName]);
        }

        $role = Role::firstOrCreate(['name' => 'user']);
        $role->givePermissionTo('dashboard-view');
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Buat role admin, auditor dan user jika belum ada
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $auditor = Role::firstOrCreate(['name' => 'auditor']);
        $user = Role::firstOrCreate(['name' => 'user']);

        // Daftar permission berdasarkan menu structure
        $permissions = [
            'Dashboard' => [
                'dashboard-view',
            ],
            'Access' => [
                'access-view',
                'permission-view',
                'users-view',
                'roles-view',
            ],
            'Settings' => [
                'settings-view',
                'menu-view',
                'app-settings-view',
                'backup-view',
            ],
            'Utilities' => [
                'utilities-view',
                'log-view',
                'filemanager-view',
            ],
            'Standar Mutu' => [
                'standar-mutu-view',
            ],
            'Master Data' => [
                'master-data-view',
                'dosen-view',                
                'units-view',
                'periodes-view',
            ],
            'Audit' => [
                'audit-internal-view',
                'audit-internal-manage',
                'auditee-submission-view',
                'auditee-submission-review',
                'documents-view',
            ],
        ];

        foreach ($permissions as $group => $perms) {
            foreach ($perms as $name) {
                $permission = Permission::firstOrCreate([
                    'name' => $name,
                    'group' => $group,
                ]);

                // Assign ke admin
                if (!$admin->hasPermissionTo($permission)) {
                    $admin->givePermissionTo($permission);
                }

                // Assign minimal ke user (auditee)
                if (in_array($name, ['documents-view','my-dosen-view', 'audit-internal-view', 'auditee-submission-view', 'my-dosen-view'])) {
                    if (!$user->hasPermissionTo($permission)) {
                        $user->givePermissionTo($permission);
                    }
                }

                // Assign minimal ke auditor (hanya akses yang dibutuhkan auditor)
                if (in_array($name, ['dashboard-view','my-dosen-view', 'documents-view', 'audit-internal-view', 'auditee-submission-review'])) {
                    if (!$auditor->hasPermissionTo($permission)) {
                        $auditor->givePermissionTo($permission);
                    }
                }
            }
        }
    }
}

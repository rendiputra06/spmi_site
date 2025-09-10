<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Buat role admin, auditor, user, dosen, dan gjm jika belum ada
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $auditor = Role::firstOrCreate(['name' => 'auditor']);
        $user = Role::firstOrCreate(['name' => 'user']);
        $dosen = Role::firstOrCreate(['name' => 'dosen']);
        $gjm = Role::firstOrCreate(['name' => 'gjm']);

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
                'users.impersonate'
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
                'mata-kuliah-view',
            ],
            'Audit' => [
                'audit-internal-view',
                'audit-internal-manage',
                'auditee-submission-view',
                'auditee-submission-review',
                'documents-view',
            ],
            'Kegiatan' => [
                'kegiatan-view',
                'monev-view',
                'monev-manage',
            ],
            'Monev Dosen' => [
                'monev-dosen-view',
            ],
        ];

        // Pastikan semua permission didefinisikan ada (idempotent)
        $allDefined = [];
        $guard = config('auth.defaults.guard', 'web');
        foreach ($permissions as $group => $perms) {
            foreach ($perms as $name) {
                Permission::firstOrCreate(
                    ['name' => $name, 'guard_name' => $guard],
                    ['group' => $group]
                );
                $allDefined[] = $name;
            }
        }

        // Daftar minimal per role (sinkronisasi ketat)
        $userMinimal = ['documents-view','my-dosen-view','monev-dosen-view', 'audit-internal-view', 'auditee-submission-view'];
        $auditorMinimal = ['dashboard-view','my-dosen-view', 'documents-view', 'audit-internal-view', 'auditee-submission-review'];
        // GJM membutuhkan akses ke menu Kegiatan/Monev (tanpa manage penuh), dan akses dasar
        $gjmMinimal = [
            'dashboard-view',
            'kegiatan-view',
            'monev-view',
            // bila diperlukan akses monev-dosen untuk isi sebagai dosen
            'monev-dosen-view',
        ];
        // Dosen role berfokus pada pengisian Monev Dosen
        $dosenMinimal = [
            'dashboard-view',
        ];

        // Sinkronisasi permissions agar sesuai definisi saat ini
        $admin->syncPermissions($allDefined);
        $user->syncPermissions(array_values(array_intersect($allDefined, $userMinimal)));
        $auditor->syncPermissions(array_values(array_intersect($allDefined, $auditorMinimal)));
        $gjm->syncPermissions(array_values(array_intersect($allDefined, $gjmMinimal)));
        $dosen->syncPermissions(array_values(array_intersect($allDefined, $dosenMinimal)));

        // Bersihkan cache permission agar perubahan langsung efektif
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }
}

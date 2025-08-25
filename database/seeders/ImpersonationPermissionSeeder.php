<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class ImpersonationPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure permission exists
        $permission = Permission::firstOrCreate([
            'name' => 'users.impersonate',
            'guard_name' => 'web',
        ]);

        $role = Role::where('name', 'admin')->first();
        if ($role) {
            $role->givePermissionTo($permission);
        }
    }
}

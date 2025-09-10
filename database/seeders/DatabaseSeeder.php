<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            UnitSeeder::class,
            DosenSeeder::class,
            StandarMutuSeeder::class,
            PeriodeAndAuditSessionSeeder::class,
            MonevTemplateSeeder::class,
            MonevSeeder::class,
        ]);

        $user = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin123'),
        ]);

        $user->assignRole('admin');

        $this->call([
            MenuSeeder::class,
            DocumentSeeder::class,
        ]);
    }
}

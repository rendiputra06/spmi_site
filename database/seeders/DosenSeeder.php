<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Dosen;
use App\Models\Unit;
use Illuminate\Support\Str;
use Illuminate\Support\Arr;

class DosenSeeder extends Seeder
{
    public function run(): void
    {
        $unitIds = Unit::query()->pluck('id')->all();
        $data = [
            [
                'nidn' => '0011223344',
                'nama' => 'Dr. Andi Saputra, M.Kom.',
                'email' => 'andi.saputra@example.com',
                'unit_id' => !empty($unitIds) ? Arr::random($unitIds) : null,
                'jabatan' => 'Lektor Kepala',
                'pangkat_golongan' => 'IV/a',
                'pendidikan_terakhir' => 'S3 Ilmu Komputer',
                'status' => true,
            ],
            [
                'nidn' => '0055667788',
                'nama' => 'Novi Lestari, S.T., M.T.',
                'email' => 'novi.lestari@example.com',
                'unit_id' => !empty($unitIds) ? Arr::random($unitIds) : null,
                'jabatan' => 'Lektor',
                'pangkat_golongan' => 'III/c',
                'pendidikan_terakhir' => 'S2 Teknik Industri',
                'status' => true,
            ],
            [
                'nidn' => '0099001122',
                'nama' => 'Budi Santoso, M.Kes.',
                'email' => 'budi.santoso@example.com',
                'unit_id' => !empty($unitIds) ? Arr::random($unitIds) : null,
                'jabatan' => 'Asisten Ahli',
                'pangkat_golongan' => 'III/b',
                'pendidikan_terakhir' => 'S2 Kesehatan',
                'status' => true,
            ],
        ];

        foreach ($data as $row) {
            Dosen::firstOrCreate(
                ['nidn' => $row['nidn']],
                $row
            );
        }

        // Tambah dummy random dosen untuk demo
        for ($i = 1; $i <= 17; $i++) {
            $nama = 'Dosen ' . $i;
            Dosen::firstOrCreate([
                'nidn' => str_pad((string)rand(1000000000, 1999999999), 10, '0', STR_PAD_LEFT),
            ], [
                'nama' => $nama,
                'email' => Str::slug($nama, '.') . "@example.com",
                'unit_id' => !empty($unitIds) ? Arr::random($unitIds) : null,
                'jabatan' => collect(['Asisten Ahli','Lektor','Lektor Kepala'])->random(),
                'pangkat_golongan' => collect(['III/a','III/b','III/c','IV/a','IV/b'])->random(),
                'pendidikan_terakhir' => collect(['S2','S3'])->random(),
                'status' => (bool)rand(0,1),
            ]);
        }
    }
}

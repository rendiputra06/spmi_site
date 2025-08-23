<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Unit;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        // Universitas
        $univ = Unit::firstOrCreate([
            'kode' => 'UNIV',
        ], [
            'nama' => 'Universitas Contoh',
            'tipe' => 'universitas',
            'status' => true,
        ]);

        // Fakultas
        $fik = Unit::firstOrCreate([
            'kode' => 'FIK',
        ], [
            'nama' => 'Fakultas Ilmu Komputer',
            'tipe' => 'fakultas',
            'parent_id' => $univ->id,
            'status' => true,
        ]);

        $ft = Unit::firstOrCreate([
            'kode' => 'FT',
        ], [
            'nama' => 'Fakultas Teknik',
            'tipe' => 'fakultas',
            'parent_id' => $univ->id,
            'status' => true,
        ]);

        // Prodi
        Unit::firstOrCreate([
            'kode' => 'IF',
        ], [
            'nama' => 'Program Studi Informatika',
            'tipe' => 'prodi',
            'parent_id' => $fik->id,
            'status' => true,
        ]);

        Unit::firstOrCreate([
            'kode' => 'SI',
        ], [
            'nama' => 'Program Studi Sistem Informasi',
            'tipe' => 'prodi',
            'parent_id' => $fik->id,
            'status' => true,
        ]);

        Unit::firstOrCreate([
            'kode' => 'TI',
        ], [
            'nama' => 'Program Studi Teknik Industri',
            'tipe' => 'prodi',
            'parent_id' => $ft->id,
            'status' => true,
        ]);

        // Unit penunjang
        Unit::firstOrCreate([
            'kode' => 'BAA',
        ], [
            'nama' => 'Biro Administrasi Akademik',
            'tipe' => 'unit',
            'parent_id' => $univ->id,
            'status' => true,
        ]);
    }
}

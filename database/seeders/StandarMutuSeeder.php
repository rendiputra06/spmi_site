<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StandarMutu;
use App\Models\Indikator;
use App\Models\Pertanyaan;

class StandarMutuSeeder extends Seeder
{
    public function run(): void
    {
        // Create 3 Standar Mutu
        for ($s = 1; $s <= 3; $s++) {
            $standar = StandarMutu::create([
                'kode' => sprintf('STD-%03d', $s),
                'nama' => 'Standar Mutu ' . $s,
                'deskripsi' => 'Deskripsi untuk Standar Mutu ' . $s,
                'status' => true,
            ]);

            // Each standar has 10 indikator
            for ($i = 1; $i <= 10; $i++) {
                $jenis = $i % 2 === 0 ? 'kualitatif' : 'kuantitatif';
                $indikator = Indikator::create([
                    'standar_id' => $standar->id,
                    'nama' => 'Indikator ' . $s . '.' . $i,
                    'kriteria_penilaian' => 'Kriteria penilaian untuk indikator ' . $s . '.' . $i,
                    'jenis_pengukuran' => $jenis,
                    'target_pencapaian' => $jenis === 'kuantitatif' ? rand(70, 100) . '%' : 'Memenuhi kriteria',
                    'urutan' => $i,
                ]);

                // Each indikator has 2 pertanyaan
                for ($p = 1; $p <= 2; $p++) {
                    Pertanyaan::create([
                        'indikator_id' => $indikator->id,
                        'isi' => 'Pertanyaan ' . $s . '.' . $i . '.' . $p,
                        'urutan' => $p,
                    ]);
                }
            }
        }
    }
}

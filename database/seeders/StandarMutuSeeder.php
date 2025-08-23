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
        $standar = StandarMutu::create([
            'kode' => 'STD-001',
            'nama' => 'Standar Pembelajaran',
            'deskripsi' => 'Standar proses pembelajaran di universitas',
            'status' => true,
        ]);

        $indikator1 = Indikator::create([
            'standar_id' => $standar->id,
            'nama' => 'Indikator 1',
            'urutan' => 1,
        ]);
        $indikator2 = Indikator::create([
            'standar_id' => $standar->id,
            'nama' => 'Indikator 2',
            'urutan' => 2,
        ]);

        Pertanyaan::create([
            'indikator_id' => $indikator1->id,
            'isi' => 'Apakah proses pembelajaran sudah sesuai standar?',
            'urutan' => 1,
        ]);
        Pertanyaan::create([
            'indikator_id' => $indikator1->id,
            'isi' => 'Bagaimana penilaian terhadap metode pembelajaran?',
            'urutan' => 2,
        ]);
        Pertanyaan::create([
            'indikator_id' => $indikator2->id,
            'isi' => 'Apakah sarana pembelajaran memadai?',
            'urutan' => 1,
        ]);
    }
}

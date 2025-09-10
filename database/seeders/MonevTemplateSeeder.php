<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MonevTemplate;
use App\Models\MonevTemplateQuestion;

class MonevTemplateSeeder extends Seeder
{
    public function run(): void
    {
        // Basic template: Evaluasi Perkuliahan
        $template = MonevTemplate::firstOrCreate(
            ['nama' => 'Evaluasi Perkuliahan Standar'],
            ['deskripsi' => 'Template baku untuk evaluasi perkuliahan (rating 1-5).']
        );

        $questions = [
            [
                'pertanyaan' => 'Kesesuaian RPS dengan pelaksanaan pembelajaran',
                'keterangan' => 'Seberapa sesuai RPS diimplementasikan dalam perkuliahan?',
                'aspek_penilaian' => "1: Sangat tidak sesuai\n3: Cukup sesuai\n5: Sangat sesuai",
                'skala' => ['Tidak sesuai', 'Kurang sesuai', 'Cukup', 'Sesuai', 'Sangat sesuai'],
                'urutan' => 1,
            ],
            [
                'pertanyaan' => 'Ketersediaan dan kualitas bahan ajar',
                'keterangan' => 'Bahan ajar tersedia tepat waktu dan bermutu?',
                'aspek_penilaian' => "1: Tidak tersedia/bermutu rendah\n3: Cukup\n5: Sangat baik",
                'skala' => ['Sangat kurang', 'Kurang', 'Cukup', 'Baik', 'Sangat baik'],
                'urutan' => 2,
            ],
            [
                'pertanyaan' => 'Pelaksanaan asesmen dan umpan balik',
                'keterangan' => 'Penilaian dan umpan balik diberikan tepat waktu?',
                'aspek_penilaian' => "1: Sangat tidak tepat waktu\n3: Cukup\n5: Selalu tepat waktu dan konstruktif",
                'skala' => ['Sangat buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat baik'],
                'urutan' => 3,
            ],
        ];

        foreach ($questions as $q) {
            MonevTemplateQuestion::firstOrCreate(
                [
                    'template_id' => $template->id,
                    'pertanyaan' => $q['pertanyaan'],
                ],
                [
                    'tipe' => 'rating_1_5',
                    'keterangan' => $q['keterangan'],
                    'aspek_penilaian' => $q['aspek_penilaian'],
                    'skala' => $q['skala'],
                    'urutan' => $q['urutan'],
                ]
            );
        }
    }
}

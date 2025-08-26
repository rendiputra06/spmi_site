<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Survey;
use App\Models\SurveyQuestion;
use App\Models\SurveyOption;
use App\Models\SurveyAssignment;
use App\Models\User;

class SurveyMonevDosenSeeder extends Seeder
{
    public function run(): void
    {
        // Create survey if not exists
        $survey = Survey::firstOrCreate(
            ['name' => 'Kuesioner Monev Dosen - Semester Ini'],
            [
                'description' => 'Instrumen monitoring dan evaluasi implementasi standar oleh dosen.',
                'is_active' => true,
            ]
        );

        // If has no questions, seed default questions and options
        if ($survey->questions()->count() === 0) {
            $order = 1;
            $likertQuestions = [
                'RPS disusun sesuai SOP unit.',
                'Pelaksanaan perkuliahan sesuai rencana mingguan.',
                'Evaluasi pembelajaran mengikuti ketentuan standar.',
                'Pengolahan dan pengunggahan nilai tepat waktu.',
                'Sarana-prasarana mendukung pelaksanaan pembelajaran.',
                'Sistem informasi akademik mendukung pelaksanaan standar.',
                'Layanan administrasi akademik responsif.',
                'Sosialisasi standar/SOP kepada dosen berjalan baik.',
                'Tindak lanjut monev sebelumnya dilaksanakan.',
                'Tingkat ketercapaian indikator mutu pada unit saya.',
            ];

            foreach ($likertQuestions as $text) {
                $q = SurveyQuestion::create([
                    'survey_id' => $survey->id,
                    'section' => 'Implementasi Standar',
                    'text' => $text,
                    'type' => 'likert',
                    'required' => true,
                    'order' => $order++,
                ]);

                // Likert 1-4
                $labels = [1 => 'Sangat Tidak Setuju', 2 => 'Tidak Setuju', 3 => 'Setuju', 4 => 'Sangat Setuju'];
                $o = 1;
                foreach ($labels as $val => $label) {
                    SurveyOption::create([
                        'question_id' => $q->id,
                        'label' => $label,
                        'value' => $val,
                        'order' => $o++,
                    ]);
                }
            }

            // Free text questions
            SurveyQuestion::create([
                'survey_id' => $survey->id,
                'section' => 'Isian Bebas',
                'text' => 'Kendala utama dalam implementasi standar?',
                'type' => 'text',
                'required' => false,
                'order' => $order++,
            ]);
            SurveyQuestion::create([
                'survey_id' => $survey->id,
                'section' => 'Isian Bebas',
                'text' => 'Saran perbaikan/RTL yang diusulkan',
                'type' => 'text',
                'required' => false,
                'order' => $order++,
            ]);
        }

        // Assign to users linked to dosen
        $users = User::whereHas('dosen')->get();
        foreach ($users as $user) {
            SurveyAssignment::firstOrCreate([
                'survey_id' => $survey->id,
                'user_id' => $user->id,
            ]);
        }
    }
}

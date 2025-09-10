<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\MonevSession;
use App\Models\MonevSessionProdi;
use App\Models\MonevEvaluation;
use App\Models\Periode;
use App\Models\Unit;
use App\Models\Dosen;
use App\Models\MataKuliah;
use App\Models\MonevTemplate;

class MonevSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil periode terbaru atau buat
        $periode = Periode::orderByDesc('id')->first();
        if (!$periode) {
            $periode = Periode::create([
                'nama' => 'Periode ' . now()->format('Y'),
                'tahun' => now()->year,
            ]);
        }

        // Buat sesi Monev contoh
        $session = MonevSession::firstOrCreate([
            'nama' => 'Monev ' . now()->year,
            'periode_id' => $periode->id,
            'tahun' => now()->year,
        ], [
            'tanggal_mulai' => now()->startOfMonth()->toDateString(),
            'tanggal_selesai' => now()->endOfMonth()->toDateString(),
        ]);

        // Pastikan ada minimal satu prodi, dosen, dan mata kuliah
        $unit = Unit::where('tipe', 'prodi')->orderBy('id')->first();
        if (!$unit) {
            $unit = Unit::create(['nama' => 'Prodi Contoh', 'tipe' => 'prodi']);
        }
        $dosen = Dosen::where('unit_id', $unit->id)->orderBy('id')->first();
        if (!$dosen) {
            $dosen = Dosen::create(['nama' => 'Dosen Contoh', 'unit_id' => $unit->id, 'nidn' => '000000']);
        }
        $mk = MataKuliah::where('unit_id', $unit->id)->orderBy('id')->first();
        if (!$mk) {
            $mk = MataKuliah::create(['nama' => 'Mata Kuliah Contoh', 'kode' => 'MK0000', 'sks' => 3, 'status' => true, 'unit_id' => $unit->id]);
        }

        if (!$unit || !$dosen || !$mk) {
            // Jika data tidak lengkap, hentikan dengan info
            $this->command?->warn('MonevSeeder: Data unit/dosen/mata kuliah tidak lengkap. Lewati pembuatan penugasan.');
            return;
        }

        // Pastikan prodi terdaftar pada sesi (wajib isi gjm_dosen_id)
        MonevSessionProdi::firstOrCreate(
            [
                'monev_session_id' => $session->id,
                'unit_id' => $unit->id,
            ],
            [
                'gjm_dosen_id' => $dosen->id,
            ]
        );

        // Ambil template atau buat default
        $template = MonevTemplate::with('questions')->orderBy('id')->first();
        if (!$template) {
            $template = MonevTemplate::create(['nama' => 'Template Default', 'deskripsi' => 'Template contoh 1-5']);
            $labels = ['Sangat Kurang', 'Kurang', 'Cukup', 'Baik', 'Sangat Baik'];
            $template->questions()->createMany([
                ['pertanyaan' => 'Kesiapan RPS', 'tipe' => 'rating_1_5', 'aspek_penilaian' => null, 'skala' => $labels, 'urutan' => 1],
                ['pertanyaan' => 'Pelaksanaan Perkuliahan', 'tipe' => 'rating_1_5', 'aspek_penilaian' => null, 'skala' => $labels, 'urutan' => 2],
            ]);
        }

        // Set template sesi jika belum
        if (!$session->template_id) {
            $session->template_id = $template->id;
            $session->save();
        }

        // Buat satu penugasan
        MonevEvaluation::firstOrCreate([
            'monev_session_id' => $session->id,
            'unit_id' => $unit->id,
            'mata_kuliah_id' => $mk->id,
            'dosen_id' => $dosen->id,
            'area' => 'Evaluasi Perkuliahan',
        ]);
    }
}

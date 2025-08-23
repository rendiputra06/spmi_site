<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Periode;
use App\Models\AuditSession;
use Illuminate\Support\Str;

class PeriodeAndAuditSessionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample periodes
        $periodes = [
            [
                'kode' => 'PRD-2024',
                'nama' => 'Periode AMI 2024',
                'mulai' => '2024-09-01',
                'selesai' => '2024-12-31',
                'keterangan' => 'Periode audit untuk tahun akademik 2024/2025',
                'status' => true,
                'is_active' => false,
            ],
            [
                'kode' => 'PRD-2025',
                'nama' => 'Periode AMI 2025',
                'mulai' => '2025-09-01',
                'selesai' => '2026-01-31',
                'keterangan' => 'Periode audit untuk tahun akademik 2025/2026',
                'status' => true,
                'is_active' => true,
            ],
        ];

        $createdPeriodes = [];
        foreach ($periodes as $p) {
            $createdPeriodes[$p['kode']] = Periode::firstOrCreate(
                ['kode' => $p['kode']],
                $p
            );
        }

        // Create sample audit sessions linked to periodes
        $sessions = [
            [
                'kode' => 'AMI-2024-GEN',
                'nama' => 'AMI Umum 2024',
                'periode_kode' => 'PRD-2024',
                'tanggal_mulai' => '2024-10-01',
                'tanggal_selesai' => '2024-12-15',
                'deskripsi' => 'Sesi audit umum seluruh unit untuk tahun 2024',
                'status' => true,
                'is_locked' => false,
            ],
            [
                'kode' => 'AMI-2025-GEN',
                'nama' => 'AMI Umum 2025',
                'periode_kode' => 'PRD-2025',
                'tanggal_mulai' => '2025-10-01',
                'tanggal_selesai' => '2026-01-15',
                'deskripsi' => 'Sesi audit umum seluruh unit untuk tahun 2025',
                'status' => true,
                'is_locked' => false,
            ],
        ];

        foreach ($sessions as $s) {
            $periode = $createdPeriodes[$s['periode_kode']] ?? null;

            AuditSession::firstOrCreate(
                ['kode' => $s['kode']],
                [
                    'nama' => $s['nama'],
                    'periode_id' => $periode?->id,
                    'tanggal_mulai' => $s['tanggal_mulai'],
                    'tanggal_selesai' => $s['tanggal_selesai'],
                    'deskripsi' => $s['deskripsi'],
                    'status' => $s['status'],
                    'is_locked' => $s['is_locked'],
                ]
            );
        }
    }
}

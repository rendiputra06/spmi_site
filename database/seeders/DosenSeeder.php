<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Arr;
use App\Models\Dosen;
use App\Models\Unit;
use App\Models\User;
use App\Models\AuditSession;
use App\Models\AuditSessionUnit;
use App\Models\AuditSessionUnitAuditor;
use App\Models\StandarMutu;
use App\Models\Indikator;
use App\Models\Pertanyaan;
use App\Models\AuditeeSubmission;
use App\Models\AuditorReview;

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

        // Wrap in transaction to keep test data consistent
        DB::transaction(function () use ($data, $unitIds) {
            $auditorUsers = [];

            // 1) Seed core dosen and ensure auditor users exist for them
            foreach ($data as $row) {
                /** @var Dosen $dosen */
                $dosen = Dosen::firstOrCreate(
                    ['nidn' => $row['nidn']],
                    $row
                );

                // Create or get user for this dosen
                $user = $dosen->user;
                if (!$user) {
                    $user = User::firstOrCreate(
                        ['email' => $dosen->email],
                        [
                            'name' => $dosen->nama,
                            'password' => Hash::make('password'),
                        ]
                    );
                    // Link back to dosen
                    if (!$dosen->user_id) {
                        $dosen->user_id = $user->id;
                        $dosen->save();
                    }
                }
                // Assign auditor role (role ensured by RolePermissionSeeder)
                if (!$user->hasRole('auditor')) {
                    $user->assignRole('auditor');
                }
                $auditorUsers[] = ['dosen' => $dosen, 'user' => $user];
            }

            // 2) Add some additional random dosen for demo (unchanged)
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

            // 3) Ensure minimal standar/indikator/pertanyaan exist
            $standar = StandarMutu::firstOrCreate(
                ['kode' => 'STD-01'],
                ['nama' => 'Standar Mutu Proses Akademik']
            );
            $indikator = Indikator::firstOrCreate(
                ['standar_id' => $standar->id, 'nama' => 'Kepatuhan Prosedur'],
                [
                    'kriteria_penilaian' => 'Dokumen dan implementasi terpenuhi',
                    'jenis_pengukuran' => 'kualitatif',
                    'target_pencapaian' => '100%',
                    'urutan' => 1,
                ]
            );
            $pertanyaan1 = Pertanyaan::firstOrCreate(
                ['indikator_id' => $indikator->id, 'urutan' => 1],
                ['isi' => 'Apakah SOP telah diterapkan dengan konsisten?']
            );
            $pertanyaan2 = Pertanyaan::firstOrCreate(
                ['indikator_id' => $indikator->id, 'urutan' => 2],
                ['isi' => 'Apakah terdapat bukti sosialisasi SOP?']
            );

            // 4) Create an active audit session
            $today = now()->toDateString();
            $session = AuditSession::firstOrCreate(
                ['kode' => 'AMI-DEMO'],
                [
                    'nama' => 'Audit Mutu Internal Demo',
                    'tanggal_mulai' => $today,
                    'tanggal_selesai' => now()->addDays(7)->toDateString(),
                    'deskripsi' => 'Sesi demo untuk simulasi auditor dan auditee',
                    'status' => true,
                    'is_locked' => false,
                ]
            );
            // Attach standar to session (pivot audit_session_standars)
            $session->standars()->syncWithoutDetaching([$standar->id]);

            // 5) Pick 3 units and assign 3 auditors (if available)
            $unitPick = array_slice($unitIds, 0, 3);
            // If unit list is smaller, fill with random repeats
            if (count($unitPick) < 3 && !empty($unitIds)) {
                while (count($unitPick) < 3) {
                    $unitPick[] = Arr::random($unitIds);
                }
            }

            $assignments = [];
            foreach ($unitPick as $idx => $uid) {
                $su = AuditSessionUnit::firstOrCreate(
                    ['audit_session_id' => $session->id, 'unit_id' => $uid]
                );
                // map auditor user/dosen cyclically
                if (!empty($auditorUsers)) {
                    $aud = $auditorUsers[$idx % count($auditorUsers)]['dosen'];
                    AuditSessionUnitAuditor::firstOrCreate(
                        [
                            'audit_session_unit_id' => $su->id,
                            'dosen_id' => $aud->id,
                            'role' => 'auditor',
                        ]
                    );
                    $assignments[] = ['session_unit' => $su, 'auditor_dosen' => $aud, 'auditor_user' => $auditorUsers[$idx % count($auditorUsers)]['user']];
                }
            }

            // 6) Seed minimal auditee submissions and auditor reviews for simulation
            foreach ($assignments as $as) {
                $su = $as['session_unit'];
                $reviewerUser = $as['auditor_user'];
                // Two questions per unit
                foreach ([$pertanyaan1, $pertanyaan2] as $qIdx => $pert) {
                    $submission = AuditeeSubmission::firstOrCreate(
                        [
                            'audit_session_id' => $session->id,
                            'unit_id' => $su->unit_id,
                            'standar_mutu_id' => $standar->id,
                            'indikator_id' => $indikator->id,
                            'pertanyaan_id' => $pert->id,
                        ],
                        [
                            'note' => $qIdx === 0 ? 'SOP telah disosialisasikan ke seluruh dosen.' : 'Tersedia bukti sosialisasi berupa notulen dan foto.',
                            'status' => 'submitted',
                            'submitted_at' => now(),
                            // submitted_by can be null for demo
                        ]
                    );

                    AuditorReview::updateOrCreate(
                        ['auditee_submission_id' => $submission->id],
                        [
                            'score' => $qIdx === 0 ? 1.8 : 1.6,
                            'reviewer_note' => $qIdx === 0 ? 'Sudah sangat baik, minor perbaikan dokumentasi.' : 'Cukup baik, tambahkan bukti tambahan untuk konsistensi.',
                            'reviewed_by' => $reviewerUser->id,
                            'reviewed_at' => now(),
                        ]
                    );
                }
            }
        });

        
    }
}

# Rekomendasi Pengembangan Modul Kegiatan SPMI

Dokumen ini merangkum analisis cepat terhadap proyek dan usulan modul selanjutnya yang berhubungan dengan “kegiatan” di siklus SPMI/AMI, beserta prioritas implementasi bertahap.

## Ringkasan Kondisi Saat Ini

- Sistem berbasis Laravel 12 + React (Inertia) + TS + Tailwind + ShadCN.
- Autentikasi, Role & Permission, Menu dinamis, Settings, Audit Log, Backup, File Manager: SUDAH ADA (`routes/web.php`).
- Domain AMI/Standar Mutu:
  - Model inti: `AuditSession`, `StandarMutu`, `Indikator`, `Pertanyaan`, `Unit`, `Dosen`/Auditor, `AuditeeSubmission`, `AuditorReview`, `Periode` (lihat `app/Models/`).
  - Alur: setup sesi AMI, pilih standar, assign unit & auditor, auditee mengisi, auditor review. Tampilan detail via `resources/js/pages/audit-internal/Detail.tsx` dan tab terkait.
- Laporan awal tersedia (ReportTab) dengan filter & eksport CSV.

## Kesenjangan & Peluang

- Belum ada manajemen “Kegiatan” terstruktur lintas siklus SPMI (perencanaan–pelaksanaan–evaluasi–tindak lanjut).
- Tindak lanjut temuan (CAPA/Rencana Perbaikan) belum menjadi modul tersendiri.
- Penjadwalan & kalender lintas unit belum sentral.
- Monitoring status, SLA, reminder, notifikasi belum komprehensif.
- Integrasi dokumen kegiatan (TOR, undangan, notulensi, bukti) belum terstandar.
- Dashboard KPI/indikator proses kegiatan belum ada.

## Usulan Modul Terkait Kegiatan

1) Kegiatan SPMI (Master + Lifecycle)
- Tujuan: wadah semua kegiatan mutu (sosialisasi, workshop, audit, monev, rapat Tinjauan Manajemen, dll).
- Fitur:
  - CRUD kegiatan: judul, jenis, tujuan, periode, penanggung jawab, peserta/undangan, lokasi, mode (online/offline), status.
  - Tahapan kegiatan: rencana → pelaksanaan → dokumentasi → evaluasi.
  - Lampiran dokumen: TOR, undangan, daftar hadir, materi, notulensi, foto, bukti.
  - Relasi ke `AuditSession`/`Unit` jika relevan.
- Entitas baru: `Kegiatan`, `KegiatanPeserta` (pivot User/Unit), `KegiatanDokumen`.

2) Penjadwalan & Kalender
- Kalender global (bulanan/mingguan) yang menampilkan semua kegiatan + jadwal audit.
- Sinkronisasi ke iCal export; filter per unit/penanggung jawab/jenis kegiatan.
- Reminder otomatis (email/telegram/whatsapp gateway opsional).

3) Tugas & SLA Kegiatan
- Breakdown tugas per kegiatan (to-do), penugasan, due date, progres, checklist.
- SLA untuk tindakan: keterlambatan, eskalasi, reminder.
- Entitas: `Task`, `TaskAssignee`, `TaskComment`, log aktivitas.

4) CAPA / Rencana Tindak Lanjut (Temuan AMI)
- Turunan dari `AuditeeSubmission`/`AuditorReview` → buat `ActionPlan`.
- Field: akar masalah, rencana tindakan, PIC, target tanggal, indikator keberhasilan, eviden.
- Status workflow: draft → disetujui → berjalan → selesai → verifikasi.
- Laporan progres CAPA per unit/standar.

5) Notulensi & Rapat Tinjauan Manajemen
- Modul Rapat (khusus) dengan agenda, keputusan, rencana tindak lanjut yang otomatis memunculkan `Task`/`ActionPlan`.
- Template notulensi dan persetujuan digital.

6) Monitoring & Dashboard Kegiatan
- KPI proses: jumlah kegiatan per periode, tingkat ketercapaian, keterlambatan, attendance.
- KPI AMI: tingkat penyelesaian CAPA, rata-rata skor, distribusi temuan per standar/unit.
- Widget untuk pimpinan dan unit.

7) Manajemen Dokumen Kegiatan
- Struktur folder per kegiatan, penamaan baku, tagging.
- Tautan ke Media/File Manager yang sudah ada, dengan metadata tambahan (jenis bukti, tanggal, pemilik).

8) Notifikasi & Komunikasi
- Template notifikasi untuk undangan kegiatan, reminder tugas, due CAPA, status review.
- Channel: email (default), integrasi optional Telegram/WA gateway.

9) Pelaporan & Ekspor
- Ekspor PDF/CSV untuk daftar kegiatan, daftar hadir, rekap tugas, progres CAPA, notulensi.
- Template surat/undangan otomatis dari data kegiatan.

10) API & Integrasi
- API untuk sinkronisasi peserta (dengan SI Akademik), dosen/unit, kalender.
- Webhook event (kegiatan dibuat, tugas overdue, CAPA selesai).

## Skema Data Tingkat Tinggi (Ringkas)

- Kegiatan(id, judul, jenis, periode_id, pj_user_id, unit_id, lokasi, mode, waktu_mulai, waktu_selesai, status, deskripsi)
- KegiatanPeserta(id, kegiatan_id, user_id|unit_id, peran, hadir, catatan)
- KegiatanDokumen(id, kegiatan_id, media_id|path, jenis, keterangan)
- Task(id, kegiatan_id|null, title, description, due_at, status, priority, created_by)
- TaskAssignee(task_id, user_id)
- TaskComment(id, task_id, user_id, body)
- ActionPlan(id, source_type, source_id, unit_id, pic_id, target_date, status, root_cause, action, success_indicator)
- ActionPlanEvidence(id, action_plan_id, media_id|path, keterangan)

Catatan: `source_type/source_id` menghubungkan CAPA ke temuan AMI dari `AuditeeSubmission`/`AuditorReview`.

## Perubahan UI/UX yang Disarankan

- Menu baru: “Kegiatan” (kalender + list + detail).
- Tab baru pada Detail AMI: “Tindak Lanjut (CAPA)”.
- Komponen reusable: `CalendarView`, `TaskBoard (kanban)`, `ActionPlanForm`, `EvidenceUploader`.
- Responsif: kartu ringkas untuk mobile (sudah diterapkan di ReportTable — lanjutkan pola ini).

## Keamanan & Tata Kelola

- Permission granular (Spatie):
  - kegiatan.view/create/update/delete
  - task.assign/update/comment
  - capa.create/verify/close
- Session & cookie secure pada HTTPS, audit trail untuk perubahan status CAPA/task.
- Retensi data dan arsip kegiatan per periode.

## Roadmap Implementasi (Tahap Bertahap)

- Tahap 1 (Prioritas):
  - Modul Kegiatan (CRUD + list + detail + dokumen)
  - Kalender & Reminder email dasar
  - Task sederhana di dalam Kegiatan
- Tahap 2:
  - CAPA terintegrasi dari temuan AMI, dashboard progres CAPA
  - Task board (kanban) + SLA dan eskalasi
- Tahap 3:
  - Rapat & Notulensi terintegrasi (generate task/action plan)
  - Integrasi Telegram/WA gateway (opsional)
  - Ekspor PDF laporan kegiatan & undangan
- Tahap 4:
  - API integrasi dengan SI Akademik
  - KPI dashboard pimpinan + laporan periodik otomatis

## Catatan Teknis Implementasi

- Backend: resource controller baru untuk `Kegiatan`, `Task`, `ActionPlan` dengan policy per role.
- Frontend: halaman Inertia baru (`/kegiatan`, `/kegiatan/:id`), komponen form + calendar (lib: FullCalendar atau lightweight alternatif).
- Gunakan storage & media pipeline yang sudah ada (MediaFolder/Files) untuk eviden.
- Migrasi DB bertahap, seed minimal untuk jenis kegiatan & status CAPA.

---

Silakan beri arahan prioritas bisnis agar saya bisa mulai membuat struktur tabel, model, controller, dan skeleton UI untuk modul Tahap 1.

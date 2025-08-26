# Monev Dosen (Monitoring & Evaluasi Dosen)

Tujuan:
- Mengumpulkan umpan balik dosen terkait implementasi standar mutu (SOP) dan dukungan layanan.
- Mendukung evaluasi tahap E (PPEPP) dan menghasilkan rekomendasi RTL.

Ruang Lingkup:
- Responden: Dosen aktif (terhubung dengan tabel `dosen`).
- Bidang: Akademik, SDM, Sarpras, SI/IT, Layanan administrasi, Penelitian/PKM.
- Periode: per semester/tahun (ikut `period_id` bila diperlukan).

Fitur MVP:
- Listing survei yang ditugaskan ke dosen (status: draft/submitted).
- Form pengisian kuesioner (Likert 1–4/5 dan teks bebas).
- Submit jawaban dan kunci assignment.
- Dashboard sederhana (opsional tahap berikutnya).

Skema DB (tabel):
- surveys(id, name, description, is_active, starts_at, ends_at, timestamps)
- survey_questions(id, survey_id, section, text, type[likert|text], order, required)
- survey_options(id, question_id, label, value)
- survey_assignments(id, survey_id, user_id, status[draft|submitted], submitted_at, timestamps)
- survey_answers(id, assignment_id, question_id, value_text, value_numeric)

Alur Pengguna:
1) Admin menyiapkan survei dan pertanyaan (via seeder/admin UI tahap lanjutan).
2) Assignment dibuat untuk dosen (via seeder/admin UI tahap lanjutan).
3) Dosen login → Menu "Monev Dosen" → melihat survei aktif → mengisi → submit.

Hak Akses & Menu:
- Permission: `monev-dosen-view` (akses halaman monev dosen).
- Menu: "Monev Dosen" ditambahkan ke sidebar untuk role dengan permission tersebut.

UI (Inertia React):
- `monev-dosen/Index.tsx`: daftar assignment (judul survei, status, tombol isi/lihat).
- `monev-dosen/Fill.tsx`: form dinamis dari pertanyaan (likert/text), tombol submit.

Validasi & Aturan:
- Hanya owner assignment yang boleh mengisi.
- Assignment submitted tidak dapat diedit (kecuali fitur revisi di tahap berikutnya).
- Pertanyaan `required` wajib diisi.

Pengembangan Lanjutan (opsional):
- Manajemen survei di admin (CRUD survei/pertanyaan/assignment).
- Laporan agregat per unit/indikator (heatmap, ekspor CSV).
- Integrasi periode (`periodes`) bila dibutuhkan.

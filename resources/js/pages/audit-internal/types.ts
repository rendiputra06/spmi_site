export type AuditSession = {
  id: number;
  kode: string;
  nama: string;
  periode_id?: number | null;
  periode?: { id: number; nama: string } | null;
  tanggal_mulai: string;
  tanggal_selesai: string;
  deskripsi?: string | null;
  status: boolean;
  is_locked: boolean;
};

export type AuditSessionFormData = {
  kode: string;
  nama: string;
  periode_id?: number | '';
  tanggal_mulai: string; // yyyy-mm-dd
  tanggal_selesai: string; // yyyy-mm-dd
  deskripsi?: string;
  status: boolean;
  is_locked: boolean;
};

export type Option = { id: number; nama: string; kode?: string };

export type StandarOption = { id: number; kode: string; nama: string };

export type UnitOption = { id: number; nama: string; tipe: string };

export type AuditorOption = { id: number; nama: string; nidn?: string };

export type CanFlags = { manage: boolean; respond: boolean; review?: boolean };

export type Pertanyaan = { id: number; isi: string; urutan: number };
export type Indikator = {
  id: number;
  nama: string;
  urutan: number;
  kriteria_penilaian?: string | null;
  jenis_pengukuran: 'kuantitatif' | 'kualitatif';
  target_pencapaian?: string | null;
  pertanyaan: Pertanyaan[];
};
export type StandarWithChildren = {
  id: number;
  kode: string;
  nama: string;
  indikator: Indikator[];
};

// Row type for Laporan tab
export type ReportRow = {
  id: number;
  unit: { id: number; nama: string; tipe: string };
  standar: { id: number; kode: string; nama: string };
  indikator: { id: number; nama: string } | null;
  pertanyaan: { id: number; isi: string } | null;
  note?: string | null;
  status?: string | null;
  score?: number | string | null; // auditee score if any
  submitted_by?: number | null;
  submitted_at?: string | null;
  auditorReview?: {
    score?: number | string | null;
    reviewer_note?: string | null;
    reviewed_by?: number | null;
    reviewed_at?: string | null;
  } | null;
};

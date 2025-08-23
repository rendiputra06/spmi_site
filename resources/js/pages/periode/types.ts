export type Periode = {
  id: number;
  kode: string;
  nama: string;
  mulai: string; // ISO date
  selesai: string; // ISO date
  keterangan?: string | null;
  status: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PeriodeFormData = {
  kode: string;
  nama: string;
  mulai: string; // yyyy-mm-dd
  selesai: string; // yyyy-mm-dd
  keterangan?: string;
  status: boolean;
  is_active: boolean;
};

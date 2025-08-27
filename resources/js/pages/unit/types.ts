export type Unit = {
  id: number;
  kode: string;
  nama: string;
  tipe: 'universitas' | 'fakultas' | 'prodi' | 'unit';
  parent_id?: number | null;
  parent?: { id: number; nama: string; tipe: string } | null;
  leader_id?: number | null;
  leader_nama?: string | null;
  leader_jabatan?: string | null;
  // eager loaded relation from backend: leaderDosen()
  leader_dosen?: { id: number; nama: string; nidn?: string | null } | null;
  status: boolean;
  created_at?: string;
  updated_at?: string;
};

export type UnitFormData = {
  kode: string;
  nama: string;
  tipe: 'universitas' | 'fakultas' | 'prodi' | 'unit';
  parent_id?: number | '';
  leader_id?: number | '';
  leader_nama?: string;
  leader_jabatan?: string;
  status: boolean;
};

export type Option = { id: number; nama: string; tipe?: string; nidn?: string };

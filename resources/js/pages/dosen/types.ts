export type Dosen = {
  id: number;
  nidn: string;
  nama: string;
  email: string;
  unit_id?: number | null;
  unit?: { id: number; nama: string; tipe?: string } | null;
  user_id?: number | null;
  jabatan?: string | null;
  pangkat_golongan?: string | null;
  pendidikan_terakhir?: string | null;
  status: boolean;
  created_at?: string;
  updated_at?: string;
};

export type DosenFormData = {
  nidn: string;
  nama: string;
  email: string;
  unit_id?: number | '';
  jabatan?: string;
  pangkat_golongan?: string;
  pendidikan_terakhir?: string;
  status: boolean;
  create_user?: boolean;
  send_invite?: boolean;
  user_roles?: string[];
  password?: string;
};

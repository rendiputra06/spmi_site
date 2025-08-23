export type Dosen = {
  id: number;
  nidn: string;
  nama: string;
  email: string;
  user_id?: number | null;
  prodi?: string | null;
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
  prodi?: string;
  jabatan?: string;
  pangkat_golongan?: string;
  pendidikan_terakhir?: string;
  status: boolean;
  create_user?: boolean;
  send_invite?: boolean;
  user_roles?: string[];
  password?: string;
};

export type UnitOption = { id: number; nama: string; tipe?: string | null };

export type DocumentItem = {
  id: number;
  unit_id: number | null;
  uploaded_by: number;
  title: string;
  description?: string | null;
  category?: string | null;
  status: 'draft' | 'published' | 'archived' | string;
  file_path: string;
  mime?: string | null;
  size: number;
  created_at: string;
  updated_at: string;
  unit?: { id: number; nama: string; tipe?: string | null } | null;
  uploader?: { id: number; name: string; email: string } | null;
};

export type DocumentFormData = {
  title: string;
  description?: string;
  category?: string;
  status?: 'draft' | 'published' | 'archived' | '';
  unit_id?: string | number | '';
  file: File | null;
};

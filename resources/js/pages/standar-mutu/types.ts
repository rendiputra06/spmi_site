// Base types
export type ModalType = 'add' | 'edit' | 'delete' | null;

export interface Timestamps {
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Pertanyaan (Question) types
export interface Pertanyaan extends Timestamps {
  id: number;
  isi: string;
  indikator_id: number;
  // Add other pertanyaan fields as needed
}

// Indikator types
export interface Indikator extends Timestamps {
  id: number;
  nama: string;
  kriteria_penilaian?: string | null;
  jenis_pengukuran: 'kuantitatif' | 'kualitatif';
  target_pencapaian?: string | null;
  standar_id: number;
  pertanyaan?: Pertanyaan[];
  // Add other indikator fields as needed
}

// Standar Mutu types
export interface StandarMutu extends Timestamps {
  id: number;
  kode: string;
  nama: string;
  deskripsi: string;
  status: boolean;
  jumlah_indikator: number;
  jumlah_pertanyaan?: number;
  indikator?: Indikator[];
}

// Form Data types
export interface StandarMutuFormData {
  [key: string]: any;
  kode: string;
  nama: string;
  deskripsi: string;
  status: boolean;
}

export interface IndikatorFormData {
  nama: string;
  kriteria_penilaian?: string | null;
  jenis_pengukuran: 'kuantitatif' | 'kualitatif';
  target_pencapaian?: string | null;
  standar_id: number;
}

export interface PertanyaanFormData {
  isi: string;
  indikator_id: number;
}

// Props types
export interface StandarMutuIndexProps {
  standar: {
    data: StandarMutu[];
    current_page: number;
    per_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  search?: string;
  status?: string;
  error?: string;
  filterStatus?: string;
}

export interface StandarMutuDetailProps {
  standar: StandarMutu;
}

// Component props
export interface IndikatorListProps {
  indikators: Indikator[];
  onEdit: (indikator: Indikator) => void;
  onDelete: (indikator: Indikator) => void;
  onAddPertanyaan: (indikator: Indikator) => void;
}

export interface IndikatorItemProps {
  indikator: Indikator;
  index: number;
  onEdit: (indikator: Indikator) => void;
  onDelete: (indikator: Indikator) => void;
  onAddPertanyaan: (indikator: Indikator) => void;
}

export interface PertanyaanListProps {
  pertanyaans: Pertanyaan[];
  indikator: Indikator;
  onEdit: (pertanyaan: Pertanyaan, indikator: Indikator) => void;
  onDelete: (pertanyaan: Pertanyaan, indikator: Indikator) => void;
}

export interface PertanyaanItemProps {
  pertanyaan: Pertanyaan;
  index: number;
  indikator: Indikator;
  onEdit: (pertanyaan: Pertanyaan, indikator: Indikator) => void;
  onDelete: (pertanyaan: Pertanyaan, indikator: Indikator) => void;
}

// Form props
export interface IndikatorFormProps {
  initialData?: Partial<IndikatorFormData>;
  onSubmit: (data: IndikatorFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  errors?: Record<string, string>;
}

export interface PertanyaanFormProps {
  initialData?: Partial<PertanyaanFormData>;
  onSubmit: (data: PertanyaanFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  errors?: Record<string, string>;
}

// Dialog types
export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
}

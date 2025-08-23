import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface Setting {
    nama_app: string;
    logo?: string;
    warna?: string;
    seo?: {
      title?: string;
      description?: string;
      keywords?: string;
    };
  }
  
  export interface SharedData {
      name: string;
      quote: { message: string; author: string };
      auth: Auth;
      setting?: Setting;
      [key: string]: unknown;
  }

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Permission {
    id: number;
    name: string;
    group?: string | null;
    guard_name?: string;
    created_at?: string;
    updated_at?: string;
  }

export interface Pertanyaan {
    id: number;
    indikator_id: number;
    isi: string;
    urutan: number;
}

export interface Indikator {
    id: number;
    standar_id: number;
    nama: string;
    urutan: number;
    pertanyaan: Pertanyaan[];
}

export interface StandarMutu {
    id: number;
    kode: string;
    nama: string;
    deskripsi: string | null;
    status: boolean;
    jumlah_indikator?: number;
    jumlah_pertanyaan?: number;
    indikator?: Indikator[];
}

export interface PaginatedResponse<T> {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
    last_page: number;
    last_page_url: string;
}
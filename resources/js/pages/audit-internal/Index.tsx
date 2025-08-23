import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { router, useForm } from '@inertiajs/react';
import { Search, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import type { AuditSession, AuditSessionFormData, Option } from './types';
import dayjs from 'dayjs';

interface AMIIndexProps {
  sessions: {
    data: AuditSession[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  search?: string;
  periode_options: Option[];
}

const computeStatus = (row: AuditSession) => {
  const now = dayjs();
  const mulai = row.tanggal_mulai ? dayjs(row.tanggal_mulai) : null;
  const selesai = row.tanggal_selesai ? dayjs(row.tanggal_selesai) : null;
  if (mulai && selesai) {
    if (now.isBefore(mulai, 'day')) return { text: 'Akan datang', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (now.isAfter(selesai, 'day')) return { text: 'Selesai', color: 'bg-gray-50 text-gray-700 border-gray-200' };
    return { text: 'Aktif', color: 'bg-green-50 text-green-700 border-green-200' };
  }
  return { text: 'Tidak diketahui', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
};

type ModalType = 'add' | 'edit' | 'delete' | null;

export default function AMIIndex({ sessions, search, periode_options }: AMIIndexProps) {
  const [query, setQuery] = useState(search || '');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<AuditSession | null>(null);

  const { data, setData, post, put, reset, errors, processing } = useForm<AuditSessionFormData>({
    kode: '',
    nama: '',
    periode_id: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    deskripsi: '',
    status: true,
    is_locked: false,
  });

  const toYMD = (value: string) => (value && value.includes('T') ? value.split('T')[0] : value);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query !== search) {
      router.get('/audit-internal', { search: query }, { preserveState: true, preserveScroll: true });
    }
  };

  const handleResetSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setQuery('');
    if (search) router.get('/audit-internal', {}, { preserveState: true, preserveScroll: true });
  };

  const openAddModal = () => {
    reset();
    setModalType('add');
    setIsDialogOpen(true);
  };

  const openEditModal = (row: AuditSession) => {
    setData('kode', row.kode);
    setData('nama', row.nama);
    setData('periode_id', (row.periode_id as number) || '');
    setData('tanggal_mulai', toYMD(row.tanggal_mulai));
    setData('tanggal_selesai', toYMD(row.tanggal_selesai));
    setData('deskripsi', row.deskripsi || '');
    setData('status', row.status);
    setData('is_locked', row.is_locked);
    setEditId(row.id);
    setModalType('edit');
    setIsDialogOpen(true);
  };

  const openDetail = (row: AuditSession) => {
    router.get(`/audit-internal/${row.id}/detail`);
  };

  const confirmDelete = (row: AuditSession) => {
    setDeleteRow(row);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!deleteRow) return;
    router.delete(`/audit-internal/${deleteRow.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setIsDeleteOpen(false);
        setDeleteRow(null);
        setRecentlySuccessful(true);
        setTimeout(() => setRecentlySuccessful(false), 2000);
      },
      onFinish: () => {
        setIsDeleteOpen(false);
        setDeleteRow(null);
      },
    });
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > sessions.last_page || page === sessions.current_page) return;
    router.get('/audit-internal', { page, ...(query ? { search: query } : {}) }, { preserveState: true, preserveScroll: true, replace: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.kode || !data.nama || !data.tanggal_mulai || !data.tanggal_selesai) {
      alert('Mohon lengkapi Kode, Nama, Tanggal Mulai, dan Tanggal Selesai');
      return;
    }

    if (modalType === 'add') {
      post('/audit-internal', {
        onSuccess: () => {
          setIsDialogOpen(false);
          setRecentlySuccessful(true);
          setTimeout(() => setRecentlySuccessful(false), 2000);
        },
      });
    } else if (modalType === 'edit' && editId) {
      put(`/audit-internal/${editId}`, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setRecentlySuccessful(true);
          setTimeout(() => setRecentlySuccessful(false), 2000);
        },
      });
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Audit Mutu Internal', href: '/audit-internal' }]} title="Audit Mutu Internal">
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Audit Mutu Internal</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.reload({ only: ['sessions'] })} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>Muat Ulang</span>
            </Button>
            <Button onClick={openAddModal}>Buat Sesi</Button>
          </div>
        </div>

        <div className="bg-background rounded-lg border p-4">
          {/* Search */}
          <form onSubmit={(e) => e.preventDefault()} className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari sesi (kode, nama, deskripsi)..."
                  className="w-full pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSearch} disabled={processing}>
                  <Search className="mr-2 h-4 w-4" />
                  Cari
                </Button>
                <Button variant="outline" onClick={handleResetSearch} disabled={!query && !search}>
                  Reset
                </Button>
              </div>
            </div>
          </form>

          {recentlySuccessful && (
            <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">Data berhasil disimpan</div>
          )}

          {/* List */}
          {sessions.data.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Belum ada sesi audit</p>
              <Button variant="outline" className="mt-4" onClick={openAddModal}>
                + Buat Sesi
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.data.map((row) => {
                const status = computeStatus(row);
                return (
                <div key={row.id} className="flex items-start justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">{row.nama}</h3>
                      <span className="rounded bg-muted px-2 py-0.5 text-xs">{row.kode}</span>
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${status.color}`}>{status.text}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Periode: {row.periode?.nama || '-'}</p>
                    <p className="text-sm text-muted-foreground">Tanggal: {toYMD(row.tanggal_mulai)} s/d {toYMD(row.tanggal_selesai)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openDetail(row)}>Detail</Button>
                    <Button variant="outline" size="sm" onClick={() => openEditModal(row)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => confirmDelete(row)}>Hapus</Button>
                  </div>
                </div>
              );})}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Halaman {sessions.current_page} dari {sessions.last_page} • Total {sessions.total} data
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => goToPage(sessions.current_page - 1)} disabled={sessions.current_page <= 1}>
                Sebelumnya
              </Button>
              <Button variant="outline" onClick={() => goToPage(sessions.current_page + 1)} disabled={sessions.current_page >= sessions.last_page}>
                Berikutnya
              </Button>
            </div>
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${isDialogOpen && modalType !== 'delete' ? 'block' : 'hidden'}`}>
          <div className="mx-4 w-full max-w-xl rounded-lg bg-background p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-semibold">{modalType === 'add' ? 'Buat' : 'Edit'} Sesi Audit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Kode</label>
                  <Input value={data.kode} onChange={(e) => setData('kode', e.target.value)} required disabled={processing || modalType==='edit'} />
                  <div className="text-xs text-destructive">{(errors as any).kode}</div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Nama</label>
                  <Input value={data.nama} onChange={(e) => setData('nama', e.target.value)} required disabled={processing} />
                  <div className="text-xs text-destructive">{(errors as any).nama}</div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Periode</label>
                  <select className="h-9 rounded border px-3" value={(data.periode_id as number) || ''} onChange={(e) => setData('periode_id', e.target.value ? Number(e.target.value) : '')}>
                    <option value="">-</option>
                    {periode_options.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Tanggal Mulai</label>
                  <Input type="date" value={data.tanggal_mulai} onChange={(e) => setData('tanggal_mulai', e.target.value)} required />
                  <div className="text-xs text-destructive">{(errors as any).tanggal_mulai}</div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Tanggal Selesai</label>
                  <Input type="date" value={data.tanggal_selesai} onChange={(e) => setData('tanggal_selesai', e.target.value)} required />
                  <div className="text-xs text-destructive">{(errors as any).tanggal_selesai}</div>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Deskripsi</label>
                <textarea className="min-h-[80px] rounded border p-2 text-sm" value={data.deskripsi || ''} onChange={(e) => setData('deskripsi', e.target.value)} />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Status</label>
                  <select className="h-9 rounded border px-3" value={data.status ? '1' : '0'} onChange={(e) => setData('status', e.target.value === '1')}>
                    <option value="1">Aktif</option>
                    <option value="0">Non-aktif</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Kunci (Lock)</label>
                  <select className="h-9 rounded border px-3" value={data.is_locked ? '1' : '0'} onChange={(e) => setData('is_locked', e.target.value === '1')}>
                    <option value="0">Tidak</option>
                    <option value="1">Ya</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); reset(); }} disabled={processing}>
                  Batal
                </Button>
                <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Delete Confirmation */}
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${isDeleteOpen ? 'block' : 'hidden'}`}>
          <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Hapus Sesi</h2>
            <p className="mb-6 text-sm text-muted-foreground">Apakah Anda yakin menghapus sesi {deleteRow ? (<span className="font-medium">{deleteRow.nama}</span>) : null}? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsDeleteOpen(false); setDeleteRow(null); }}>Batal</Button>
              <Button variant="destructive" onClick={handleDelete}>Ya, Hapus</Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { router, useForm } from '@inertiajs/react';
import { Search, RefreshCw } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { AuditSession, AuditSessionFormData, Option, CanFlags } from './types';
import SessionList from './components/SessionList';
import SessionFormDialog from './components/SessionFormDialog';

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
  can?: CanFlags;
}

type ModalType = 'add' | 'edit' | 'delete' | null;

export default function AMIIndex({ sessions, search, periode_options, can }: AMIIndexProps) {
  const [query, setQuery] = useState(search || '');
  const [periodeFilter, setPeriodeFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<AuditSession | null>(null);
  const lastRequestedRef = useRef<{ q: string; periode: number | ''; status: string }>({ q: (search || '').trim(), periode: '', status: 'all' });
  const DEBOUNCE_MS = 400;

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

  const handleSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault?.();
    const q = (query || '').trim();
    const current = lastRequestedRef.current;
    const params: Record<string, any> = {};
    if (q) params.search = q;
    if (periodeFilter) params.periode_id = periodeFilter;
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter; // expects backend to support
    // avoid duplicate request
    if (q === current.q && periodeFilter === current.periode && statusFilter === current.status) return;
    router.get('/audit-internal', params, { preserveState: true, preserveScroll: true });
    lastRequestedRef.current = { q, periode: periodeFilter, status: statusFilter };
  };

  const handleResetSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault?.();
    setQuery('');
    setPeriodeFilter('');
    setStatusFilter('all');
    router.get('/audit-internal', {}, { preserveState: true, preserveScroll: true });
    lastRequestedRef.current = { q: '', periode: '', status: 'all' };
  };

  // Debounced auto-search on query change
  useEffect(() => {
    const q = (query || '').trim();
    const st = statusFilter;
    const pr = periodeFilter;
    const timer = window.setTimeout(() => {
      const current = lastRequestedRef.current;
      const params: Record<string, any> = {};
      if (q) params.search = q;
      if (pr) params.periode_id = pr;
      if (st && st !== 'all') params.status = st;
      // skip if same as last
      if (q === current.q && pr === current.periode && st === current.status) return;
      // decide whether to reset or query
      if (Object.keys(params).length > 0) {
        router.get('/audit-internal', params, { preserveState: true, preserveScroll: true });
      } else {
        router.get('/audit-internal', {}, { preserveState: true, preserveScroll: true });
      }
      lastRequestedRef.current = { q, periode: pr, status: st };
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, periodeFilter, statusFilter]);

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
    const params: Record<string, any> = { page };
    const q = (query || '').trim();
    if (q) params.search = q;
    if (periodeFilter) params.periode_id = periodeFilter;
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
    router.get('/audit-internal', params, { preserveState: true, preserveScroll: true, replace: true });
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
            {can?.manage && (<Button onClick={openAddModal}>Buat Sesi</Button>)}
          </div>
        </div>

        <div className="bg-background rounded-lg border p-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari sesi (kode, nama, deskripsi)..."
                  className="w-full pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') return handleSearch(e);
                    if (e.key === 'Escape') return handleResetSearch(e);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={periodeFilter}
                  onChange={(e) => setPeriodeFilter(e.target.value ? Number(e.target.value) : '')}
                  onKeyDown={(e) => { if (e.key === 'Enter') return handleSearch(e); }}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Semua Periode</option>
                  {periode_options?.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.nama}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  onKeyDown={(e) => { if (e.key === 'Enter') return handleSearch(e); }}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
                <Button variant="outline" onClick={handleResetSearch} disabled={!query && !search && !periodeFilter && statusFilter === 'all'}>
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
              {can?.manage && (
                <Button variant="outline" className="mt-4" onClick={openAddModal}>
                  + Buat Sesi
                </Button>
              )}
            </div>
          ) : (
            <SessionList
              sessions={sessions}
              can={can}
              onOpenDetail={(row) => openDetail(row)}
              onOpenEdit={(row) => openEditModal(row)}
              onConfirmDelete={(row) => confirmDelete(row)}
              onGoToPage={(page) => goToPage(page)}
              onOpenRespond={(row) => router.get(`/audit-internal/${row.id}/auditee-submissions`)}
              onOpenReview={(row) => router.get(`/audit-internal/${row.id}/auditee-review`)}
            />
          )}

          {/* Pagination moved into SessionList */}
        </div>

        {/* Add/Edit Dialog */}
        <SessionFormDialog
          isOpen={isDialogOpen && modalType !== 'delete'}
          modalType={modalType === 'delete' ? null : (modalType as 'add' | 'edit' | null)}
          data={data}
          errors={errors as any}
          processing={processing}
          periodeOptions={periode_options}
          onChange={(field, value) => setData(field as any, value)}
          onSubmit={handleSubmit}
          onClose={() => { setIsDialogOpen(false); reset(); }}
        />

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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { router, useForm } from '@inertiajs/react';
import { Loader2, Search, RefreshCw } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Dosen, DosenFormData } from './types';
import { DosenForm } from './components/DosenForm';
import { DosenCard } from './components/DosenCard';

interface DosenIndexProps {
  dosen: {
    data: Dosen[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  search?: string;
  unit_id?: number | string | null;
  status?: string;
  error?: string;
  roles?: string[];
  unit_options?: { id: number; nama: string; tipe?: string }[];
}

type ModalType = 'add' | 'edit' | 'delete' | null;

export default function DosenIndex({ dosen, search, unit_id, status, roles = [], unit_options = [] }: DosenIndexProps) {
  const [query, setQuery] = useState(search || '');
  const [unitFilter, setUnitFilter] = useState<string>(unit_id ? String(unit_id) : '');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<Dosen | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unitQuery, setUnitQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const lastRequestedRef = useRef<{ q: string; unit: string }>({
    q: (search || '').trim(),
    unit: unit_id ? String(unit_id) : '',
  });
  const DEBOUNCE_MS = 400;

  const { data, setData, post, put, reset, errors, processing, transform } = useForm<DosenFormData>({
    nidn: '',
    nama: '',
    email: '',
    unit_id: '',
    jabatan: '',
    pangkat_golongan: '',
    pendidikan_terakhir: '',
    status: true,
    create_user: false,
    send_invite: false,
    user_roles: [],
    password: '',
  });

  const handleSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault?.();
    const q = (query || '').trim();
    const current = lastRequestedRef.current;
    const params: Record<string, any> = {};
    if (q) params.search = q;
    if (unitFilter) params.unit_id = unitFilter;
    if (q === current.q && unitFilter === current.unit) return;
    router.get('/dosen', params, {
      preserveState: true,
      preserveScroll: true,
      onStart: () => setIsLoading(true),
      onFinish: () => setIsLoading(false),
    });
    lastRequestedRef.current = { q, unit: unitFilter };
  };

  const handleResetSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault?.();
    setQuery('');
    setUnitFilter('');
    router.get('/dosen', {}, {
      preserveState: true,
      preserveScroll: true,
      onStart: () => setIsLoading(true),
      onFinish: () => setIsLoading(false),
    });
    lastRequestedRef.current = { q: '', unit: '' };
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const [editingLinked, setEditingLinked] = useState<boolean>(false);

  const openAddModal = () => {
    reset();
    setData('unit_id', '');
    setData('create_user', false);
    setData('send_invite', false);
    setData('user_roles', []);
    setData('password', '');
    setEditingLinked(false);
    setModalType('add');
    setIsDialogOpen(true);
  };

  const openEditModal = (row: Dosen) => {
    setData('nidn', row.nidn);
    setData('nama', row.nama);
    setData('email', row.email);
    setData('unit_id', (row.unit_id as number) || '');
    setData('jabatan', row.jabatan || '');
    setData('pangkat_golongan', row.pangkat_golongan || '');
    setData('pendidikan_terakhir', row.pendidikan_terakhir || '');
    setData('status', row.status);
    setData('create_user', false);
    setData('send_invite', false);
    setData('user_roles', []);
    setData('password', '');
    setEditId(row.id);
    setEditingLinked(!!row.user_id);
    setModalType('edit');
    setIsDialogOpen(true);
  };

  const confirmDelete = (row: Dosen) => {
    setDeleteRow(row);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!deleteRow) return;
    router.delete(`/dosen/${deleteRow.id}`, {
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
    if (page < 1 || page > dosen.last_page || page === dosen.current_page) return;
    router.get(
      '/dosen',
      { page, ...(query ? { search: query } : {}), ...(unitFilter ? { unit_id: unitFilter } : {}) },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        onStart: () => setIsLoading(true),
        onFinish: () => setIsLoading(false),
      }
    );
  };

  // Global shortcuts and Escape handling
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInputTarget = tag === 'INPUT' || tag === 'TEXTAREA';
      if ((e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (e.key === '/' && !isInputTarget) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        e.preventDefault();
        handleResetSearch();
        return;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search on query/unitFilter
  useEffect(() => {
    const q = (query || '').trim();
    const unit = unitFilter;
    const timer = window.setTimeout(() => {
      const current = lastRequestedRef.current;
      const params: Record<string, any> = {};
      if (q) params.search = q;
      if (unit) params.unit_id = unit;
      if (q === current.q && unit === current.unit) return;
      router.get('/dosen', params, {
        preserveState: true,
        preserveScroll: true,
        onStart: () => setIsLoading(true),
        onFinish: () => setIsLoading(false),
      });
      lastRequestedRef.current = { q, unit };
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, unitFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // guard minimal: nidn, nama, email
    if (!data.nidn || !data.nama || !data.email) {
      alert('Mohon lengkapi NIDN, Nama, dan Email');
      return;
    }

    if (modalType === 'add') {
      transform((payload) => ({
        ...payload,
        unit_id: payload.unit_id === '' ? undefined : payload.unit_id,
        user_roles: payload.user_roles && payload.user_roles.length ? payload.user_roles : undefined,
        password: payload.password ? payload.password : undefined,
      }));
      post('/dosen', {
        onSuccess: () => {
          setIsDialogOpen(false);
          setRecentlySuccessful(true);
          setTimeout(() => setRecentlySuccessful(false), 2000);
        },
      });
    } else if (modalType === 'edit' && editId) {
      transform((payload) => ({
        ...payload,
        unit_id: payload.unit_id === '' ? undefined : payload.unit_id,
        user_roles: payload.user_roles && payload.user_roles.length ? payload.user_roles : undefined,
        password: payload.password ? payload.password : undefined,
      }));
      put(`/dosen/${editId}`, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setRecentlySuccessful(true);
          setTimeout(() => setRecentlySuccessful(false), 2000);
        },
      });
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Dosen', href: '/dosen' }]} title="Dosen">
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Data Dosen</h2>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.reload({ only: ['dosen'] })}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Muat Ulang</span>
            </Button>
            <Button onClick={openAddModal}>Tambah Dosen</Button>
          </div>
        </div>

        <div className="bg-background rounded-lg border p-4">
          <form onSubmit={(e) => e.preventDefault()} className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari dosen (nama, nidn, email)..."
                  className="w-full pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') return handleSearch(e);
                    if (e.key === 'Escape') return handleResetSearch(e);
                  }}
                  ref={searchInputRef}
                />
              </div>
              <div className="flex-1 sm:max-w-xs">
                <div className="mb-2">
                  <Input
                    placeholder="Cari Unit..."
                    value={unitQuery}
                    onChange={(e) => setUnitQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') return handleSearch(e); if (e.key === 'Escape') return handleResetSearch(e); }}
                  />
                </div>
                <select
                  className="w-full border rounded h-9 px-3"
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') return handleSearch(e as any); }}
                >
                  <option value="">Semua Unit</option>
                  {unit_options
                    .filter((u) => {
                      const q = unitQuery.toLowerCase();
                      if (!q) return true;
                      return (
                        String(u.id).includes(q) ||
                        (u.nama?.toLowerCase().includes(q)) ||
                        (u.tipe ? u.tipe.toLowerCase().includes(q) : false)
                      );
                    })
                    .slice(0, 500)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama} {u.tipe ? `(${u.tipe})` : ''}
                      </option>
                    ))}
                </select>
                <div className="mt-1 text-xs text-muted-foreground">
                  {unitQuery ? `Filter: ${unit_options.filter(u => (String(u.id).includes(unitQuery.toLowerCase()) || u.nama?.toLowerCase().includes(unitQuery.toLowerCase()) || (u.tipe ? u.tipe.toLowerCase().includes(unitQuery.toLowerCase()) : false))).length} unit` : `${unit_options.length} unit`}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleResetSearch}
                  disabled={!query && !search && !unitFilter && !unit_id}
                >
                  Reset
                </Button>
              </div>
            </div>
          </form>

          {recentlySuccessful && (
            <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">Data berhasil disimpan</div>
          )}

          {status && (
            <div className="mb-4 rounded-md bg-blue-50 p-4 text-sm text-blue-700">{status}</div>
          )}

          {dosen.data.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Tidak ada data dosen</p>
              <Button variant="outline" className="mt-4" onClick={openAddModal}>
                + Tambah Dosen
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {dosen.data.map((row, idx) => (
                <DosenCard
                  key={row.id}
                  item={row}
                  index={idx}
                  currentPage={dosen.current_page}
                  perPage={dosen.per_page}
                  onEdit={openEditModal}
                  onDelete={confirmDelete}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Halaman {dosen.current_page} dari {dosen.last_page} • Total {dosen.total} data
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => goToPage(dosen.current_page - 1)}
                disabled={dosen.current_page <= 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                onClick={() => goToPage(dosen.current_page + 1)}
                disabled={dosen.current_page >= dosen.last_page}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${
            isDialogOpen && modalType !== 'delete' ? 'block' : 'hidden'
          }`}
        >
          <div className="mx-4 w-full max-w-4xl rounded-lg bg-background p-6 shadow-lg max-h-[85vh] overflow-y-auto">
            <h2 className="mb-6 text-xl font-semibold">{modalType === 'add' ? 'Tambah' : 'Edit'} Dosen</h2>

            <DosenForm
              data={data}
              setData={setData}
              errors={errors as any}
              processing={processing}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsDialogOpen(false);
                reset();
              }}
              isEdit={modalType === 'edit'}
              roles={roles}
              isLinked={editingLinked}
              unitOptions={unit_options}
            />
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${
            isDeleteOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Hapus Dosen</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Apakah Anda yakin akan menghapus data dosen
              {deleteRow ? (
                <>
                  {' '}<span className="font-medium">{deleteRow.nama}</span> (NIDN: {deleteRow.nidn})
                </>
              ) : null}
              ? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsDeleteOpen(false); setDeleteRow(null); }}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

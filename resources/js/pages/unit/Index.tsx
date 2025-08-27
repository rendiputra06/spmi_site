import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Link, router, useForm } from '@inertiajs/react';
import { Search, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { Option, Unit, UnitFormData } from './types';
import { UnitForm } from './components/UnitForm';
import { UnitCard } from './components/UnitCard';

interface UnitIndexProps {
  units: {
    data: Unit[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  filters: {
    search: string;
    tipe: string;
    parent_id: number | '';
    per_page: number;
  };
  status?: string;
  error?: string;
  parent_options: Option[];
  leader_options: Option[];
}

type ModalType = 'add' | 'edit' | 'delete' | null;

export default function UnitIndex({ units, filters, status, parent_options, leader_options }: UnitIndexProps) {
  const [query, setQuery] = useState<string>(filters?.search ?? '');
  const [tipeFilter, setTipeFilter] = useState<string>(filters?.tipe ?? '');
  const [parentFilter, setParentFilter] = useState<string | number>(filters?.parent_id === '' ? '' : String(filters?.parent_id ?? ''));
  const [perPage, setPerPage] = useState<string>(String(filters?.per_page ?? 10));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<Unit | null>(null);

  const { data, setData, post, put, reset, errors, processing, transform } = useForm<UnitFormData>({
    kode: '',
    nama: '',
    tipe: 'unit',
    parent_id: '',
    leader_id: '',
    leader_nama: '',
    leader_jabatan: '',
    status: true,
  });

  const buildParams = (overrides: Record<string, any> = {}) => {
    const params: Record<string, any> = {};
    const s = overrides.search !== undefined ? overrides.search : query;
    const t = overrides.tipe !== undefined ? overrides.tipe : tipeFilter;
    const p = overrides.parent_id !== undefined ? overrides.parent_id : parentFilter;
    const pp = overrides.per_page !== undefined ? overrides.per_page : perPage;
    if (s) params.search = s;
    if (t) params.tipe = t;
    if (p) params.parent_id = p;
    if (pp) params.per_page = pp;
    return params;
  };

  // Debounce search to mimic Users page pattern
  React.useEffect(() => {
    const t = setTimeout(() => {
      router.get('/units', buildParams(), { preserveState: true, replace: true, preserveScroll: true });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleResetSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setQuery('');
    setTipeFilter('');
    setParentFilter('');
    setPerPage('10');
    router.get('/units', { per_page: 10 }, { preserveState: true, preserveScroll: true, replace: true });
  };

  const openAddModal = () => {
    reset();
    setModalType('add');
    setIsDialogOpen(true);
  };

  const openEditModal = (row: Unit) => {
    setData('kode', row.kode);
    setData('nama', row.nama);
    setData('tipe', row.tipe);
    setData('parent_id', (row.parent_id as number) || '');
    setData('leader_id', (row.leader_id as number) || '');
    setData('leader_nama', row.leader_nama || '');
    setData('leader_jabatan', row.leader_jabatan || '');
    setData('status', row.status);
    setEditId(row.id);
    setModalType('edit');
    setIsDialogOpen(true);
  };

  const confirmDelete = (row: Unit) => {
    setDeleteRow(row);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!deleteRow) return;
    router.delete(`/units/${deleteRow.id}`, {
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

  const onChangeTipe = (value: string) => {
    setTipeFilter(value);
    router.get('/units', buildParams({ tipe: value }), { preserveState: true, replace: true, preserveScroll: true });
  };

  const onChangeParent = (value: string) => {
    setParentFilter(value);
    router.get('/units', buildParams({ parent_id: value }), { preserveState: true, replace: true, preserveScroll: true });
  };

  const onChangePerPage = (value: string) => {
    setPerPage(value);
    router.get('/units', buildParams({ per_page: value }), { preserveState: true, replace: true, preserveScroll: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.kode || !data.nama || !data.tipe) {
      alert('Mohon lengkapi Kode, Nama, dan Tipe');
      return;
    }

    // normalize empty selects
    transform((payload) => ({
      ...payload,
      parent_id: payload.parent_id === '' ? null : payload.parent_id,
      leader_id: payload.leader_id === '' ? null : payload.leader_id,
    }));

    if (modalType === 'add') {
      post('/units', {
        onSuccess: () => {
          setIsDialogOpen(false);
          setRecentlySuccessful(true);
          setTimeout(() => setRecentlySuccessful(false), 2000);
        },
      });
    } else if (modalType === 'edit' && editId) {
      put(`/units/${editId}`, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setRecentlySuccessful(true);
          setTimeout(() => setRecentlySuccessful(false), 2000);
        },
      });
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Units', href: '/units' }]} title="Units">
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Data Unit</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.reload({ only: ['units', 'parent_options', 'leader_options'] })}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Muat Ulang</span>
            </Button>
            <Button onClick={openAddModal}>Tambah Unit</Button>
          </div>
        </div>

        <div className="bg-background rounded-lg border p-4">
          <form onSubmit={(e) => e.preventDefault()} className="mb-6">
            <div className="flex flex-col gap-4 md:grid md:grid-cols-12 md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari unit (nama, kode, tipe, pimpinan)..."
                  className="w-full pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      router.get('/units', buildParams(), { preserveState: true, replace: true, preserveScroll: true });
                    }
                    if (e.key === 'Escape') handleResetSearch();
                  }}
                />
              </div>
              <div className="md:col-span-3">
                <select
                  className="border rounded h-9 px-3 w-full"
                  value={tipeFilter}
                  onChange={(e) => onChangeTipe(e.target.value)}
                >
                  <option value="">Semua Tipe</option>
                  <option value="universitas">Universitas</option>
                  <option value="fakultas">Fakultas</option>
                  <option value="prodi">Program Studi</option>
                  <option value="unit">Unit</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <select
                  className="border rounded h-9 px-3 w-full"
                  value={parentFilter}
                  onChange={(e) => onChangeParent(e.target.value)}
                >
                  <option value="">Semua Parent</option>
                  {parent_options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.nama} {opt.tipe ? `(${opt.tipe})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <select
                  className="border rounded h-9 px-3 w-full"
                  value={perPage}
                  onChange={(e) => onChangePerPage(e.target.value)}
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={String(n)}>
                      {n} / halaman
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 md:col-span-1 md:justify-end">
                <Button variant="outline" onClick={handleResetSearch}>
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

          {units.data.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Tidak ada data unit</p>
              <Button variant="outline" className="mt-4" onClick={openAddModal}>
                + Tambah Unit
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {units.data.map((row, idx) => (
                <UnitCard
                  key={row.id}
                  item={row}
                  index={idx}
                  currentPage={units.current_page}
                  perPage={units.per_page}
                  onEdit={openEditModal}
                  onDelete={confirmDelete}
                />
              ))}
            </div>
          )}

          {/* Pagination (follow Users pattern) */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {units.links?.map((link, idx) => {
              const label = link.label.replace(/&laquo;|&raquo;/g, (m) => (m === '&laquo;' ? '«' : '»'));
              if (link.url === null) {
                return (
                  <span
                    key={idx}
                    className="px-3 py-1.5 text-sm rounded border bg-muted text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: label }}
                  />
                );
              }
              return (
                <Link
                  key={idx}
                  href={link.url}
                  preserveScroll
                  preserveState
                  className={`px-3 py-1.5 text-sm rounded border ${link.active ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
                  dangerouslySetInnerHTML={{ __html: label }}
                />
              );
            })}
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${
            isDialogOpen && modalType !== 'delete' ? 'block' : 'hidden'
          }`}
        >
          <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-semibold">{modalType === 'add' ? 'Tambah' : 'Edit'} Unit</h2>

            <UnitForm
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
              parentOptions={parent_options}
              leaderOptions={leader_options}
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
            <h2 className="mb-4 text-xl font-semibold">Hapus Unit</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Apakah Anda yakin akan menghapus data unit
              {deleteRow ? (
                <>
                  {' '}<span className="font-medium">{deleteRow.nama}</span> (Kode: {deleteRow.kode})
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

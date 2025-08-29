import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Link, router, useForm } from '@inertiajs/react';
import { RefreshCw, Search } from 'lucide-react';
import React, { useState } from 'react';

type ProdiOption = { id: number; nama: string };

type Item = {
  id: number;
  kode: string;
  nama: string;
  sks: number;
  status: boolean;
  unit_id: number | null;
  unit?: { id: number; nama: string } | null;
};

interface Props {
  items: {
    data: Item[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  filters: {
    search: string;
    unit_id: number | '';
    per_page: number;
  };
  prodi_options: ProdiOption[];
  status?: string;
  error?: string;
}

type ModalType = 'add' | 'edit' | 'delete' | null;

type FormData = {
  kode: string;
  nama: string;
  sks: number | string;
  status: boolean;
  unit_id: number | '' | null;
};

export default function MataKuliahIndex({ items, filters, status, prodi_options }: Props) {
  const [query, setQuery] = useState<string>(filters?.search ?? '');
  const [unitFilter, setUnitFilter] = useState<string | number>(filters?.unit_id === '' ? '' : String(filters?.unit_id ?? ''));
  const [perPage, setPerPage] = useState<string>(String(filters?.per_page ?? 10));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<Item | null>(null);

  const { data, setData, post, put, reset, errors, processing, transform } = useForm<FormData>({
    kode: '',
    nama: '',
    sks: 0,
    status: true,
    unit_id: ''
  });

  const buildParams = (overrides: Record<string, any> = {}) => {
    const params: Record<string, any> = {};
    const s = overrides.search !== undefined ? overrides.search : query;
    const u = overrides.unit_id !== undefined ? overrides.unit_id : unitFilter;
    const pp = overrides.per_page !== undefined ? overrides.per_page : perPage;
    if (s) params.search = s;
    if (u) params.unit_id = u;
    if (pp) params.per_page = pp;
    return params;
  };

  React.useEffect(() => {
    const t = setTimeout(() => {
      router.get('/mata-kuliah', buildParams(), { preserveState: true, replace: true, preserveScroll: true });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleResetSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setQuery('');
    setUnitFilter('');
    setPerPage('10');
    router.get('/mata-kuliah', { per_page: 10 }, { preserveState: true, preserveScroll: true, replace: true });
  };

  const openAddModal = () => {
    reset();
    setModalType('add');
    setIsDialogOpen(true);
  };

  const openEditModal = (row: Item) => {
    setData('kode', row.kode);
    setData('nama', row.nama);
    setData('sks', row.sks);
    setData('status', row.status);
    setData('unit_id', row.unit_id ?? '');
    setEditId(row.id);
    setModalType('edit');
    setIsDialogOpen(true);
  };

  const confirmDelete = (row: Item) => {
    setDeleteRow(row);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!deleteRow) return;
    router.delete(`/mata-kuliah/${deleteRow.id}`, {
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

  const onChangeUnit = (value: string) => {
    setUnitFilter(value);
    router.get('/mata-kuliah', buildParams({ unit_id: value }), { preserveState: true, replace: true, preserveScroll: true });
  };

  const onChangePerPage = (value: string) => {
    setPerPage(value);
    router.get('/mata-kuliah', buildParams({ per_page: value }), { preserveState: true, replace: true, preserveScroll: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.kode || !data.nama) {
      alert('Mohon lengkapi Kode dan Nama');
      return;
    }

    transform((payload) => ({
      ...payload,
      unit_id: payload.unit_id === '' ? null : Number(payload.unit_id),
      sks: Number(payload.sks || 0),
    }));

    if (modalType === 'add') {
      post('/mata-kuliah', {
        onSuccess: () => {
          setIsDialogOpen(false);
          setRecentlySuccessful(true);
          setTimeout(() => setRecentlySuccessful(false), 2000);
        },
      });
    } else if (modalType === 'edit' && editId) {
      put(`/mata-kuliah/${editId}`, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setRecentlySuccessful(true);
          setTimeout(() => setRecentlySuccessful(false), 2000);
        },
      });
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Mata Kuliah', href: '/mata-kuliah' }]} title="Mata Kuliah">
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Data Mata Kuliah</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.reload({ only: ['items', 'prodi_options'] })}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Muat Ulang</span>
            </Button>
            <Button onClick={openAddModal}>Tambah Mata Kuliah</Button>
          </div>
        </div>

        <div className="bg-background rounded-lg border p-4">
          <form onSubmit={(e) => e.preventDefault()} className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari mata kuliah (kode, nama)..."
                  className="w-full pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      router.get('/mata-kuliah', buildParams(), { preserveState: true, replace: true, preserveScroll: true });
                    }
                    if (e.key === 'Escape') handleResetSearch();
                  }}
                />
              </div>
              <div className="w-full sm:max-w-xs">
                <select
                  className="border rounded h-9 px-3 w-full"
                  value={unitFilter}
                  onChange={(e) => onChangeUnit(e.target.value)}
                >
                  <option value="">Semua Prodi</option>
                  {prodi_options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-36">
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
              <div className="w-full sm:w-auto sm:ml-auto flex justify-end">
                <Button variant="outline" onClick={handleResetSearch}>Reset</Button>
              </div>
            </div>
          </form>

          {recentlySuccessful && (
            <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">Data berhasil disimpan</div>
          )}

          {status && (
            <div className="mb-4 rounded-md bg-blue-50 p-4 text-sm text-blue-700">{status}</div>
          )}

          {items.data.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Tidak ada data mata kuliah</p>
              <Button variant="outline" className="mt-4" onClick={openAddModal}>
                + Tambah Mata Kuliah
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-2">#</th>
                    <th className="py-2 px-2">Kode</th>
                    <th className="py-2 px-2">Nama</th>
                    <th className="py-2 px-2">SKS</th>
                    <th className="py-2 px-2">Prodi</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.data.map((row, idx) => (
                    <tr key={row.id} className="border-b">
                      <td className="py-2 px-2">{(items.current_page - 1) * items.per_page + idx + 1}</td>
                      <td className="py-2 px-2 font-medium">{row.kode}</td>
                      <td className="py-2 px-2">{row.nama}</td>
                      <td className="py-2 px-2">{row.sks}</td>
                      <td className="py-2 px-2">{row.unit?.nama ?? '-'}</td>
                      <td className="py-2 px-2">{row.status ? 'Aktif' : 'Nonaktif'}</td>
                      <td className="py-2 px-2 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => openEditModal(row)}>Edit</Button>
                          <Button variant="destructive" onClick={() => confirmDelete(row)}>Hapus</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {items.links?.map((link, idx) => {
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
            <h2 className="mb-6 text-xl font-semibold">{modalType === 'add' ? 'Tambah' : 'Edit'} Mata Kuliah</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-2">
                <label className="text-sm">Kode</label>
                <Input value={String(data.kode)} onChange={(e) => setData('kode', e.target.value)} />
                {errors.kode && <p className="text-sm text-red-600">{errors.kode as any}</p>}
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Nama</label>
                <Input value={String(data.nama)} onChange={(e) => setData('nama', e.target.value)} />
                {errors.nama && <p className="text-sm text-red-600">{errors.nama as any}</p>}
              </div>
              <div className="grid gap-2">
                <label className="text-sm">SKS</label>
                <Input type="number" min={0} max={40} value={String(data.sks)} onChange={(e) => setData('sks', e.target.value)} />
                {errors.sks && <p className="text-sm text-red-600">{errors.sks as any}</p>}
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Prodi</label>
                <select
                  className="border rounded h-9 px-3 w-full"
                  value={data.unit_id === '' || data.unit_id === null ? '' : String(data.unit_id)}
                  onChange={(e) => setData('unit_id', e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">-</option>
                  {prodi_options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.nama}
                    </option>
                  ))}
                </select>
                {errors.unit_id && <p className="text-sm text-red-600">{errors.unit_id as any}</p>}
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Status</label>
                <select
                  className="border rounded h-9 px-3 w-full"
                  value={data.status ? '1' : '0'}
                  onChange={(e) => setData('status', e.target.value === '1')}
                >
                  <option value="1">Aktif</option>
                  <option value="0">Nonaktif</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); reset(); }}>Batal</Button>
                <Button type="submit" disabled={processing}>{modalType === 'add' ? 'Simpan' : 'Update'}</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${
            isDeleteOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Hapus Mata Kuliah</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Apakah Anda yakin akan menghapus data
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

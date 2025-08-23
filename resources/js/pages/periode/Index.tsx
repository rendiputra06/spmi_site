import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { router, useForm } from '@inertiajs/react';
import { Search, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { Periode, PeriodeFormData } from './types';
import { PeriodeForm } from './components/PeriodeForm';
import { PeriodeCard } from './components/PeriodeCard';

interface PeriodeIndexProps {
  periodes: {
    data: Periode[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  search?: string;
  status?: string;
  error?: string;
}

type ModalType = 'add' | 'edit' | 'delete' | null;

export default function PeriodeIndex({ periodes, search, status }: PeriodeIndexProps) {
  const [query, setQuery] = useState(search || '');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<Periode | null>(null);

  const { data, setData, post, put, reset, errors, processing } = useForm<PeriodeFormData>({
    kode: '',
    nama: '',
    mulai: '',
    selesai: '',
    keterangan: '',
    status: true,
    is_active: false,
  });

  const toYMD = (value: string) => {
    if (!value) return '';
    return value.includes('T') ? value.split('T')[0] : value;
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query !== search) {
      router.get(
        '/periodes',
        { search: query },
        { preserveState: true, preserveScroll: true }
      );
    }
  };

  const handleResetSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setQuery('');
    if (search) {
      router.get('/periodes', {}, { preserveState: true, preserveScroll: true });
    }
  };

  const openAddModal = () => {
    reset();
    setModalType('add');
    setIsDialogOpen(true);
  };

  const openEditModal = (row: Periode) => {
    setData('kode', row.kode);
    setData('nama', row.nama);
    setData('mulai', toYMD(row.mulai));
    setData('selesai', toYMD(row.selesai));
    setData('keterangan', row.keterangan || '');
    setData('status', row.status);
    setData('is_active', row.is_active);
    setEditId(row.id);
    setModalType('edit');
    setIsDialogOpen(true);
  };

  const confirmDelete = (row: Periode) => {
    setDeleteRow(row);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!deleteRow) return;
    router.delete(`/periodes/${deleteRow.id}`, {
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
    if (page < 1 || page > periodes.last_page || page === periodes.current_page) return;
    router.get(
      '/periodes',
      { page, ...(query ? { search: query } : {}) },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.kode || !data.nama || !data.mulai || !data.selesai) {
      alert('Mohon lengkapi Kode, Nama, Mulai, dan Selesai');
      return;
    }

    if (modalType === 'add') {
      post('/periodes', {
        onSuccess: () => {
          setIsDialogOpen(false);
          setRecentlySuccessful(true);
          setTimeout(() => setRecentlySuccessful(false), 2000);
        },
      });
    } else if (modalType === 'edit' && editId) {
      put(`/periodes/${editId}`, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setRecentlySuccessful(true);
          setTimeout(() => setRecentlySuccessful(false), 2000);
        },
      });
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Periode', href: '/periodes' }]} title="Periode">
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Data Periode</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.reload({ only: ['periodes'] })}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Muat Ulang</span>
            </Button>
            <Button onClick={openAddModal}>Tambah Periode</Button>
          </div>
        </div>

        <div className="bg-background rounded-lg border p-4">
          <form onSubmit={(e) => e.preventDefault()} className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari periode (kode, nama, keterangan)..."
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

          {status && (
            <div className="mb-4 rounded-md bg-blue-50 p-4 text-sm text-blue-700">{status}</div>
          )}

          {periodes.data.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Tidak ada data periode</p>
              <Button variant="outline" className="mt-4" onClick={openAddModal}>
                + Tambah Periode
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {periodes.data.map((row, idx) => (
                <PeriodeCard
                  key={row.id}
                  item={row}
                  index={idx}
                  currentPage={periodes.current_page}
                  perPage={periodes.per_page}
                  onEdit={openEditModal}
                  onDelete={confirmDelete}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Halaman {periodes.current_page} dari {periodes.last_page} • Total {periodes.total} data
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => goToPage(periodes.current_page - 1)}
                disabled={periodes.current_page <= 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                onClick={() => goToPage(periodes.current_page + 1)}
                disabled={periodes.current_page >= periodes.last_page}
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
          <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-semibold">{modalType === 'add' ? 'Tambah' : 'Edit'} Periode</h2>

            <PeriodeForm
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
            <h2 className="mb-4 text-xl font-semibold">Hapus Periode</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Apakah Anda yakin akan menghapus data periode
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

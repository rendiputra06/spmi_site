import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { router, useForm } from '@inertiajs/react';
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
  };
  search?: string;
  status?: string;
  error?: string;
  parent_options: Option[];
  leader_options: Option[];
}

type ModalType = 'add' | 'edit' | 'delete' | null;

export default function UnitIndex({ units, search, status, parent_options, leader_options }: UnitIndexProps) {
  const [query, setQuery] = useState(search || '');
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

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query !== search) {
      router.get(
        '/units',
        { search: query },
        {
          preserveState: true,
          preserveScroll: true,
        }
      );
    }
  };

  const handleResetSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setQuery('');
    if (search) {
      router.get(
        '/units',
        {},
        {
          preserveState: true,
          preserveScroll: true,
        }
      );
    }
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

  const goToPage = (page: number) => {
    if (page < 1 || page > units.last_page || page === units.current_page) return;
    router.get(
      '/units',
      { page, ...(query ? { search: query } : {}) },
      { preserveState: true, preserveScroll: true, replace: true }
    );
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari unit (nama, kode, tipe, pimpinan)..."
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

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Halaman {units.current_page} dari {units.last_page} • Total {units.total} data
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => goToPage(units.current_page - 1)}
                disabled={units.current_page <= 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                onClick={() => goToPage(units.current_page + 1)}
                disabled={units.current_page >= units.last_page}
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

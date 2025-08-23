import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { router, useForm } from '@inertiajs/react';
import { Search, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
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
  status?: string;
  error?: string;
  roles?: string[];
}

type ModalType = 'add' | 'edit' | 'delete' | null;

export default function DosenIndex({ dosen, search, status, roles = [] }: DosenIndexProps) {
  const [query, setQuery] = useState(search || '');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<Dosen | null>(null);

  const { data, setData, post, put, reset, errors, processing, transform } = useForm<DosenFormData>({
    nidn: '',
    nama: '',
    email: '',
    prodi: '',
    jabatan: '',
    pangkat_golongan: '',
    pendidikan_terakhir: '',
    status: true,
    create_user: false,
    send_invite: false,
    user_roles: [],
    password: '',
  });

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query !== search) {
      router.get(
        '/dosen',
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
        '/dosen',
        {},
        {
          preserveState: true,
          preserveScroll: true,
        }
      );
    }
  };

  const [editingLinked, setEditingLinked] = useState<boolean>(false);

  const openAddModal = () => {
    reset();
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
    setData('prodi', row.prodi || '');
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
      { page, ...(query ? { search: query } : {}) },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

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
          <h2 className="text-3xl font-bold tracking-tight">Data Dosen</h2>
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
                  placeholder="Cari dosen (nama, nidn, email, prodi)..."
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
          <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
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

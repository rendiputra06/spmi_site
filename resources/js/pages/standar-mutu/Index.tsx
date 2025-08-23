import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Transition } from '@headlessui/react';
import { router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

export default function StandarMutuIndex({ standar, search, status, error }: any) {
    const [query, setQuery] = useState(search || '');
    const [showDialog, setShowDialog] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        kode: '',
        nama: '',
        deskripsi: '',
        status: true as boolean,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/standar-mutu', { search: query }, { preserveState: true });
    };

    const openAddModal = () => {
        reset();
        setModalType('add');
        setShowDialog(true);
    };

    const openEditModal = (row: any) => {
        setData({
            kode: row.kode,
            nama: row.nama,
            deskripsi: row.deskripsi,
            status: !!row.status,
        });
        setEditId(row.id);
        setModalType('edit');
        setShowDialog(true);
    };

    const openDeleteModal = (row: any) => {
        setDeleteId(row.id);
        setModalType('delete');
        setShowDialog(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalType === 'add') {
            post('/standar-mutu', {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                },
            });
        } else if (modalType === 'edit' && editId) {
            put(`/standar-mutu/${editId}`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                },
            });
        }
    };

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/standar-mutu/${deleteId}`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Standar Mutu', href: '/standar-mutu' }]} title="Standar Mutu">
            <div className="space-y-6 p-6">
                <HeadingSmall title="Data Standar Mutu" description="Kelola daftar standar mutu, pencarian, dan aksi." />
                <form onSubmit={handleSearch} className="mb-4 grid max-w-md gap-2">
                    <Label htmlFor="search">Pencarian</Label>
                    <Input
                        id="search"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari kode/nama/deskripsi..."
                        className=""
                    />
                    <InputError message={formError ?? undefined} />
                    <Button type="submit" variant="default" className="w-fit">
                        Cari
                    </Button>
                </form>
                <Transition
                    show={recentlySuccessful || !!status}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <p className="text-sm text-green-600">{status || 'Berhasil!'}</p>
                </Transition>
                <div className="mb-2 flex justify-end">
                    <Dialog open={showDialog && modalType === 'add'} onOpenChange={setShowDialog}>
                        <DialogTrigger asChild>
                            <Button variant="default" onClick={openAddModal}>
                                Tambah Standar Mutu
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Standar Mutu</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="kode">Kode</Label>
                                    <Input id="kode" value={data.kode} onChange={(e) => setData('kode', e.target.value)} required />
                                    <InputError message={errors.kode} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="nama">Nama</Label>
                                    <Input id="nama" value={data.nama} onChange={(e) => setData('nama', e.target.value)} required />
                                    <InputError message={errors.nama} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="deskripsi">Deskripsi</Label>
                                    <Input id="deskripsi" value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} />
                                    <InputError message={errors.deskripsi} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <input
                                        type="checkbox"
                                        id="status"
                                        checked={!!data.status}
                                        onChange={(e) => setData('status', e.target.checked)}
                                    />
                                </div>
                                <Button type="submit" disabled={processing}>
                                    Simpan
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th>No</th>
                            <th>Kode</th>
                            <th>Nama</th>
                            <th>Jumlah Indikator</th>
                            <th>Jumlah Pertanyaan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standar.data.map((row: any, idx: number) => (
                            <tr key={row.id} className="border-b">
                                <td>{(standar.current_page - 1) * standar.per_page + idx + 1}</td>
                                <td>{row.kode}</td>
                                <td>{row.nama}</td>
                                <td>{row.jumlah_indikator}</td>
                                <td>{row.indikator?.reduce((sum: number, i: any) => sum + (i.pertanyaan?.length ?? 0), 0) ?? 0}</td>
                                <td>{row.status ? 'Aktif' : 'Nonaktif'}</td>
                                <td className="flex gap-2">
                                    <a href={`/standar-mutu/${row.id}`} className="text-blue-600 underline">
                                        Detail
                                    </a>
                                    <Dialog open={showDialog && modalType === 'edit' && editId === row.id} onOpenChange={setShowDialog}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => openEditModal(row)}>
                                                Edit
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Edit Standar Mutu</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="kode">Kode</Label>
                                                    <Input id="kode" value={data.kode} onChange={(e) => setData('kode', e.target.value)} required />
                                                    <InputError message={errors.kode} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="nama">Nama</Label>
                                                    <Input id="nama" value={data.nama} onChange={(e) => setData('nama', e.target.value)} required />
                                                    <InputError message={errors.nama} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="deskripsi">Deskripsi</Label>
                                                    <Input
                                                        id="deskripsi"
                                                        value={data.deskripsi}
                                                        onChange={(e) => setData('deskripsi', e.target.value)}
                                                    />
                                                    <InputError message={errors.deskripsi} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor="status">Status</Label>
                                                    <input
                                                        type="checkbox"
                                                        id="status"
                                                        checked={!!data.status}
                                                        onChange={(e) => setData('status', e.target.checked)}
                                                    />
                                                </div>
                                                <Button type="submit" disabled={processing}>
                                                    Simpan Perubahan
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                    <Dialog open={showDialog && modalType === 'delete' && deleteId === row.id} onOpenChange={setShowDialog}>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive" size="sm" onClick={() => openDeleteModal(row)}>
                                                Hapus
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Hapus Standar Mutu</DialogTitle>
                                            </DialogHeader>
                                            <p>
                                                Yakin ingin menghapus standar mutu <b>{row.nama}</b>?
                                            </p>
                                            <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                                                Konfirmasi Hapus
                                            </Button>
                                        </DialogContent>
                                    </Dialog>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 flex gap-2">
                    {standar.links.map((link: any, i: number) => (
                        <Button
                            key={i}
                            variant={link.active ? 'secondary' : 'outline'}
                            size="sm"
                            disabled={!link.url || link.active}
                            onClick={() => link.url && router.visit(link.url)}
                        >
                            {link.label.replace('&laquo;', '\u00ab').replace('&raquo;', '\u00bb')}
                        </Button>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

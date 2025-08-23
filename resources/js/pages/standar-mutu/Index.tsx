import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { PaginatedResponse, StandarMutu } from '@/types';
import { Link, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import StandarMutuForm from './StandarMutuForm';

interface Props {
    standar: PaginatedResponse<StandarMutu>;
    search?: string;
    flash?: {
        success?: string;
    };
}

type ModalState =
    | { type: 'add' }
    | { type: 'edit'; standar: StandarMutu }
    | { type: 'delete'; standar: StandarMutu }
    | null;

export default function StandarMutuIndex({ standar, search = '', flash }: Props) {
    const [query, setQuery] = useState(search);
    const [modalState, setModalState] = useState<ModalState>(null);

    const form = useForm({
        kode: '',
        nama: '',
        deskripsi: '',
        status: true,
    });
    const { setData, post, put, delete: destroy, reset, processing, recentlySuccessful } = form;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    useEffect(() => {
        if (recentlySuccessful && modalState) {
            setModalState(null);
        }
    }, [recentlySuccessful]);

    const openModal = (state: ModalState) => {
        reset();
        if (state?.type === 'edit') {
            setData({
                kode: state.standar.kode,
                nama: state.standar.nama,
                deskripsi: state.standar.deskripsi || '',
                status: state.standar.status,
            });
        }
        setModalState(state);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('standar-mutu.index'), { search: query }, { preserveState: true, replace: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalState?.type === 'add') {
            post(route('standar-mutu.store'));
        } else if (modalState?.type === 'edit') {
            put(route('standar-mutu.update', modalState.standar.id));
        }
    };

    const handleDelete = () => {
        if (modalState?.type === 'delete') {
            destroy(route('standar-mutu.destroy', modalState.standar.id));
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Standar Mutu', href: route('standar-mutu.index') }]} title="Standar Mutu">
            <Toaster richColors />
            <div className="space-y-6 p-6">
                <HeadingSmall title="Data Standar Mutu" description="Kelola daftar standar mutu, pencarian, dan aksi." />
                <div className="flex justify-between">
                    <form onSubmit={handleSearch} className="flex max-w-md items-end gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="search">Pencarian</Label>
                            <Input
                                id="search"
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari kode atau nama..."
                            />
                        </div>
                        <Button type="submit" variant="default">
                            Cari
                        </Button>
                    </form>
                    <Button variant="default" onClick={() => openModal({ type: 'add' })}>
                        Tambah Standar Mutu
                    </Button>
                </div>

                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th>No</th>
                            <th>Kode</th>
                            <th>Nama</th>
                            <th>Jml Indikator</th>
                            <th>Jml Pertanyaan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standar.data.map((row, idx) => (
                            <tr key={row.id} className="border-b">
                                <td>{standar.from + idx}</td>
                                <td>{row.kode}</td>
                                <td>{row.nama}</td>
                                <td>{row.jumlah_indikator}</td>
                                <td>{row.jumlah_pertanyaan}</td>
                                <td>{row.status ? 'Aktif' : 'Nonaktif'}</td>
                                <td className="flex gap-2">
                                    <Link href={route('standar-mutu.show', row.id)} className="text-blue-600 underline">
                                        Detail
                                    </Link>
                                    <Button variant="outline" size="sm" onClick={() => openModal({ type: 'edit', standar: row })}>
                                        Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => openModal({ type: 'delete', standar: row })}>
                                        Hapus
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 flex gap-2">
                    {standar.links.map((link, i) => (
                        <Button
                            key={i}
                            variant={link.active ? 'secondary' : 'outline'}
                            size="sm"
                            disabled={!link.url}
                            onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>

            <Dialog open={!!modalState} onOpenChange={(open) => !open && setModalState(null)}>
                <DialogContent
                    onPointerDownOutside={(e) => e.preventDefault()}
                >
                    {modalState?.type === 'add' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Tambah Standar Mutu</DialogTitle>
                            </DialogHeader>
                            <StandarMutuForm useForm={form} onSubmit={handleSubmit} />
                        </>
                    )}
                    {modalState?.type === 'edit' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit Standar Mutu</DialogTitle>
                            </DialogHeader>
                            <StandarMutuForm useForm={form} onSubmit={handleSubmit} submitText="Simpan Perubahan" />
                        </>
                    )}
                    {modalState?.type === 'delete' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Hapus Standar Mutu</DialogTitle>
                            </DialogHeader>
                            <p>
                                Yakin ingin menghapus standar mutu <b>{modalState.standar.nama}</b>?
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setModalState(null)}>
                                    Batal
                                </Button>
                                <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                                    Konfirmasi Hapus
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

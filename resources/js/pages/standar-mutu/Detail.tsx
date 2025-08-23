import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import React, { useState } from 'react';

export default function StandarMutuDetail({ standar }: any) {
    const [showDialog, setShowDialog] = useState(false);
    const [modalType, setModalType] = useState<
        'indikator-add' | 'indikator-edit' | 'indikator-delete' | 'pertanyaan-add' | 'pertanyaan-edit' | 'pertanyaan-delete' | null
    >(null);
    const [selectedIndikator, setSelectedIndikator] = useState<any>(null);
    const [selectedPertanyaan, setSelectedPertanyaan] = useState<any>(null);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    // Form for indikator
    const indikatorForm = useForm({
        nama: '',
        deskripsi: '',
    });
    // Form for pertanyaan
    const pertanyaanForm = useForm({
        isi: '',
    });

    // Open add/edit/hapus modal for indikator
    const openIndikatorModal = (type: 'indikator-add' | 'indikator-edit' | 'indikator-delete', indikator?: any) => {
        setModalType(type);
        setSelectedIndikator(indikator || null);
        if (type === 'indikator-edit' && indikator) {
            indikatorForm.setData({ nama: indikator.nama, deskripsi: indikator.deskripsi });
        } else {
            indikatorForm.reset();
        }
        setShowDialog(true);
    };
    // Open add/edit/hapus modal for pertanyaan
    const openPertanyaanModal = (type: 'pertanyaan-add' | 'pertanyaan-edit' | 'pertanyaan-delete', pertanyaan?: any, indikator?: any) => {
        setModalType(type);
        setSelectedPertanyaan(pertanyaan || null);
        setSelectedIndikator(indikator || null);
        if (type === 'pertanyaan-edit' && pertanyaan) {
            pertanyaanForm.setData({ isi: pertanyaan.isi });
        } else {
            pertanyaanForm.reset();
        }
        setShowDialog(true);
    };
    // Handle submit for indikator
    const handleIndikatorSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalType === 'indikator-add') {
            indikatorForm.post(`/standar-mutu/${standar.id}/indikator`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                },
            });
        } else if (modalType === 'indikator-edit' && selectedIndikator) {
            indikatorForm.put(`/standar-mutu/${standar.id}/indikator/${selectedIndikator.id}`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                },
            });
        }
    };
    // Handle submit for pertanyaan
    const handlePertanyaanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalType === 'pertanyaan-add' && selectedIndikator) {
            pertanyaanForm.post(`/standar-mutu/${standar.id}/indikator/${selectedIndikator.id}/pertanyaan`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                },
            });
        } else if (modalType === 'pertanyaan-edit' && selectedIndikator && selectedPertanyaan) {
            pertanyaanForm.put(`/standar-mutu/${standar.id}/indikator/${selectedIndikator.id}/pertanyaan/${selectedPertanyaan.id}`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                },
            });
        }
    };
    // Handle delete for indikator
    const handleIndikatorDelete = () => {
        if (selectedIndikator) {
            indikatorForm.delete(`/standar-mutu/${standar.id}/indikator/${selectedIndikator.id}`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                },
            });
        }
    };
    // Handle delete for pertanyaan
    const handlePertanyaanDelete = () => {
        if (selectedIndikator && selectedPertanyaan) {
            pertanyaanForm.delete(`/standar-mutu/${standar.id}/indikator/${selectedIndikator.id}/pertanyaan/${selectedPertanyaan.id}`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                },
            });
        }
    };
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Standar Mutu', href: '/standar-mutu' },
                { title: standar.nama, href: `/standar-mutu/${standar.id}` },
            ]}
            title={`Detail Standar: ${standar.nama}`}
        >
            <div className="space-y-6 p-6">
                <HeadingSmall title={`Detail Standar: ${standar.nama}`} description={standar.deskripsi} />
                <p className="mb-2">
                    Kode: <b>{standar.kode}</b>
                </p>
                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <p className="text-sm text-green-600">Berhasil!</p>
                </Transition>
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Indikator</h2>
                    <Button variant="default" onClick={() => openIndikatorModal('indikator-add')}>
                        Tambah Indikator
                    </Button>
                </div>
                <ul className="mb-4">
                    {standar.indikator.map((indikator: any, idx: number) => (
                        <li key={indikator.id} className="mb-2 rounded border p-2">
                            <div className="flex items-center justify-between">
                                <span>
                                    {idx + 1}. {indikator.nama}
                                </span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => openIndikatorModal('indikator-edit', indikator)}>
                                        Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => openIndikatorModal('indikator-delete', indikator)}>
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-2 ml-4">
                                <b>Pertanyaan:</b>
                                <ol>
                                    {indikator.pertanyaan.map((q: any, i: number) => (
                                        <li key={q.id} className="flex items-center justify-between">
                                            <span>
                                                {i + 1}. {q.isi}
                                            </span>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openPertanyaanModal('pertanyaan-edit', q, indikator)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => openPertanyaanModal('pertanyaan-delete', q, indikator)}
                                                >
                                                    Hapus
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                                <Button
                                    className="mt-2"
                                    variant="default"
                                    size="sm"
                                    onClick={() => openPertanyaanModal('pertanyaan-add', undefined, indikator)}
                                >
                                    Tambah Pertanyaan
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
                {/* Dialogs for indikator/pertanyaan CRUD */}
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    {modalType === 'indikator-add' && (
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Indikator</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleIndikatorSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="indikator-nama">Nama</Label>
                                    <Input
                                        id="indikator-nama"
                                        value={indikatorForm.data.nama}
                                        onChange={(e) => indikatorForm.setData('nama', e.target.value)}
                                        required
                                    />
                                    <InputError message={indikatorForm.errors.nama} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="indikator-deskripsi">Deskripsi</Label>
                                    <Input
                                        id="indikator-deskripsi"
                                        value={indikatorForm.data.deskripsi}
                                        onChange={(e) => indikatorForm.setData('deskripsi', e.target.value)}
                                    />
                                    <InputError message={indikatorForm.errors.deskripsi} />
                                </div>
                                <Button type="submit" disabled={indikatorForm.processing}>
                                    Simpan
                                </Button>
                            </form>
                        </DialogContent>
                    )}
                    {modalType === 'indikator-edit' && (
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Indikator</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleIndikatorSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="indikator-nama">Nama</Label>
                                    <Input
                                        id="indikator-nama"
                                        value={indikatorForm.data.nama}
                                        onChange={(e) => indikatorForm.setData('nama', e.target.value)}
                                        required
                                    />
                                    <InputError message={indikatorForm.errors.nama} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="indikator-deskripsi">Deskripsi</Label>
                                    <Input
                                        id="indikator-deskripsi"
                                        value={indikatorForm.data.deskripsi}
                                        onChange={(e) => indikatorForm.setData('deskripsi', e.target.value)}
                                    />
                                    <InputError message={indikatorForm.errors.deskripsi} />
                                </div>
                                <Button type="submit" disabled={indikatorForm.processing}>
                                    Simpan Perubahan
                                </Button>
                            </form>
                        </DialogContent>
                    )}
                    {modalType === 'indikator-delete' && (
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Hapus Indikator</DialogTitle>
                            </DialogHeader>
                            <p>
                                Yakin ingin menghapus indikator <b>{selectedIndikator?.nama}</b>?
                            </p>
                            <Button variant="destructive" onClick={handleIndikatorDelete} disabled={indikatorForm.processing}>
                                Konfirmasi Hapus
                            </Button>
                        </DialogContent>
                    )}
                    {modalType === 'pertanyaan-add' && (
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Pertanyaan</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handlePertanyaanSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="pertanyaan-isi">Isi Pertanyaan</Label>
                                    <Input
                                        id="pertanyaan-isi"
                                        value={pertanyaanForm.data.isi}
                                        onChange={(e) => pertanyaanForm.setData('isi', e.target.value)}
                                        required
                                    />
                                    <InputError message={pertanyaanForm.errors.isi} />
                                </div>
                                <Button type="submit" disabled={pertanyaanForm.processing}>
                                    Simpan
                                </Button>
                            </form>
                        </DialogContent>
                    )}
                    {modalType === 'pertanyaan-edit' && (
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Pertanyaan</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handlePertanyaanSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="pertanyaan-isi">Isi Pertanyaan</Label>
                                    <Input
                                        id="pertanyaan-isi"
                                        value={pertanyaanForm.data.isi}
                                        onChange={(e) => pertanyaanForm.setData('isi', e.target.value)}
                                        required
                                    />
                                    <InputError message={pertanyaanForm.errors.isi} />
                                </div>
                                <Button type="submit" disabled={pertanyaanForm.processing}>
                                    Simpan Perubahan
                                </Button>
                            </form>
                        </DialogContent>
                    )}
                    {modalType === 'pertanyaan-delete' && (
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Hapus Pertanyaan</DialogTitle>
                            </DialogHeader>
                            <p>
                                Yakin ingin menghapus pertanyaan <b>{selectedPertanyaan?.isi}</b>?
                            </p>
                            <Button variant="destructive" onClick={handlePertanyaanDelete} disabled={pertanyaanForm.processing}>
                                Konfirmasi Hapus
                            </Button>
                        </DialogContent>
                    )}
                </Dialog>
                {/* TODO: Integrate drag-and-drop for indikator/pertanyaan ordering here */}
            </div>
        </AppLayout>
    );
}

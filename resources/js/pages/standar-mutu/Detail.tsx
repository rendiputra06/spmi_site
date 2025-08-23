import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { IndikatorForm } from './components/forms/IndikatorForm';
import { PertanyaanForm } from './components/forms/PertanyaanForm';
import { IndikatorList } from './components/IndikatorList';

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
    const handleIndikatorSubmit = (data: { nama: string; deskripsi: string }) => {
        if (modalType === 'indikator-add') {
            indikatorForm.post(`/standar-mutu/${standar.id}/indikator`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                },
                onError: (errors) => {
                    console.error('Error saving indikator:', errors);
                    // The error will be automatically handled by the form's error bag
                },
                onFinish: () => {
                    // Reset form processing state
                    indikatorForm.clearErrors();
                },
                preserveScroll: true,
                preserveState: true,
            });
        } else if (modalType === 'indikator-edit' && selectedIndikator) {
            indikatorForm.put(`/standar-mutu/${standar.id}/indikator/${selectedIndikator.id}`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                },
                onError: (errors) => {
                    console.error('Error updating indikator:', errors);
                    // The error will be automatically handled by the form's error bag
                },
                onFinish: () => {
                    // Reset form processing state
                    indikatorForm.clearErrors();
                },
                preserveScroll: true,
                preserveState: true,
            });
        }
    };
    // Handle submit for pertanyaan
    const handlePertanyaanSubmit = (data: { isi: string }) => {
        if (modalType === 'pertanyaan-add' && selectedIndikator) {
            // Set the form data before submission
            pertanyaanForm.setData('isi', data.isi);
            pertanyaanForm.post(`/indikator/${selectedIndikator.id}/pertanyaan`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                    // Reset form after successful submission
                    pertanyaanForm.reset();
                },
                onError: (errors: any) => {
                    console.error('Error saving pertanyaan:', errors);
                    // The error will be automatically handled by the form's error bag
                },
                onFinish: () => {
                    // Reset form processing state
                    pertanyaanForm.clearErrors();
                },
                preserveScroll: true,
                preserveState: true,
            });
        } else if (modalType === 'pertanyaan-edit' && selectedPertanyaan) {
            // Set the form data before submission
            pertanyaanForm.setData('isi', data.isi);
            pertanyaanForm.put(`/pertanyaan/${selectedPertanyaan.id}`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                    // Reset form after successful update
                    pertanyaanForm.reset();
                },
                onError: (errors: any) => {
                    console.error('Error updating pertanyaan:', errors);
                    // The error will be automatically handled by the form's error bag
                },
                onFinish: () => {
                    // Reset form processing state
                    pertanyaanForm.clearErrors();
                },
                preserveScroll: true,
                preserveState: true,
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
                onError: (errors) => {
                    console.error('Error deleting indikator:', errors);
                    alert('Gagal menghapus indikator. Silakan coba lagi.');
                },
                preserveScroll: true,
                preserveState: true,
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
                <IndikatorList
                    indikators={standar.indikator}
                    onEditIndikator={(indikator) => openIndikatorModal('indikator-edit', indikator)}
                    onDeleteIndikator={(indikator) => openIndikatorModal('indikator-delete', indikator)}
                    onAddPertanyaan={(indikator) => openPertanyaanModal('pertanyaan-add', undefined, indikator)}
                    onEditPertanyaan={(pertanyaan, indikator) => openPertanyaanModal('pertanyaan-edit', pertanyaan, indikator)}
                    onDeletePertanyaan={(pertanyaan, indikator) => openPertanyaanModal('pertanyaan-delete', pertanyaan, indikator)}
                />
                {/* Dialogs for indikator/pertanyaan CRUD */}
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    {modalType === 'indikator-add' && (
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Indikator</DialogTitle>
                            </DialogHeader>
                            <IndikatorForm
                                onSubmit={handleIndikatorSubmit}
                                onCancel={() => setShowDialog(false)}
                                isProcessing={indikatorForm.processing}
                            />
                        </DialogContent>
                    )}
                    {modalType === 'indikator-edit' && selectedIndikator && (
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Indikator</DialogTitle>
                            </DialogHeader>
                            <IndikatorForm
                                initialData={{
                                    nama: selectedIndikator.nama,
                                    deskripsi: selectedIndikator.deskripsi || ''
                                }}
                                onSubmit={handleIndikatorSubmit}
                                onCancel={() => setShowDialog(false)}
                                isProcessing={indikatorForm.processing}
                            />
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
                    {modalType === 'pertanyaan-add' && selectedIndikator && (
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Pertanyaan</DialogTitle>
                            </DialogHeader>
                            <PertanyaanForm
                                onSubmit={handlePertanyaanSubmit}
                                onCancel={() => setShowDialog(false)}
                                isProcessing={pertanyaanForm.processing}
                            />
                        </DialogContent>
                    )}
                    {modalType === 'pertanyaan-edit' && selectedPertanyaan && (
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Pertanyaan</DialogTitle>
                            </DialogHeader>
                            <PertanyaanForm
                                initialData={{
                                    isi: selectedPertanyaan.isi
                                }}
                                onSubmit={handlePertanyaanSubmit}
                                onCancel={() => setShowDialog(false)}
                                isProcessing={pertanyaanForm.processing}
                            />
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

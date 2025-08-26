import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { Transition } from '@headlessui/react';
import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { IndikatorForm } from './components/forms/IndikatorForm';
import { PertanyaanForm } from './components/forms/PertanyaanForm';
import { IndikatorList } from './components/IndikatorList';
import { ArrowLeft, RefreshCw, Search } from 'lucide-react';

export default function StandarMutuDetail({ standar }: any) {
    const [showDialog, setShowDialog] = useState(false);
    const [modalType, setModalType] = useState<
        'indikator-add' | 'indikator-edit' | 'indikator-delete' | 'pertanyaan-add' | 'pertanyaan-edit' | 'pertanyaan-delete' | null
    >(null);
    const [selectedIndikator, setSelectedIndikator] = useState<any>(null);
    const [selectedPertanyaan, setSelectedPertanyaan] = useState<any>(null);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const [query, setQuery] = useState('');

    // Form for indikator
    const indikatorForm = useForm({
        nama: '',
        kriteria_penilaian: '',
        jenis_pengukuran: 'kuantitatif' as 'kuantitatif' | 'kualitatif',
        target_pencapaian: '',
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
            indikatorForm.setData({
                nama: indikator.nama,
                kriteria_penilaian: indikator.kriteria_penilaian || '',
                jenis_pengukuran: indikator.jenis_pengukuran || 'kuantitatif',
                target_pencapaian: indikator.target_pencapaian || '',
            });
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
    const handleIndikatorSubmit = (data: { nama: string; kriteria_penilaian?: string | null; jenis_pengukuran: 'kuantitatif' | 'kualitatif'; target_pencapaian?: string | null }) => {
        // Debug outgoing payload from child form
        console.log('Submitting indikator data:', data);
        if (!data.nama || data.nama.trim() === '') {
            toast.error('Pernyataan indikator wajib diisi.');
            return;
        }
        if (modalType === 'indikator-add') {
            // Shape the outgoing payload precisely for this request
            indikatorForm.transform(() => ({
                nama: data.nama,
                kriteria_penilaian: data.kriteria_penilaian ?? null,
                jenis_pengukuran: data.jenis_pengukuran,
                target_pencapaian: data.target_pencapaian ?? null,
            }));
            console.log('Posting indikator (add) transformed: ', {
                nama: data.nama,
                kriteria_penilaian: data.kriteria_penilaian ?? null,
                jenis_pengukuran: data.jenis_pengukuran,
                target_pencapaian: data.target_pencapaian ?? null,
            });
            indikatorForm.post(`/standar-mutu/${standar.id}/indikator`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                    toast.success('Indikator berhasil ditambahkan.');
                    indikatorForm.reset();
                    router.reload({ only: ['standar'] });
                },
                onError: (errors) => {
                    console.error('Error saving indikator:', errors);
                    const firstKey = Object.keys(errors || {})[0];
                    const msg = (firstKey && (errors as any)[firstKey]) || 'Gagal menyimpan indikator.';
                    toast.error(msg);
                },
                preserveScroll: true,
                preserveState: true,
            });
        } else if (modalType === 'indikator-edit' && selectedIndikator) {
            indikatorForm.transform(() => ({
                nama: data.nama,
                kriteria_penilaian: data.kriteria_penilaian ?? null,
                jenis_pengukuran: data.jenis_pengukuran,
                target_pencapaian: data.target_pencapaian ?? null,
            }));
            console.log('Posting indikator (edit) transformed: ', {
                nama: data.nama,
                kriteria_penilaian: data.kriteria_penilaian ?? null,
                jenis_pengukuran: data.jenis_pengukuran,
                target_pencapaian: data.target_pencapaian ?? null,
            });
            indikatorForm.put(`/standar-mutu/${standar.id}/indikator/${selectedIndikator.id}`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                    toast.success('Indikator berhasil diperbarui.');
                    indikatorForm.reset();
                    router.reload({ only: ['standar'] });
                },
                onError: (errors) => {
                    console.error('Error updating indikator:', errors);
                    const firstKey = Object.keys(errors || {})[0];
                    const msg = (firstKey && (errors as any)[firstKey]) || 'Gagal memperbarui indikator.';
                    toast.error(msg);
                },
                preserveScroll: true,
                preserveState: true,
            });
        }
    };
    // Handle submit for pertanyaan
    const handlePertanyaanSubmit = (data: { isi: string }) => {
        // Debug outgoing payload from child form
        console.log('Submitting pertanyaan data:', data);
        if (!data.isi || data.isi.trim() === '') {
            toast.error('Isi pertanyaan tidak boleh kosong.');
            return;
        }
        if (modalType === 'pertanyaan-add' && selectedIndikator) {
            // Shape payload precisely and avoid stale state
            pertanyaanForm.transform(() => ({ isi: data.isi }));
            console.log('Posting pertanyaan (add) transformed:', { isi: data.isi });
            pertanyaanForm.post(`/indikator/${selectedIndikator.id}/pertanyaan`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                    toast.success('Pertanyaan berhasil ditambahkan.');
                    // Reset form after successful submission
                    pertanyaanForm.reset();
                    router.reload({ only: ['standar'] });
                },
                onError: (errors: any) => {
                    console.error('Error saving pertanyaan:', errors);
                    const firstKey = Object.keys(errors || {})[0];
                    const msg = (firstKey && (errors as any)[firstKey]) || 'Gagal menyimpan pertanyaan.';
                    toast.error(msg);
                },
                onFinish: () => {
                    // Reset form processing state
                    pertanyaanForm.clearErrors();
                },
                preserveScroll: true,
                preserveState: true,
            });
        } else if (modalType === 'pertanyaan-edit' && selectedPertanyaan) {
            // Shape payload precisely and avoid stale state
            pertanyaanForm.transform(() => ({ isi: data.isi }));
            console.log('Posting pertanyaan (edit) transformed:', { isi: data.isi });
            pertanyaanForm.put(`/pertanyaan/${selectedPertanyaan.id}`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                    toast.success('Pertanyaan berhasil diperbarui.');
                    // Reset form after successful update
                    pertanyaanForm.reset();
                    router.reload({ only: ['standar'] });
                },
                onError: (errors: any) => {
                    console.error('Error updating pertanyaan:', errors);
                    const firstKey = Object.keys(errors || {})[0];
                    const msg = (firstKey && (errors as any)[firstKey]) || 'Gagal memperbarui pertanyaan.';
                    toast.error(msg);
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
    // Derived filtered list of indikator based on query (client-side)
    const filteredIndikators = (standar.indikator || []).filter((it: any) => {
        const q = query.toLowerCase();
        if (!q) return true;
        return (
            (it.nama || '').toLowerCase().includes(q) ||
            (it.kriteria_penilaian || '').toLowerCase().includes(q) ||
            (it.target_pencapaian || '').toLowerCase().includes(q)
        );
    });
    // Handle delete for indikator
    const handleIndikatorDelete = () => {
        if (selectedIndikator) {
            indikatorForm.delete(`/standar-mutu/${standar.id}/indikator/${selectedIndikator.id}`, {
                onSuccess: () => {
                    setShowDialog(false);
                    setRecentlySuccessful(true);
                    toast.success('Indikator berhasil dihapus.');
                    router.reload({ only: ['standar'] });
                },
                onError: (errors) => {
                    console.error('Error deleting indikator:', errors);
                    const msg = (errors as any)?.message || 'Gagal menghapus indikator. Silakan coba lagi.';
                    toast.error(msg);
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
                    toast.success('Pertanyaan berhasil dihapus.');
                    router.reload({ only: ['standar'] });
                },
                onError: (errors) => {
                    console.error('Error deleting pertanyaan:', errors);
                    const msg = (errors as any)?.message || 'Gagal menghapus pertanyaan. Silakan coba lagi.';
                    toast.error(msg);
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
                {/* Top bar: Back, Refresh, Search */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => router.get('/standar-mutu')} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Kembali</span>
                        </Button>
                        <Button variant="outline" onClick={() => router.reload({ only: ['standar'] })} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            <span>Muat Ulang</span>
                        </Button>
                    </div>
                    <div className="w-full sm:w-96">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cari indikator..."
                                className="w-full pl-9"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        {query && (
                            <div className="mt-2 flex justify-end">
                                <Button variant="outline" size="sm" onClick={() => setQuery('')}>Reset</Button>
                            </div>
                        )}
                    </div>
                </div>
                <HeadingSmall title={`Detail Standar: ${standar.nama}`} description={standar.deskripsi} />
                <p className="mb-2">
                    Kode: <b>{standar.kode}</b>
                </p>
                {/* Toasts handled globally via <Toaster /> in layout */}
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Indikator</h2>
                        <p className="text-sm text-muted-foreground">Drag dan drop untuk mengubah urutan</p>
                    </div>
                    <Button variant="default" onClick={() => openIndikatorModal('indikator-add')}>
                        Tambah Indikator
                    </Button>
                </div>
                <IndikatorList
                    indikators={filteredIndikators}
                    standarId={standar.id}
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
                                    kriteria_penilaian: selectedIndikator.kriteria_penilaian || '',
                                    jenis_pengukuran: selectedIndikator.jenis_pengukuran || 'kuantitatif',
                                    target_pencapaian: selectedIndikator.target_pencapaian || '',
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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { router, useForm } from '@inertiajs/react';
import { Search, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { StandarMutuCard } from './components/StandarMutuCard';
import { StandarMutuForm } from './components/StandarMutuForm';
import { StandarMutu, ModalType, StandarMutuIndexProps, StandarMutuFormData } from './types';

export default function StandarMutuIndex({ standar, search, status, error }: StandarMutuIndexProps) {
    const [query, setQuery] = useState(search || '');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [modalType, setModalType] = useState<ModalType>(null);

    const { data, setData, post, put, reset, errors, processing } = useForm<StandarMutuFormData>({
        kode: '',
        nama: '',
        deskripsi: '',
        status: true,
    });

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (query !== search) {
            router.get(
                '/standar-mutu',
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
                '/standar-mutu',
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

    const openEditModal = (row: StandarMutu) => {
        setData('kode', row.kode);
        setData('nama', row.nama);
        setData('deskripsi', row.deskripsi || '');
        setData('status', row.status);
        setEditId(row.id);
        setModalType('edit');
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        router.delete(`/standar-mutu/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setRecentlySuccessful(true);
                setTimeout(() => setRecentlySuccessful(false), 2000);
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (modalType === 'add') {
            post('/standar-mutu', {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setRecentlySuccessful(true);
                    setTimeout(() => setRecentlySuccessful(false), 2000);
                },
            });
        } else if (modalType === 'edit' && editId) {
            put(`/standar-mutu/${editId}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setRecentlySuccessful(true);
                    setTimeout(() => setRecentlySuccessful(false), 2000);
                },
            });
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setModalType(null);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Standar Mutu', href: '/standar-mutu' }]} title="Standar Mutu">
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Standar Mutu</h2>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => router.reload({ only: ['standar'] })}
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>Muat Ulang</span>
                        </Button>
                        <Button onClick={openAddModal}>
                            Tambah Standar Mutu
                        </Button>
                    </div>
                </div>

                <div className="bg-background rounded-lg border p-4">
                    <form onSubmit={(e) => e.preventDefault()} className="mb-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Cari standar mutu..."
                                    className="w-full pl-9"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={handleSearch}
                                    disabled={processing}
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    Cari
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={handleResetSearch}
                                    disabled={!query && !search}
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </form>

                    {recentlySuccessful && (
                        <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
                            Data berhasil disimpan
                        </div>
                    )}

                    {status && (
                        <div className="mb-4 rounded-md bg-blue-50 p-4 text-sm text-blue-700">
                            {status}
                        </div>
                    )}

                    {standar.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-muted-foreground">Tidak ada data standar mutu yang ditemukan</p>
                            <Button variant="outline" className="mt-4" onClick={openAddModal}>
                                + Tambah Standar Mutu
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {standar.data.map((row, idx) => (
                                <StandarMutuCard
                                    key={row.id}
                                    item={row}
                                    index={idx}
                                    currentPage={standar.current_page}
                                    perPage={standar.per_page}
                                    onEdit={openEditModal}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {standar.links && standar.links.length > 1 && (
                    <div className="flex justify-center pt-6 flex-wrap gap-2">
                        {standar.links.map((link, i) => (
                            <Button
                                key={i}
                                disabled={!link.url}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Button>
                        ))}
                    </div>
                )}

                {/* Add/Edit Dialog */}
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${isDialogOpen && modalType !== 'delete' ? 'block' : 'hidden'}`}>
                    <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
                        <h2 className="mb-6 text-xl font-semibold">
                            {modalType === 'add' ? 'Tambah' : 'Edit'} Standar Mutu
                        </h2>
                        
                        <StandarMutuForm
                            data={data}
                            setData={setData}
                            errors={errors}
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
            </div>
        </AppLayout>
    );
}

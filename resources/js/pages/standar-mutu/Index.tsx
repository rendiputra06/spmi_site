import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { router, useForm } from '@inertiajs/react';
import { Search, RefreshCw } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { StandarMutuCard } from './components/StandarMutuCard';
import { StandarMutuForm } from './components/StandarMutuForm';
import { StandarMutu, ModalType, StandarMutuIndexProps, StandarMutuFormData } from './types';

export default function StandarMutuIndex({ standar, search, status, error, filterStatus }: StandarMutuIndexProps) {
    const [query, setQuery] = useState(search || '');
    const [statusFilter, setStatusFilter] = useState<string>(filterStatus || 'all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [modalType, setModalType] = useState<ModalType>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const lastRequestedRef = useRef<{ q: string; status: string }>({ q: (search || '').trim(), status: filterStatus || 'all' });
    const DEBOUNCE_MS = 400;

    const { data, setData, post, put, reset, errors, processing } = useForm<StandarMutuFormData>({
        kode: '',
        nama: '',
        deskripsi: '',
        status: true,
    });

    const handleSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
        e?.preventDefault?.();
        const q = (query || '').trim();
        // Avoid duplicate request if already requested with same params
        if (q === lastRequestedRef.current.q && statusFilter === lastRequestedRef.current.status) return;
        if (q !== (search || '') || (filterStatus || 'all') !== statusFilter) {
            router.get(
                '/standar-mutu',
                { search: q, status: statusFilter },
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
            lastRequestedRef.current = { q, status: statusFilter };
        }
    };

    const handleResetSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
        e?.preventDefault?.();
        setQuery('');
        setStatusFilter('all');
        if (search || (filterStatus && filterStatus !== 'all')) {
            router.get(
                '/standar-mutu',
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
        }
        // re-focus search input after reset
        setTimeout(() => searchInputRef.current?.focus(), 0);
    };

    // Global shortcuts: Ctrl/Cmd+K or '/' to focus search; Escape to reset when focused
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const isInputTarget = (e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA';
            // Ctrl/Cmd+K focuses search
            if ((e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) {
                e.preventDefault();
                searchInputRef.current?.focus();
                return;
            }
            // '/' focuses search when not already typing into an input
            if (e.key === '/' && !isInputTarget) {
                e.preventDefault();
                searchInputRef.current?.focus();
                return;
            }
            // Escape clears query if search is focused
            if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
                e.preventDefault();
                handleResetSearch();
                return;
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [search, filterStatus]);

    // Debounced auto-search on query/status change
    useEffect(() => {
        const q = (query || '').trim();
        const st = statusFilter;
        const timer = window.setTimeout(() => {
            // Skip if same as last requested
            if (q === lastRequestedRef.current.q && st === lastRequestedRef.current.status) return;
            // Only dispatch when differs from initial props or last requested
            if (q !== (search || '') || (filterStatus || 'all') !== st) {
                router.get(
                    '/standar-mutu',
                    { search: q, status: st },
                    { preserveState: true, preserveScroll: true },
                );
                lastRequestedRef.current = { q, status: st };
            }
        }, DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, statusFilter]);

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
            onError: (errors) => {
                const msg = (errors && (errors as any).message) || 'Gagal menghapus standar. Silakan coba lagi.';
                setErrorMessage(msg);
                setTimeout(() => setErrorMessage(null), 4000);
            }
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
                onError: (errors) => {
                    const firstKey = Object.keys(errors || {})[0];
                    const msg = (firstKey && (errors as any)[firstKey]) || 'Gagal menyimpan standar.';
                    setErrorMessage(msg);
                }
            });
        } else if (modalType === 'edit' && editId) {
            put(`/standar-mutu/${editId}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setRecentlySuccessful(true);
                    setTimeout(() => setRecentlySuccessful(false), 2000);
                },
                onError: (errors) => {
                    const firstKey = Object.keys(errors || {})[0];
                    const msg = (firstKey && (errors as any)[firstKey]) || 'Gagal memperbarui standar.';
                    setErrorMessage(msg);
                }
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
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Cari standar mutu..."
                                    className="w-full pl-9"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') return handleSearch(e);
                                        if (e.key === 'Escape') return handleResetSearch(e);
                                    }}
                                    ref={searchInputRef}
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') return handleSearch(e);
                                    }}
                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                </select>
                                <Button 
                                    variant="outline" 
                                    onClick={handleResetSearch}
                                    disabled={!query && !search && (statusFilter === 'all' && (!filterStatus || filterStatus === 'all'))}
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

                    {errorMessage && (
                        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                            {errorMessage}
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

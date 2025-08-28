import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { Loader2, RefreshCw, Search, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DocumentCard } from './components/DocumentCard';
import { DocumentForm } from './components/DocumentForm';
import type { DocumentItem, UnitOption } from './types';

interface Paginated<T> {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

interface DocumentsIndexProps {
    documents: Paginated<DocumentItem>;
    search?: string;
    unit_id?: number | string | null;
    unit_options?: UnitOption[];
    can_manage_all?: boolean;
    category?: string | null;
    status?: string | null;
}

export default function DocumentsIndex({
    documents,
    search,
    unit_id,
    unit_options = [],
    can_manage_all = false,
    category,
    status,
}: DocumentsIndexProps) {
    const [query, setQuery] = useState(search || '');
    const [unitFilter, setUnitFilter] = useState<string>(unit_id ? String(unit_id) : '');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<string>(category || '');
    const [statusFilter, setStatusFilter] = useState<string>(status || '');
    const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [unitQuery, setUnitQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const lastRequestedRef = useRef<{ q: string; unit: string; category: string; status: string }>({
        q: (search || '').trim(),
        unit: unit_id ? String(unit_id) : '',
        category: category || '',
        status: status || '',
    });
    const DEBOUNCE_MS = 400;

    const goToPage = (page: number) => {
        if (page < 1 || page > documents.last_page || page === documents.current_page) return;
        router.get(
            '/documents',
            {
                page,
                ...(query ? { search: query } : {}),
                ...(unitFilter ? { unit_id: unitFilter } : {}),
                ...(categoryFilter ? { category: categoryFilter } : {}),
                ...(statusFilter ? { status: statusFilter } : {}),
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
        e?.preventDefault?.();
        const q = (query || '').trim();
        const current = lastRequestedRef.current;
        const params: Record<string, any> = {};
        if (q) params.search = q;
        if (unitFilter) params.unit_id = unitFilter;
        if (categoryFilter) params.category = categoryFilter;
        if (statusFilter) params.status = statusFilter;
        if (q === current.q && unitFilter === current.unit && categoryFilter === current.category && statusFilter === current.status) return;
        router.get('/documents', params, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
        lastRequestedRef.current = { q, unit: unitFilter, category: categoryFilter, status: statusFilter };
    };

    const handleReset = (e?: React.FormEvent | React.KeyboardEvent) => {
        e?.preventDefault?.();
        setQuery('');
        setUnitFilter('');
        setCategoryFilter('');
        setStatusFilter('');
        router.get('/documents', {}, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
        lastRequestedRef.current = { q: '', unit: '', category: '', status: '' };
        setTimeout(() => searchInputRef.current?.focus(), 0);
    };

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const isInputTarget = (e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA';
            if ((e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) {
                e.preventDefault();
                searchInputRef.current?.focus();
                return;
            }
            if (e.key === '/' && !isInputTarget) {
                e.preventDefault();
                searchInputRef.current?.focus();
                return;
            }
            if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
                e.preventDefault();
                handleReset();
                return;
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounce on search & filters
    useEffect(() => {
        const q = (query || '').trim();
        const unit = unitFilter;
        const cat = categoryFilter.trim();
        const st = statusFilter;
        const timer = window.setTimeout(() => {
            const current = lastRequestedRef.current;
            const params: Record<string, any> = {};
            if (q) params.search = q;
            if (unit) params.unit_id = unit;
            if (cat) params.category = cat;
            if (st) params.status = st;
            if (q === current.q && unit === current.unit && cat === current.category && st === current.status) return;
            const opts = {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            } as const;
            if (Object.keys(params).length > 0) {
                router.get('/documents', params, opts);
            } else {
                router.get('/documents', {}, opts);
            }
            lastRequestedRef.current = { q, unit, category: cat, status: st };
        }, DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, unitFilter, categoryFilter, statusFilter]);

    return (
        <AppLayout title="Dokumen">
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold">Manajemen Dokumen</h1>
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsUploadOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" /> Upload Dokumen
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            type="search"
                            placeholder="Cari judul/deskripsi/kategori"
                            className="w-full pl-9"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') return handleSearch(e);
                                if (e.key === 'Escape') return handleReset(e);
                            }}
                            ref={searchInputRef}
                        />
                    </div>
                    {can_manage_all && (
                        <div className="flex-1 sm:max-w-xs">
                            <div className="mb-2">
                                <Input
                                    placeholder="Cari Unit..."
                                    value={unitQuery}
                                    onChange={(e) => setUnitQuery(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') return handleSearch(e); if (e.key === 'Escape') return handleReset(e); }}
                                />
                            </div>
                            <select
                                className="h-9 w-full rounded border px-3"
                                value={unitFilter}
                                onChange={(e) => setUnitFilter(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') return handleSearch(e as any); }}
                            >
                                <option value="">Semua Unit</option>
                                {unit_options
                                    .filter((u) => {
                                        const q = unitQuery.toLowerCase();
                                        if (!q) return true;
                                        return (
                                            String(u.id).includes(q) ||
                                            (u.nama?.toLowerCase().includes(q)) ||
                                            (u.tipe ? u.tipe.toLowerCase().includes(q) : false)
                                        );
                                    })
                                    .slice(0, 500)
                                    .map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nama} {u.tipe ? `(${u.tipe})` : ''}
                                        </option>
                                    ))}
                            </select>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {unitQuery ? `Filter: ${unit_options.filter(u => (String(u.id).includes(unitQuery.toLowerCase()) || u.nama?.toLowerCase().includes(unitQuery.toLowerCase()) || (u.tipe ? u.tipe.toLowerCase().includes(unitQuery.toLowerCase()) : false))).length} unit` : `${unit_options.length} unit`}
                            </div>
                        </div>
                    )}
                    <div className="flex-1 sm:max-w-xs">
                        <Input placeholder="Kategori" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') return handleSearch(e); if (e.key === 'Escape') return handleReset(e); }} />
                    </div>
                    <div className="flex-1 sm:max-w-xs">
                        <select className="h-9 w-full rounded border px-3" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') return handleSearch(e as any); }}>
                            <option value="">Semua Status</option>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={!query && !unitFilter && !search && !unit_id && !categoryFilter && !statusFilter}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" /> Reset
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {documents.data.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            item={doc}
                            onPreview={() => setPreviewDoc(doc)}
                            onEdit={() => {
                                setSelectedDoc(doc);
                                setIsUploadOpen(true);
                            }}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-muted-foreground text-sm">
                        Menampilkan {documents.data.length} dari {documents.total} dokumen
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" disabled={documents.current_page <= 1} onClick={() => goToPage(documents.current_page - 1)}>
                            Prev
                        </Button>
                        <Button
                            variant="outline"
                            disabled={documents.current_page >= documents.last_page}
                            onClick={() => goToPage(documents.current_page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>

                <DocumentForm
                    open={isUploadOpen}
                    onOpenChange={(v) => {
                        if (!v) setSelectedDoc(null);
                        setIsUploadOpen(v);
                    }}
                    unitOptions={unit_options}
                    canManageAll={can_manage_all}
                    defaultUnitId={unit_id ? String(unit_id) : ''}
                    mode={selectedDoc ? 'edit' : 'create'}
                    initialData={selectedDoc ? {
                        id: selectedDoc.id,
                        title: selectedDoc.title,
                        description: selectedDoc.description ?? '',
                        category: selectedDoc.category ?? '',
                        status: (selectedDoc.status as any) ?? 'draft',
                        unit_id: selectedDoc.unit_id ?? '',
                        file_path: selectedDoc.file_path,
                        mime: selectedDoc.mime ?? null,
                        size: selectedDoc.size,
                    } : null}
                    documentId={selectedDoc?.id ?? null}
                />

                {previewDoc && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreviewDoc(null)}>
                        <div className="w-full max-w-5xl overflow-hidden rounded bg-white shadow" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b p-3">
                                <h3 className="font-medium">Preview: {previewDoc.title}</h3>
                                <button className="text-sm" onClick={() => setPreviewDoc(null)}>
                                    Tutup
                                </button>
                            </div>
                            <div className="p-0" style={{ height: '80vh' }}>
                                {previewDoc.mime?.startsWith('image/') ? (
                                    <img src={`/documents/${previewDoc.id}/download?inline=1`} alt={previewDoc.title} className="h-full w-full object-contain" />
                                ) : previewDoc.mime === 'application/pdf' || previewDoc.file_path.toLowerCase().endsWith('.pdf') ? (
                                    <iframe src={`/documents/${previewDoc.id}/download?inline=1`} title={previewDoc.title} className="h-full w-full" />
                                ) : (
                                    <div className="text-muted-foreground p-6 text-sm">
                                        Preview tidak tersedia untuk tipe ini. Silakan unduh dokumen.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

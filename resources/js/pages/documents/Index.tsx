import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { RefreshCw, Search, Upload } from 'lucide-react';
import { useState } from 'react';
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
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleSearch = () => {
        router.get(
            '/documents',
            {
                ...(query ? { search: query } : {}),
                ...(unitFilter ? { unit_id: unitFilter } : {}),
                ...(categoryFilter ? { category: categoryFilter } : {}),
                ...(statusFilter ? { status: statusFilter } : {}),
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleReset = () => {
        setQuery('');
        setUnitFilter('');
        setCategoryFilter('');
        setStatusFilter('');
        router.get('/documents', {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout title="Dokumen">
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Manajemen Dokumen</h1>
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
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    {can_manage_all && (
                        <div className="flex-1 sm:max-w-xs">
                            <select className="h-9 w-full rounded border px-3" value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)}>
                                <option value="">Semua Unit</option>
                                {unit_options.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.nama} {u.tipe ? `(${u.tipe})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="flex-1 sm:max-w-xs">
                        <Input placeholder="Kategori" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} />
                    </div>
                    <div className="flex-1 sm:max-w-xs">
                        <select className="h-9 w-full rounded border px-3" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">Semua Status</option>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleSearch}>
                            <Search className="mr-2 h-4 w-4" /> Cari
                        </Button>
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
                        <DocumentCard key={doc.id} item={doc} onPreview={() => setPreviewDoc(doc)} />
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
                    onOpenChange={setIsUploadOpen}
                    unitOptions={unit_options}
                    canManageAll={can_manage_all}
                    defaultUnitId={unit_id ? String(unit_id) : ''}
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
                                    <img src={`/storage/${previewDoc.file_path}`} alt={previewDoc.title} className="h-full w-full object-contain" />
                                ) : previewDoc.mime === 'application/pdf' || previewDoc.file_path.toLowerCase().endsWith('.pdf') ? (
                                    <iframe src={`/storage/${previewDoc.file_path}`} title={previewDoc.title} className="h-full w-full" />
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

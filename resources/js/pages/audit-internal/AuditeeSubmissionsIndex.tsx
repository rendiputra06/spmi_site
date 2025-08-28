import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import React, { useEffect, useMemo, useState } from 'react';
import InfoBar from './components/auditee/InfoBar';
import DocumentPickerModal from './components/auditee/DocumentPickerModal';
import SelectedDocsModal from './components/auditee/SelectedDocsModal';
import { DocumentForm } from '@/pages/documents/components/DocumentForm';

interface PertanyaanSubmissionInfo {
    id: number;
    status: 'draft' | 'submitted';
    doc_count: number;
    submitted_at?: string;
    answer_comment?: string | null;
}

interface Standar {
    id: number;
    kode: string;
    nama: string;
    indikator: Array<{
        id: number;
        nama: string;
        pertanyaan: Array<{ id: number; isi: string }>;
    }>;
}

interface PageProps {
    session: { id: number; nama: string };
    unit: { id: number; nama: string } | null;
    standars: Standar[];
    submissions: Record<number, PertanyaanSubmissionInfo>;
    message?: string;
    auditors?: Array<{ id: number; name?: string | null; email?: string | null }>;
    auditee?: { id: number; name: string; email?: string | null; unit_id?: number | null } | null;
}

export default function AuditeeSubmissionsIndex({ session, unit, standars, submissions, message, auditors = [], auditee = null }: PageProps) {
    const page = usePage();
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [activeSubmissionId, setActiveSubmissionId] = useState<number | null>(null);
    const [pendingPertanyaanId, setPendingPertanyaanId] = useState<number | null>(null);
    const [inlineAlert, setInlineAlert] = useState<string | null>(null);
    const [openCommentFor, setOpenCommentFor] = useState<number | null>(null);
    const [commentsDraft, setCommentsDraft] = useState<Record<number, string>>({});
    const [isSubmittingAll, setIsSubmittingAll] = useState(false);
    const [savingCommentFor, setSavingCommentFor] = useState<number | null>(null);

    // Ensure a submission exists for a pertanyaan before opening upload modal
    const handleUploadAndAttach = (pertanyaanId: number) => {
        const info = submissions[pertanyaanId];
        if (info && info.id) {
            setActiveSubmissionId(info.id);
            setIsUploadOpen(true);
            return;
        }
        // Create draft submission first, then trigger partial reload
        setPendingPertanyaanId(pertanyaanId);
        router.post(`/audit-internal/${session.id}/auditee-submissions/upsert`, { pertanyaan_id: pertanyaanId }, {
            onSuccess: () => {
                router.reload({ only: ['submissions'] });
            },
            onError: () => {
                setPendingPertanyaanId(null);
                toast.error('Gagal menyiapkan jawaban untuk pertanyaan ini.');
            }
        });
    };

    // Flatten all pertanyaan for validation
    const allPertanyaanIds = useMemo(() => {
        const ids: number[] = [];
        standars.forEach((s) => s.indikator.forEach((ind) => ind.pertanyaan.forEach((q) => ids.push(q.id))));
        return ids;
    }, [standars]);

    // When submissions updated and we have a pending pertanyaan, open modal with its new submission id
    useEffect(() => {
        if (pendingPertanyaanId) {
            const info = submissions[pendingPertanyaanId];
            if (info && info.id) {
                setActiveSubmissionId(info.id);
                setIsUploadOpen(true);
                setPendingPertanyaanId(null);
            }
        }
    }, [submissions, pendingPertanyaanId]);

    const handleOpenAttach = (pertanyaanId: number) => {
        const existing = submissions[pertanyaanId]?.id;
        if (existing) {
            setActiveSubmissionId(existing);
            setIsPickerOpen(true);
            return;
        }
        // Ensure submission exists, then reload only submissions and open modal when ready
        setPendingPertanyaanId(pertanyaanId);
        router.post(
            `/audit-internal/${session.id}/auditee-submissions/upsert`,
            { pertanyaan_id: pertanyaanId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['submissions'] });
                },
            }
        );
    };

    const handlePicked = () => {
        setIsPickerOpen(false);
        router.reload({ only: ['submissions'] });
    };

    const handleReview = (pertanyaanId: number) => {
        const sid = submissions[pertanyaanId]?.id;
        if (!sid) return;
        setActiveSubmissionId(sid);
        setIsReviewOpen(true);
    };

    const handleOpenComment = (pertanyaanId: number) => {
        setOpenCommentFor((curr) => (curr === pertanyaanId ? null : pertanyaanId));
        setCommentsDraft((prev) => ({
            ...prev,
            [pertanyaanId]: submissions[pertanyaanId]?.answer_comment || '',
        }));
    };

    const handleSaveComment = (pertanyaanId: number) => {
        const value = commentsDraft[pertanyaanId] ?? '';
        if (value.trim() === '') {
            toast.error('Narasi tidak boleh kosong');
            return;
        }
        setSavingCommentFor(pertanyaanId);
        router.post(
            `/audit-internal/${session.id}/auditee-submissions/upsert`,
            { pertanyaan_id: pertanyaanId, answer_comment: value },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Narasi tersimpan');
                    router.reload({ only: ['submissions'] });
                },
                onError: () => toast.error('Gagal menyimpan narasi'),
                onFinish: () => setSavingCommentFor(null),
            }
        );
    };

    const handleSubmitAll = () => {
        // Validate all pertanyaan have at least one document and non-empty narrative
        let missingDocs = 0;
        let missingComments = 0;
        allPertanyaanIds.forEach((pid) => {
            const s = submissions[pid];
            if (!s || (s.doc_count || 0) === 0) missingDocs++;
            const c = s?.answer_comment ?? '';
            if (!s || (typeof c === 'string' && c.trim() === '')) missingComments++;
        });

        if (missingDocs > 0 || missingComments > 0) {
            const parts: string[] = [];
            if (missingDocs > 0) parts.push(`${missingDocs} pertanyaan tanpa dokumen`);
            if (missingComments > 0) parts.push(`${missingComments} pertanyaan tanpa narasi`);
            const msg = `Tidak dapat submit: ${parts.join(', ')}`;
            setInlineAlert(msg);
            toast.error(msg);
            return;
        }
        setInlineAlert(null);
        setIsSubmittingAll(true);
        router.post(`/audit-internal/${session.id}/auditee-submissions/submit`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Semua jawaban berhasil disubmit'),
            onError: () => toast.error('Gagal submit jawaban'),
            onFinish: () => setIsSubmittingAll(false),
        });
    };

    return (
        <AppLayout
            title={`Auditee Submissions - ${session?.nama ?? ''}`}
            breadcrumbs={[
                { title: 'Audit Internal', href: '/audit-internal' },
                { title: 'Auditee Submissions', href: `/audit-internal/${session.id}/auditee-submissions` },
            ]}
        >
            <div className="space-y-4 p-4 md:p-6">
                <InfoBar session={session as any} standars={standars as any} submissions={submissions as any} auditors={auditors} auditee={auditee || undefined} />
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Auditee Submissions</h2>
                        <p className="text-muted-foreground text-sm">
                            Sesi: <strong>{session?.nama}</strong> {unit ? `• Unit: ${unit.nama}` : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleSubmitAll} disabled={isSubmittingAll}>
                            {isSubmittingAll ? 'Menyubmit...' : 'Submit Semua'}
                        </Button>
                    </div>
                </div>

                {message && <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">{message}</div>}
                {inlineAlert && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                        {inlineAlert}
                    </div>
                )}

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-3 py-2 text-left">Standar / Indikator / Pertanyaan</th>
                                <th className="px-3 py-2 text-left">Link Bukti Dokumen</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standars.map((s) => (
                                <React.Fragment key={s.id}>
                                    <tr key={`standar-${s.id}`} className="bg-muted/30">
                                        <td className="px-3 py-2 font-medium">
                                            {s.kode} — {s.nama}
                                        </td>
                                        <td className="px-3 py-2"></td>
                                        <td className="px-3 py-2"></td>
                                        <td className="px-3 py-2"></td>
                                    </tr>
                                    {s.indikator.map((ind) => (
                                        <React.Fragment key={ind.id}>
                                            <tr key={`indikator-${ind.id}`} className="bg-muted/10">
                                                <td className="px-3 py-2 pl-6">• {ind.nama}</td>
                                                <td className="px-3 py-2"></td>
                                                <td className="px-3 py-2"></td>
                                                <td className="px-3 py-2"></td>
                                            </tr>
                                            {ind.pertanyaan.map((q) => {
                                                const info = submissions[q.id];
                                                return (
                                                    <React.Fragment key={`qwrap-${q.id}`}>
                                                        <tr key={`q-${q.id}`}>
                                                            <td className="px-3 py-2 pl-10">- {q.isi}</td>
                                                            <td className="px-3 py-2">
                                                                {info?.doc_count ? (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="cursor-pointer hover:underline"
                                                                        onClick={() => handleReview(q.id)}
                                                                    >
                                                                        {info.doc_count} dokumen
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-muted-foreground">Belum ada dokumen</span>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {info?.status ? (
                                                                    <Badge variant={info.status === 'submitted' ? 'default' : 'secondary'}>
                                                                        {info.status}
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="secondary">draft</Badge>
                                                                )}
                                                                {info?.answer_comment && info.answer_comment.trim() !== '' ? (
                                                                    <span className="ml-2 inline-flex items-center">
                                                                        <Badge variant="outline">Ada narasi</Badge>
                                                                    </span>
                                                                ) : (
                                                                    <span className="ml-2 text-xs text-muted-foreground">Belum ada narasi</span>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <div className="flex flex-wrap gap-2">
                                                                    <Button size="sm" variant="outline" onClick={() => handleOpenAttach(q.id)}>Pilih Dokumen</Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleUploadAndAttach(q.id)}
                                                                    >
                                                                        Upload
                                                                    </Button>
                                                                    <Button size="sm" variant="secondary" onClick={() => handleOpenComment(q.id)}>
                                                                        {openCommentFor === q.id ? 'Tutup Narasi' : 'Isi Narasi'}
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {openCommentFor === q.id && (
                                                            <tr key={`qcomment-${q.id}`}>
                                                                <td className="px-3 py-2 pl-10" colSpan={4}>
                                                                    <div className="space-y-2">
                                                                        <div className="text-xs text-muted-foreground">Narasi/komentar jawaban untuk pertanyaan ini</div>
                                                                        <Textarea
                                                                            rows={3}
                                                                            placeholder="Tulis narasi atau komentar jawaban di sini..."
                                                                            value={commentsDraft[q.id] ?? ''}
                                                                            onChange={(e) => setCommentsDraft((prev) => ({ ...prev, [q.id]: e.target.value }))}
                                                                        />
                                                                        <div className="flex items-center gap-2">
                                                                            <Button size="sm" onClick={() => handleSaveComment(q.id)} disabled={savingCommentFor === q.id}>
                                                                                {savingCommentFor === q.id ? 'Menyimpan...' : 'Simpan Narasi'}
                                                                            </Button>
                                                                            <Button size="sm" variant="ghost" onClick={() => setOpenCommentFor(null)}>Batal</Button>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                <DocumentPickerModal open={isPickerOpen} submissionId={activeSubmissionId} onClose={() => setIsPickerOpen(false)} onPicked={handlePicked} />
                <SelectedDocsModal open={isReviewOpen} submissionId={activeSubmissionId} onClose={() => setIsReviewOpen(false)} />
                <DocumentForm
                    open={isUploadOpen}
                    onOpenChange={(v) => setIsUploadOpen(v)}
                    unitOptions={[]}
                    canManageAll={false}
                    defaultUnitId={unit ? String(unit.id) : ''}
                    mode="create"
                    initialData={null}
                    documentId={null}
                    actionUrl={activeSubmissionId ? `/auditee-submissions/${activeSubmissionId}/upload-and-attach` : undefined}
                    onUploaded={() => {
                        toast.success('Dokumen diunggah dan dilampirkan.');
                        router.reload({ only: ['submissions'] });
                        setIsReviewOpen(true);
                    }}
                />
            </div>
        </AppLayout>
    );
}

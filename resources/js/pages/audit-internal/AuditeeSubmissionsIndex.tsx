import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import InfoBar from './components/auditee/InfoBar';
import DocumentPickerModal from './components/auditee/DocumentPickerModal';
import SelectedDocsModal from './components/auditee/SelectedDocsModal';

interface PertanyaanSubmissionInfo {
    id: number;
    status: 'draft' | 'submitted';
    doc_count: number;
    submitted_at?: string;
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
    submissions: Record<string, PertanyaanSubmissionInfo>;
    message?: string;
    auditors?: Array<{ id: number; name?: string | null; email?: string | null }>;
    auditee?: { id: number; name: string; email?: string | null; unit_id?: number | null } | null;
}

export default function AuditeeSubmissionsIndex({ session, unit, standars, submissions, message, auditors = [], auditee = null }: PageProps) {
    const page = usePage();
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [activeSubmissionId, setActiveSubmissionId] = useState<number | null>(null);
    const [pendingPertanyaanId, setPendingPertanyaanId] = useState<number | null>(null);
    const [inlineAlert, setInlineAlert] = useState<string | null>(null);

    // Flatten all pertanyaan for validation
    const allPertanyaanIds = useMemo(() => {
        const ids: number[] = [];
        standars.forEach((s) => s.indikator.forEach((ind) => ind.pertanyaan.forEach((q) => ids.push(q.id))));
        return ids;
    }, [standars]);

    // When submissions updated and we have a pending pertanyaan, open modal with its new submission id
    useEffect(() => {
        if (pendingPertanyaanId && submissions[pendingPertanyaanId]?.id) {
            setActiveSubmissionId(submissions[pendingPertanyaanId].id);
            setIsPickerOpen(true);
            setPendingPertanyaanId(null);
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

    const handleSubmitAll = () => {
        // Validate all pertanyaan have at least one document
        const notFilled = allPertanyaanIds.filter((pid) => !submissions[pid] || (submissions[pid].doc_count || 0) === 0);
        if (notFilled.length > 0) {
            setInlineAlert(`Masih ada ${notFilled.length} pertanyaan yang belum memiliki dokumen. Mohon lengkapi terlebih dahulu.`);
            return;
        }
        setInlineAlert(null);
        router.post(`/audit-internal/${session.id}/auditee-submissions/submit`);
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
                        <Button onClick={handleSubmitAll}>Submit Semua</Button>
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
                                <th className="px-3 py-2 text-left">Evidence</th>
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
                                                    <tr key={`q-${q.id}`}>
                                                        <td className="px-3 py-2 pl-10">- {q.isi}</td>
                                                        <td className="px-3 py-2">
                                                            {info?.doc_count ? (
                                                                <Badge variant="outline">{info.doc_count} dokumen</Badge>
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
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <div className="flex gap-2">
                                                                <Button size="sm" variant="outline" onClick={() => handleOpenAttach(q.id)}>Pilih Dokumen</Button>
                                                                <Button size="sm" variant="ghost" disabled={!info?.doc_count} onClick={() => handleReview(q.id)}>Review</Button>
                                                            </div>
                                                        </td>
                                                    </tr>
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
            </div>
        </AppLayout>
    );
}

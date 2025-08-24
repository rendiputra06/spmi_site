import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import InfoBarAuditor from './components/InfoBarAuditor';
import StatsBarAuditor from './components/StatsBarAuditor';
import DocsPreviewModal from './components/DocsPreviewModal';

interface DocItem {
    id: number;
    title: string;
    mime?: string | null;
    size?: number | null;
    download_url: string;
}
interface SubmissionRow {
    id: number;
    unit_id: number;
    standar: { id: number; nama: string } | null;
    indikator: { id: number; nama: string } | null;
    pertanyaan: { id: number; isi: string } | null;
    documents: DocItem[];
    review: { score?: number | string | null; reviewer_note?: string | null } | null;
}

interface PageProps {
    session: any;
    assigned_unit_ids: number[];
    submissions?: SubmissionRow[];
}

export default function AuditeeReviewIndex({ session, assigned_unit_ids, submissions = [] }: PageProps) {
    const page = usePage<any>();
    const authUser = (page?.props as any)?.auth?.user;
    const auditorName: string | undefined = authUser?.name;
    const [saving, setSaving] = useState<Record<number, boolean>>({});
    const [draft, setDraft] = useState<Record<number, { score?: string; reviewer_note?: string }>>(() => {
        const init: Record<number, { score?: string; reviewer_note?: string }> = {};
        submissions.forEach((s) => {
            init[s.id] = {
                score: s.review?.score !== undefined && s.review?.score !== null ? String(s.review?.score) : '',
                reviewer_note: s.review?.reviewer_note || '',
            };
        });
        return init;
    });

    const handleChange = (id: number, field: 'score' | 'reviewer_note', value: string) => {
        setDraft((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    };

    const saveRow = (id: number) => {
        const payload = draft[id] || {};
        // normalize score to 1 decimal string or null
        let score: number | null = null;
        if (payload.score) {
            const n = parseFloat(payload.score);
            if (!isNaN(n)) score = Math.round(n * 10) / 10;
        }
        setSaving((prev) => ({ ...prev, [id]: true }));
        router.post(
            `/auditee-submissions/${id}/review`,
            { score, reviewer_note: payload.reviewer_note || null },
            {
                preserveScroll: true,
                onFinish: () => setSaving((prev) => ({ ...prev, [id]: false })),
            },
        );
    };

    const groups = useMemo(() => {
        // group by standar -> indikator
        const byStandar: Record<
            string,
            { standar?: SubmissionRow['standar']; indikators: Record<string, { indikator?: SubmissionRow['indikator']; rows: SubmissionRow[] }> }
        > = {};
        submissions.forEach((row) => {
            const sKey = row.standar?.id ? String(row.standar.id) : 'null';
            const iKey = row.indikator?.id ? String(row.indikator.id) : 'null';
            if (!byStandar[sKey]) byStandar[sKey] = { standar: row.standar || undefined, indikators: {} };
            if (!byStandar[sKey].indikators[iKey]) byStandar[sKey].indikators[iKey] = { indikator: row.indikator || undefined, rows: [] };
            byStandar[sKey].indikators[iKey].rows.push(row);
        });
        return byStandar;
    }, [submissions]);

    // Document preview state
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<DocItem | null>(null);
    const openPreview = (doc: DocItem) => { setPreviewDoc(doc); setPreviewOpen(true); };
    const closePreview = () => { setPreviewOpen(false); setPreviewDoc(null); };
    return (
        <AppLayout
            title={`Auditor Review - ${session?.nama ?? ''}`}
            breadcrumbs={[
                { title: 'Audit Internal', href: '/audit-internal' },
                { title: 'Auditor Review', href: `/audit-internal/${session.id}/auditee-review` },
            ]}
        >
            <div className="space-y-4 p-4 md:p-6">
                <InfoBarAuditor session={session} assignedUnitIds={assigned_unit_ids} auditorName={auditorName} />
                <StatsBarAuditor submissions={submissions} />

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-3 py-2 text-left">Standar / Indikator / Pertanyaan</th>
                                <th className="px-3 py-2 text-left">Dokumen</th>
                                <th className="px-3 py-2 text-left" style={{ width: 150 }}>
                                    Skor (0.1–2.0)
                                </th>
                                <th className="px-3 py-2 text-left" style={{ width: 320 }}>
                                    Komentar
                                </th>
                                <th className="px-3 py-2 text-left" style={{ width: 120 }}>
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groups).map(([sKey, sVal]) => (
                                <React.Fragment key={`standar-${sKey}`}>
                                    <tr className="bg-muted/30">
                                        <td className="px-3 py-2 font-semibold" colSpan={5}>
                                            {sVal.standar?.nama || 'Tanpa Standar'}
                                        </td>
                                    </tr>
                                    {Object.entries(sVal.indikators).map(([iKey, iVal]) => (
                                        <React.Fragment key={`indikator-${sKey}-${iKey}`}>
                                            <tr className="bg-muted/20">
                                                <td className="px-3 py-2 pl-6 font-medium" colSpan={5}>
                                                    {iVal.indikator?.nama || 'Tanpa Indikator'}
                                                </td>
                                            </tr>
                                            {iVal.rows.map((r) => (
                                                <tr key={`q-${r.id}`} className="align-top">
                                                    <td className="px-3 py-2 pl-10">- {r.pertanyaan?.isi}</td>
                                                    <td className="px-3 py-2">
                                                        <div className="flex flex-col gap-1">
                                                            {r.documents?.length ? (
                                                                r.documents.map((d) => (
                                                                    <button
                                                                        key={d.id}
                                                                        className="text-left text-xs text-blue-600 underline hover:text-blue-700"
                                                                        onClick={() => openPreview(d)}
                                                                    >
                                                                        {d.title}
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <span className="text-muted-foreground">Tidak ada dokumen</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            inputMode="decimal"
                                                            step={0.1}
                                                            min={0.1}
                                                            max={2.0}
                                                            value={draft[r.id]?.score ?? ''}
                                                            onChange={(e) => handleChange(r.id, 'score', e.target.value)}
                                                            placeholder="0.1 - 2.0"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Textarea
                                                            value={draft[r.id]?.reviewer_note ?? ''}
                                                            onChange={(e) => handleChange(r.id, 'reviewer_note', e.target.value)}
                                                            placeholder="Catatan reviewer"
                                                            rows={2}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Button size="sm" onClick={() => saveRow(r.id)} disabled={!!saving[r.id]}>
                                                            {saving[r.id] ? 'Menyimpan...' : 'Simpan'}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Preview Modal */}
                <DocsPreviewModal open={previewOpen} onClose={closePreview} doc={previewDoc} />
            </div>
        </AppLayout>
    );
}

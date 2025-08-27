import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import React, { useState } from 'react';
import InfoBarAuditor from './components/InfoBarAuditor';
import StatsBarAuditor from './components/StatsBarAuditor';
import AuditeeReviewTable, { SubmissionRow as TableSubmissionRow } from './components/AuditeeReviewTable';

// Use the exact row type from the table to avoid duplication/mismatch
type SubmissionRow = TableSubmissionRow;

interface AuditorReportItem {
    id: number;
    unit_id: number;
    title?: string;
    notes?: string;
    mime?: string;
    size?: number;
    uploaded_by?: string;
    created_at?: string;
    download_url: string;
}

interface PageProps {
    session: any;
    assigned_unit_ids: number[];
    assigned_units?: { id: number; nama: string }[];
    submissions?: SubmissionRow[];
    auditor_reports?: AuditorReportItem[];
}

export default function AuditeeReviewIndex({ session, assigned_unit_ids, assigned_units = [], submissions = [], auditor_reports = [] }: PageProps) {
    const page = usePage<any>();
    const authUser = (page?.props as any)?.auth?.user;
    const auditorName: string | undefined = authUser?.name;
    const [saving, setSaving] = useState<Record<number, boolean>>({});
    const [draft, setDraft] = useState<Record<number, { score?: string; reviewer_note?: string; outcome_status?: string; special_note?: string }>>(() => {
        const init: Record<number, { score?: string; reviewer_note?: string; outcome_status?: string; special_note?: string }> = {};
        submissions.forEach((s) => {
            if (s.id !== null) {
                init[s.id] = {
                    score: s.review?.score !== undefined && s.review?.score !== null ? String(s.review?.score) : '',
                    reviewer_note: s.review?.reviewer_note || '',
                    outcome_status: s.review?.outcome_status || '',
                    special_note: s.review?.special_note || '',
                };
            }
        });
        return init;
    });

    const handleChange = (
        id: number,
        field: 'score' | 'reviewer_note' | 'outcome_status' | 'special_note',
        value: string,
    ) => {
        setDraft((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    };

    const saveRow = (id: number) => {
        if (id === null || id === undefined) return;
        const payload = draft[id] || {};
        // score comes from radio: '0' | '1' | '2' or ''
        let score: number | null = null;
        if (payload.score !== undefined && payload.score !== '') {
            const n = parseFloat(String(payload.score));
            if (!isNaN(n)) score = n;
        }
        setSaving((prev) => ({ ...prev, [id]: true }));
        router.post(
            `/auditee-submissions/${id}/review`,
            {
                score,
                reviewer_note: payload.reviewer_note || null,
                outcome_status: payload.outcome_status || null,
                special_note: payload.special_note || null,
            },
            {
                preserveScroll: true,
                onFinish: () => setSaving((prev) => ({ ...prev, [id]: false })),
            },
        );
    };

    // Determine unit and submission state
    const unitId: number | undefined = submissions[0]?.unit_id ?? assigned_unit_ids?.[0];
    const reviewableRows = submissions.filter((r) => r.id !== null);
    const isUnitSubmitted: boolean = reviewableRows.length > 0 && reviewableRows.every((r) => !!r.review?.is_submitted);

    const submitUnit = () => {
        if (!unitId) return;
        // Client-side validation: ensure all have score and outcome_status
        const missing = reviewableRows.filter((r) => {
          const s = draft[r.id as number];
          const hasScore = s && s.score !== undefined && s.score !== '';
          const hasStatus = s && s.outcome_status && s.outcome_status !== '';
          return !hasScore || !hasStatus;
        });
        if (missing.length > 0) {
            toast.error(`Tidak bisa submit. Masih ada ${missing.length} pertanyaan yang belum memiliki skor atau status.`);
            return;
        }
        router.post(
            `/audit-internal/${session.id}/auditor-review/submit`,
            { unit_id: unitId },
            {
                preserveScroll: true,
            },
        );
    };

    const unsubmitUnit = () => {
        if (!unitId) return;
        router.post(
            `/audit-internal/${session.id}/auditor-review/unsubmit`,
            { unit_id: unitId },
            {
                preserveScroll: true,
            },
        );
    };

    // Score modal state
    const [scoreModal, setScoreModal] = useState<{ open: boolean; rowId?: number }>(() => ({ open: false }));
    const openScore = (rowId: number) => setScoreModal({ open: true, rowId });
    const closeScore = () => setScoreModal({ open: false });
    const setScore = (val: '0' | '1' | '2') => {
        if (!scoreModal.rowId) return;
        handleChange(scoreModal.rowId, 'score', val);
    };

    // Tabs state: review vs auditor reports
    const [tab, setTab] = useState<'review' | 'reports'>('review');

    // Upload form state for auditor report
    const [reportUnitId, setReportUnitId] = useState<number | ''>(() => assigned_units[0]?.id ?? assigned_unit_ids?.[0] ?? '');
    const [reportTitle, setReportTitle] = useState('');
    const [reportNotes, setReportNotes] = useState('');
    const [reportFile, setReportFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const submitReport = () => {
        if (!reportUnitId || !reportFile) {
            toast.error('Pilih Unit dan File terlebih dahulu');
            return;
        }
        const data: Record<string, any> = {
            unit_id: reportUnitId,
            title: reportTitle || null,
            notes: reportNotes || null,
            file: reportFile,
        };
        setUploading(true);
        router.post(
            `/audit-internal/${session.id}/auditor-reports`,
            data,
            {
                forceFormData: true,
                onFinish: () => setUploading(false),
                onSuccess: () => {
                    setReportTitle('');
                    setReportNotes('');
                    setReportFile(null);
                },
            },
        );
    };

    const deleteReport = (reportId: number) => {
        router.delete(`/audit-internal/${session.id}/auditor-reports/${reportId}`, { preserveScroll: true });
    };

    return (
        <AppLayout
            title={`Auditor Review - ${session?.nama ?? ''}`}
            breadcrumbs={[
                { title: 'Audit Internal', href: '/audit-internal' },
                { title: 'Auditor Review', href: `/audit-internal/${session.id}/auditee-review` },
            ]}
        >
            <div className="space-y-4 p-4 md:p-6">
                <InfoBarAuditor session={session} assignedUnitIds={assigned_unit_ids} auditorName={auditorName} assignedUnits={assigned_units} />
                <StatsBarAuditor submissions={submissions} />

                <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex gap-2">
                        <Button variant={tab === 'review' ? 'default' : 'ghost'} onClick={() => setTab('review')}>Review</Button>
                        <Button variant={tab === 'reports' ? 'default' : 'ghost'} onClick={() => setTab('reports')}>Laporan Auditor</Button>
                    </div>
                    {tab === 'review' && (
                        isUnitSubmitted ? (
                            <Button onClick={unsubmitUnit} variant="destructive">Batalkan Submit</Button>
                        ) : (
                            <Button onClick={submitUnit} variant="default">Submit Review</Button>
                        )
                    )}
                </div>

                {tab === 'review' ? (
                    <AuditeeReviewTable
                        submissions={submissions}
                        draft={draft}
                        saving={saving}
                        isUnitSubmitted={isUnitSubmitted}
                        onChange={handleChange}
                        onSaveRow={saveRow}
                    />
                ) : (
                    <div className="space-y-6">
                        <div className="rounded-lg border p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="unit">Unit</Label>
                                    <select
                                        id="unit"
                                        className="mt-1 block w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                                        value={reportUnitId as any}
                                        onChange={(e) => setReportUnitId(e.target.value ? parseInt(e.target.value) : '')}
                                    >
                                        <option value="">Pilih Unit</option>
                                        {assigned_units.map(u => (
                                            <option key={u.id} value={u.id}>{u.nama}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="title">Judul (opsional)</Label>
                                    <Input id="title" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="Contoh: Laporan Hasil Audit Unit X" />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="notes">Catatan (opsional)</Label>
                                <Textarea id="notes" value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} rows={3} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div>
                                    <Label htmlFor="file">File</Label>
                                    <Input id="file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={(e) => setReportFile(e.target.files?.[0] || null)} />
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={submitReport} disabled={uploading}>
                                        {uploading ? 'Mengunggah...' : 'Unggah Laporan'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border">
                            <div className="p-3 border-b font-medium">Daftar Laporan</div>
                            <div className="divide-y">
                                {auditor_reports.length === 0 && (
                                    <div className="p-4 text-sm text-neutral-500">Belum ada laporan</div>
                                )}
                                {auditor_reports.map((r) => (
                                    <div key={r.id} className="p-3 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">{r.title || 'Laporan Auditor'}</div>
                                            <div className="text-xs text-neutral-500">
                                                {r.uploaded_by ? `Oleh ${r.uploaded_by}` : ''}
                                                {r.size ? ` • ${(r.size / 1024 / 1024).toFixed(2)} MB` : ''}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <a href={r.download_url} className="text-sm underline" target="_blank" rel="noreferrer">Download</a>
                                            <Button variant="destructive" size="sm" onClick={() => deleteReport(r.id)}>Hapus</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

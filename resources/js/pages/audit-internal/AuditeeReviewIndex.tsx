import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import React, { useEffect, useMemo, useState } from 'react';
import InfoBarAuditor from './components/InfoBarAuditor';
import StatsBarAuditor from './components/StatsBarAuditor';
import AuditeeReviewTable, { SubmissionRow as TableSubmissionRow } from './components/AuditeeReviewTable';
import AuditorReportsPanel from './components/AuditorReportsPanel';

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

    // Build unit options from assigned_units; fallback to submissions/assigned_unit_ids if needed
    const unitOptions = useMemo(() => {
        if (assigned_units && assigned_units.length > 0) return assigned_units;
        const idSet = new Set<number>();
        submissions.forEach((s) => { if (s?.unit_id !== undefined && s?.unit_id !== null) idSet.add(s.unit_id); });
        (assigned_unit_ids || []).forEach((id) => idSet.add(id));
        return Array.from(idSet).map((id) => ({ id, nama: `Unit ${id}` }));
    }, [assigned_units, submissions, assigned_unit_ids]);

    // Tabs for units: determine selected unit and filter submissions accordingly
    const [selectedUnitId, setSelectedUnitId] = useState<number | ''>('');
    useEffect(() => {
        if (selectedUnitId === '' && unitOptions.length > 0) {
            setSelectedUnitId(unitOptions[0].id);
        }
    }, [unitOptions, selectedUnitId]);
    const unitSubmissions = submissions.filter((r) => (selectedUnitId ? r.unit_id === selectedUnitId : true));
    // Determine unit and submission state for the selected unit
    const unitId: number | undefined = (selectedUnitId || undefined) as number | undefined;
    const reviewableRows = unitSubmissions.filter((r) => r.id !== null);
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
                <StatsBarAuditor submissions={unitSubmissions} />

                {/* Unit tabs (shown when >=2 units) */}
                {unitOptions && unitOptions.length >= 2 && (
                  <div className="flex flex-wrap gap-2 border-b pb-2">
                    {unitOptions.map((u) => (
                      <Button
                        key={u.id}
                        variant={selectedUnitId === u.id ? 'default' : 'ghost'}
                        onClick={() => setSelectedUnitId(u.id)}
                      >
                        {u.nama || `Unit ${u.id}`}
                      </Button>
                    ))}
                  </div>
                )}

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
                        submissions={unitSubmissions}
                        draft={draft}
                        saving={saving}
                        isUnitSubmitted={isUnitSubmitted}
                        onChange={handleChange}
                        onSaveRow={saveRow}
                    />
                ) : (
                    <AuditorReportsPanel
                        sessionId={session.id}
                        assignedUnits={assigned_units}
                        auditorReports={auditor_reports}
                        selectedUnitId={typeof selectedUnitId === 'number' ? selectedUnitId : undefined}
                    />
                )}
            </div>
        </AppLayout>
    );
}

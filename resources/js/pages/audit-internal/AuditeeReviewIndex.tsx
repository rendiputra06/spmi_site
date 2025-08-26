import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import InfoBarAuditor from './components/InfoBarAuditor';
import StatsBarAuditor from './components/StatsBarAuditor';
import AuditeeReviewTable from './components/AuditeeReviewTable';

interface SubmissionRow {
    id: number;
    unit_id: number;
    standar: { id: number; nama: string } | null;
    indikator: { id: number; nama: string } | null;
    pertanyaan: { id: number; isi: string } | null;
    answer_comment?: string | null;
    documents: any[];
    review: {
        score?: number | string | null;
        reviewer_note?: string | null;
        outcome_status?: string | null;
        special_note?: string | null;
        is_submitted?: boolean | null;
        submitted_at?: string | null;
    } | null;
}

interface PageProps {
    session: any;
    assigned_unit_ids: number[];
    assigned_units?: { id: number; nama: string }[];
    submissions?: SubmissionRow[];
}

export default function AuditeeReviewIndex({ session, assigned_unit_ids, assigned_units = [], submissions = [] }: PageProps) {
    const page = usePage<any>();
    const authUser = (page?.props as any)?.auth?.user;
    const auditorName: string | undefined = authUser?.name;
    const [saving, setSaving] = useState<Record<number, boolean>>({});
    const [draft, setDraft] = useState<Record<number, { score?: string; reviewer_note?: string; outcome_status?: string; special_note?: string }>>(() => {
        const init: Record<number, { score?: string; reviewer_note?: string; outcome_status?: string; special_note?: string }> = {};
        submissions.forEach((s) => {
            init[s.id] = {
                score: s.review?.score !== undefined && s.review?.score !== null ? String(s.review?.score) : '',
                reviewer_note: s.review?.reviewer_note || '',
                outcome_status: s.review?.outcome_status || '',
                special_note: s.review?.special_note || '',
            };
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
    const isUnitSubmitted: boolean = submissions.length > 0 && submissions.every((r) => !!r.review?.is_submitted);

    const submitUnit = () => {
        if (!unitId) return;
        // Client-side validation: ensure all have score and outcome_status
        const missing = submissions.filter((r) => {
            const s = draft[r.id];
            const hasScore = s && s.score !== undefined && s.score !== '';
            const hasStatus = s && s.outcome_status && s.outcome_status !== '';
            return !hasScore || !hasStatus;
        });
        if (missing.length > 0) {
            alert(`Tidak bisa submit. Masih ada ${missing.length} pertanyaan yang belum memiliki skor atau status.`);
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

    // table handled by child component now
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

                <div className="flex items-center justify-between">
                    <div />
                    {isUnitSubmitted ? (
                        <Button onClick={unsubmitUnit} variant="destructive">Batalkan Submit</Button>
                    ) : (
                        <Button onClick={submitUnit} variant="default">Submit Review</Button>
                    )}
                </div>
                <AuditeeReviewTable
                    submissions={submissions}
                    draft={draft}
                    saving={saving}
                    isUnitSubmitted={isUnitSubmitted}
                    onChange={handleChange}
                    onSaveRow={saveRow}
                />
            </div>
        </AppLayout>
    );
}

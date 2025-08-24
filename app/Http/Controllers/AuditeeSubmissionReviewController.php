<?php

namespace App\Http\Controllers;

use App\Models\AuditSession;
use App\Models\AuditSessionUnitAuditor;
use App\Models\AuditeeSubmission;
use App\Models\AuditorReview;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuditeeSubmissionReviewController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request, $sessionId)
    {
        $user = Auth::user();
        $session = AuditSession::with('periode')->findOrFail($sessionId);

        // Units assigned to this auditor for the given session
        $dosenId = optional(optional($user)->dosen)->id;
        $assignedUnitIds = AuditSessionUnitAuditor::whereHas('sessionUnit', function ($q) use ($sessionId) {
                $q->where('audit_session_id', $sessionId);
            })
            ->where('dosen_id', $dosenId)
            ->with('sessionUnit')
            ->get()
            ->pluck('sessionUnit.unit_id')
            ->unique()
            ->values();

        // Load submissions for this session limited to assigned units
        $submissions = AuditeeSubmission::with([
                'standar:id,nama',
                'indikator:id,nama',
                'pertanyaan:id,isi',
                'documents:id,title,mime,size',
                'auditorReview',
            ])
            ->where('audit_session_id', $sessionId)
            ->when($assignedUnitIds->count() > 0, function ($q) use ($assignedUnitIds) {
                $q->whereIn('unit_id', $assignedUnitIds);
            })
            ->orderBy('standar_mutu_id')
            ->orderBy('indikator_id')
            ->orderBy('pertanyaan_id')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'unit_id' => $s->unit_id,
                    'standar' => $s->standar ? ['id' => $s->standar->id, 'nama' => $s->standar->nama] : null,
                    'indikator' => $s->indikator ? ['id' => $s->indikator->id, 'nama' => $s->indikator->nama] : null,
                    'pertanyaan' => $s->pertanyaan ? ['id' => $s->pertanyaan->id, 'isi' => $s->pertanyaan->isi] : null,
                    'documents' => $s->documents->map(function ($d) {
                        return [
                            'id' => $d->id,
                            'title' => $d->title,
                            'mime' => $d->mime,
                            'size' => $d->size,
                            'download_url' => route('documents.download', ['document' => $d->id], false),
                        ];
                    }),
                    'review' => $s->auditorReview ? [
                        'score' => $s->auditorReview->score,
                        'reviewer_note' => $s->auditorReview->reviewer_note,
                    ] : null,
                ];
            });

        return Inertia::render('audit-internal/AuditeeReviewIndex', [
            'session' => $session,
            'assigned_unit_ids' => $assignedUnitIds,
            'submissions' => $submissions,
        ]);
    }

    public function review(Request $request, $submissionId)
    {
        $submission = AuditeeSubmission::findOrFail($submissionId);
        $this->authorize('review', $submission);

        $validated = $request->validate([
            'score' => 'nullable|numeric|min:0.1|max:2.0',
            'reviewer_note' => 'nullable|string',
        ]);

        $review = AuditorReview::updateOrCreate(
            ['auditee_submission_id' => $submission->id],
            [
                'score' => isset($validated['score']) ? round((float)$validated['score'], 1) : null,
                'reviewer_note' => $validated['reviewer_note'] ?? null,
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
            ]
        );

        return back()->with('status', 'Review disimpan');
    }
}

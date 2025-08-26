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
        $canManageAll = method_exists($user, 'hasRole') && $user->hasRole('admin');
        $assignedUnitIds = AuditSessionUnitAuditor::whereHas('sessionUnit', function ($q) use ($sessionId) {
                $q->where('audit_session_id', $sessionId);
            })
            ->where('dosen_id', $dosenId)
            ->with('sessionUnit')
            ->get()
            ->pluck('sessionUnit.unit_id')
            ->unique()
            ->values();

        // Load submissions for this session limited to assigned units (or all if allowed)
        $query = AuditeeSubmission::with([
                'standar:id,nama',
                'indikator:id,nama',
                'pertanyaan:id,isi',
                'documents:id,title,mime,size',
                'auditorReview',
            ])
            ->where('audit_session_id', $sessionId)
            ->orderBy('standar_mutu_id')
            ->orderBy('indikator_id')
            ->orderBy('pertanyaan_id');

        if (!$canManageAll) {
            if ($assignedUnitIds->count() > 0) {
                $query->whereIn('unit_id', $assignedUnitIds);
            } else {
                // No assignments for this auditor -> no results
                $query->whereRaw('1=0');
            }
        }

        $submissions = $query->get()
            ->map(function ($s) {
                return [
                    'unit_id' => $s->unit_id,
                    'id' => $s->id,
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
                        'outcome_status' => $s->auditorReview->outcome_status,
                        'special_note' => $s->auditorReview->special_note,
                        'is_submitted' => $s->auditorReview->is_submitted,
                        'submitted_at' => optional($s->auditorReview->submitted_at)->toIso8601String(),
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
            'score' => 'sometimes|nullable|in:0,1,2',
            'reviewer_note' => 'nullable|string',
            'outcome_status' => 'nullable|in:positif,negatif_observasi,negatif_minor,negatif_mayor',
            'special_note' => 'nullable|string',
        ]);

        $payload = [
            'score' => array_key_exists('score', $validated) ? ($validated['score'] !== null ? (float)$validated['score'] : null) : null,
            'reviewer_note' => $validated['reviewer_note'] ?? null,
            'outcome_status' => $validated['outcome_status'] ?? null,
            'special_note' => $validated['special_note'] ?? null,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ];

        $review = AuditorReview::updateOrCreate(
            ['auditee_submission_id' => $submission->id],
            $payload
        );

        return back()->with('success', 'Review disimpan');
    }

    public function submit(Request $request, $sessionId)
    {
        $session = AuditSession::with('units')->findOrFail($sessionId);
        $user = Auth::user();
        $auditor = optional($user)->auditorAssignment; // may not exist; fallback to relation via AuditSessionUnitAuditor

        // Determine allowed unit IDs for this auditor in this session
        $assignedUnitIds = \App\Models\AuditSessionUnitAuditor::with(['sessionUnit','dosen'])
            ->whereHas('sessionUnit', function ($q) use ($session) {
                $q->where('audit_session_id', $session->id);
            })
            ->whereHas('dosen', function ($q) {
                $q->where('user_id', Auth::id());
            })
            ->get()
            ->pluck('sessionUnit.unit_id')
            ->unique()
            ->values();

        $data = $request->validate([
            'unit_id' => 'required|integer',
        ]);

        $unitId = (int) $data['unit_id'];
        if (!$assignedUnitIds->contains($unitId) && !optional($user)->hasRole('admin')) {
            abort(403, 'Anda tidak ditugaskan pada unit ini.');
        }

        $submissionIds = \App\Models\AuditeeSubmission::where('audit_session_id', $session->id)
            ->where('unit_id', $unitId)
            ->pluck('id');

        if ($submissionIds->isEmpty()) {
            return back()->with('success', 'Tidak ada review untuk disubmit');
        }

        // Block submit if any review missing score or outcome_status (auditor-centric check)
        $total = $submissionIds->count();
        $completed = \App\Models\AuditorReview::whereIn('auditee_submission_id', $submissionIds)
            ->whereNotNull('score')
            ->whereNotNull('outcome_status')
            ->count();
        $missing = max(0, $total - $completed);
        if ($missing > 0) {
            return back()->withErrors([
                'submit' => "Tidak bisa submit. Masih ada ${missing} pertanyaan yang belum memiliki skor atau status.",
            ]);
        }

        \App\Models\AuditorReview::whereIn('auditee_submission_id', $submissionIds)
            ->update([
                'is_submitted' => true,
                'submitted_at' => now(),
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
            ]);

        return back()->with('success', 'Review auditor untuk unit berhasil disubmit');
    }

    public function unsubmit(Request $request, $sessionId)
    {
        $session = AuditSession::with('units')->findOrFail($sessionId);
        $user = Auth::user();

        // Determine allowed unit IDs for this auditor in this session
        $assignedUnitIds = \App\Models\AuditSessionUnitAuditor::with(['sessionUnit','dosen'])
            ->whereHas('sessionUnit', function ($q) use ($session) {
                $q->where('audit_session_id', $session->id);
            })
            ->whereHas('dosen', function ($q) {
                $q->where('user_id', Auth::id());
            })
            ->get()
            ->pluck('sessionUnit.unit_id')
            ->unique()
            ->values();

        $data = $request->validate([
            'unit_id' => 'required|integer',
        ]);

        $unitId = (int) $data['unit_id'];
        if (!$assignedUnitIds->contains($unitId) && !optional($user)->hasRole('admin')) {
            abort(403, 'Anda tidak ditugaskan pada unit ini.');
        }

        $submissionIds = \App\Models\AuditeeSubmission::where('audit_session_id', $session->id)
            ->where('unit_id', $unitId)
            ->pluck('id');

        if ($submissionIds->isEmpty()) {
            return back()->with('success', 'Tidak ada review untuk diubah');
        }

        // Only unsubmit those currently submitted
        \App\Models\AuditorReview::whereIn('auditee_submission_id', $submissionIds)
            ->where('is_submitted', true)
            ->update([
                'is_submitted' => false,
                'submitted_at' => null,
            ]);

        return back()->with('success', 'Submit review auditor untuk unit telah dibatalkan');
    }
}

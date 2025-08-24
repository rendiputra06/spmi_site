<?php

namespace App\Http\Controllers;

use App\Models\AuditSession;
use App\Models\AuditSessionUnit;
use App\Models\AuditeeSubmission;
use App\Models\Indikator;
use App\Models\Pertanyaan;
use App\Models\StandarMutu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuditeeSubmissionController extends Controller
{
    // TODO: enforce policies/permissions (auditee-submission-*)

    public function index(Request $request, $sessionId)
    {
        $session = AuditSession::with('periode')->findOrFail($sessionId);
        $user = Auth::user();
        $userUnitId = optional(optional($user)->dosen)->unit_id;

        // Resolve unit for current user by assignment; fallback to first if not found
        $sessionUnit = null;
        if ($userUnitId) {
            $sessionUnit = AuditSessionUnit::with('auditors.dosen.user','unit')
                ->where('audit_session_id', $session->id)
                ->where('unit_id', $userUnitId)
                ->first();
        }
        if (!$sessionUnit) {
            $sessionUnit = AuditSessionUnit::with('auditors.dosen.user','unit')
                ->where('audit_session_id', $session->id)
                ->first();
        }
        if (!$sessionUnit) {
            return Inertia::render('audit-internal/AuditeeSubmissionsIndex', [
                'session' => $session,
                'unit' => null,
                'standars' => [],
                'submissions' => [],
                'message' => 'Belum ada unit terdaftar pada sesi ini.'
            ]);
        }

        // Get Standar assigned to session
        $standarIds = $session->standars()->pluck('standar_id');
        $standars = StandarMutu::with(['indikator.pertanyaan'])
            ->whereIn('id', $standarIds)
            ->orderBy('kode')
            ->get();

        // Fetch existing submissions for this session+unit
        $subs = AuditeeSubmission::withCount('documents')
            ->where('audit_session_id', $session->id)
            ->where('unit_id', $sessionUnit->unit_id)
            ->get();

        $submissionsByPertanyaan = $subs->keyBy('pertanyaan_id')->map(function ($s) {
            return [
                'id' => $s->id,
                'status' => $s->status,
                'doc_count' => $s->documents_count,
                'submitted_at' => $s->submitted_at,
            ];
        });

        return Inertia::render('audit-internal/AuditeeSubmissionsIndex', [
            'session' => $session,
            'unit' => $sessionUnit->unit, // requires relation on model
            'standars' => $standars,
            'submissions' => $submissionsByPertanyaan,
            'auditors' => $sessionUnit->auditors->map(function ($a) {
                $user = optional($a->dosen)->user;
                return [
                    'id' => optional($user)->id ?? optional($a->dosen)->user_id ?? $a->id,
                    'name' => optional($user)->name ?? optional($a->dosen)->nama,
                    'email' => optional($user)->email ?? optional($a->dosen)->email,
                ];
            }),
            'auditee' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'unit_id' => $userUnitId,
            ] : null,
        ]);
    }

    public function upsert(Request $request, $sessionId)
    {
        $data = $request->validate([
            'pertanyaan_id' => 'required|exists:pertanyaan,id',
            'note' => 'nullable|string',
        ]);

        $session = AuditSession::findOrFail($sessionId);
        $sessionUnit = AuditSessionUnit::where('audit_session_id', $session->id)->firstOrFail();

        $pertanyaan = Pertanyaan::with('indikator')->findOrFail($data['pertanyaan_id']);
        $indikator = $pertanyaan->indikator;
        $standarId = $indikator->standar_id;

        $submission = AuditeeSubmission::updateOrCreate(
            [
                'audit_session_id' => $session->id,
                'unit_id' => $sessionUnit->unit_id,
                'pertanyaan_id' => $pertanyaan->id,
            ],
            [
                'standar_mutu_id' => $standarId,
                'indikator_id' => $indikator->id,
                'note' => $data['note'] ?? null,
                'status' => 'draft',
            ]
        );

        return back()->with('status', 'Tersimpan');
    }

    public function attachDocuments(Request $request, $submissionId)
    {
        $data = $request->validate([
            'document_ids' => 'required|array',
            'document_ids.*' => 'exists:documents,id',
        ]);

        $submission = AuditeeSubmission::findOrFail($submissionId);
        $submission->documents()->syncWithoutDetaching($data['document_ids']);

        return back()->with('status', 'Dokumen ditautkan');
    }

    public function submit(Request $request, $sessionId)
    {
        $session = AuditSession::findOrFail($sessionId);
        $userUnitId = optional(optional(Auth::user())->dosen)->unit_id;
        $sessionUnit = AuditSessionUnit::where('audit_session_id', $session->id)
            ->when($userUnitId, function ($q) use ($userUnitId) { $q->where('unit_id', $userUnitId); })
            ->firstOrFail();

        $userId = Auth::id();
        $now = now();

        AuditeeSubmission::where('audit_session_id', $session->id)
            ->where('unit_id', $sessionUnit->unit_id)
            ->update([
                'status' => 'submitted',
                'submitted_by' => $userId,
                'submitted_at' => $now,
            ]);

        return back()->with('status', 'Jawaban berhasil disubmit');
    }

    // Return selected documents for a submission as JSON
    public function documents($submissionId)
    {
        $submission = AuditeeSubmission::with(['documents' => function ($q) {
            $q->select('documents.id', 'title', 'size', 'mime');
        }])->findOrFail($submissionId);

        $docs = $submission->documents->map(function ($d) {
            return [
                'id' => $d->id,
                'title' => $d->title,
                'size' => $d->size,
                'mime' => $d->mime,
                'download_url' => route('documents.download', ['document' => $d->id]),
            ];
        });

        return response()->json(['documents' => $docs]);
    }

    // Detach documents from a submission
    public function detachDocuments(Request $request, $submissionId)
    {
        $submission = AuditeeSubmission::findOrFail($submissionId);
        $validated = $request->validate([
            'document_ids' => 'required|array|min:1',
            'document_ids.*' => 'integer|exists:documents,id',
        ]);
        $ids = $validated['document_ids'];
        $submission->documents()->detach($ids);
        return back()->with('status', 'Dokumen dihapus dari jawaban');
    }
}

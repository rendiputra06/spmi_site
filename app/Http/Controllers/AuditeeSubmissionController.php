<?php

namespace App\Http\Controllers;

use App\Models\AuditSession;
use App\Models\AuditSessionUnit;
use App\Models\AuditeeSubmission;
use App\Models\Indikator;
use App\Models\Pertanyaan;
use App\Models\StandarMutu;
use App\Models\Document;
use Illuminate\Support\Facades\Storage;
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
                'answer_comment' => $s->answer_comment,
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
            // Require non-empty when field is present, but allow absence (e.g., when creating submission for picking documents)
            'answer_comment' => 'sometimes|required|string',
        ]);

        $session = AuditSession::findOrFail($sessionId);
        $userUnitId = optional(optional(Auth::user())->dosen)->unit_id;
        $sessionUnit = AuditSessionUnit::where('audit_session_id', $session->id)
            ->when($userUnitId, function ($q) use ($userUnitId) { $q->where('unit_id', $userUnitId); })
            ->firstOrFail();

        $pertanyaan = Pertanyaan::with('indikator')->findOrFail($data['pertanyaan_id']);
        $indikator = $pertanyaan->indikator;
        $standarId = $indikator->standar_id;

        $attributes = [
            'standar_mutu_id' => $standarId,
            'indikator_id' => $indikator->id,
            'note' => $data['note'] ?? null,
            'status' => 'draft',
        ];
        if (array_key_exists('answer_comment', $data)) {
            $attributes['answer_comment'] = $data['answer_comment'];
        }

        $submission = AuditeeSubmission::updateOrCreate(
            [
                'audit_session_id' => $session->id,
                'unit_id' => $sessionUnit->unit_id,
                'pertanyaan_id' => $pertanyaan->id,
            ],
            $attributes
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

        // Get all pertanyaan in scope of this session's standars
        $standarIds = $session->standars()->pluck('standar_id');
        $indikatorIds = Indikator::whereIn('standar_id', $standarIds)->pluck('id');
        $allPertanyaanIds = Pertanyaan::whereIn('indikator_id', $indikatorIds)
            ->pluck('id')
            ->toArray();

        // Load submissions with document count
        $subs = AuditeeSubmission::withCount('documents')
            ->where('audit_session_id', $session->id)
            ->where('unit_id', $sessionUnit->unit_id)
            ->get()
            ->keyBy('pertanyaan_id');

        $missingDocs = 0;
        $missingComments = 0;
        foreach ($allPertanyaanIds as $pid) {
            $s = $subs->get($pid);
            if (!$s || ($s->documents_count ?? 0) === 0) {
                $missingDocs++;
            }
            $comment = optional($s)->answer_comment;
            if (!$s || is_null($comment) || trim($comment) === '') {
                $missingComments++;
            }
        }

        if ($missingDocs > 0 || $missingComments > 0) {
            $msg = [];
            if ($missingDocs > 0) { $msg[] = "$missingDocs pertanyaan tanpa dokumen"; }
            if ($missingComments > 0) { $msg[] = "$missingComments pertanyaan tanpa narasi"; }
            return back()->with('status', 'Gagal submit: '.implode(', ', $msg));
        }

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

    /**
     * Upload a new document and attach it to the given submission.
     */
    public function uploadAndAttach(Request $request, $submissionId)
    {
        $submission = AuditeeSubmission::findOrFail($submissionId);

        $user = Auth::user();
        $canManageAll = method_exists($user, 'hasRole') && $user->hasRole('admin');
        $userUnitId = optional(optional($user)->dosen)->unit_id;

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'status' => 'nullable|in:draft,published,archived',
            'unit_id' => 'nullable|exists:units,id',
            'file' => 'required|file|max:51200|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,png,jpg,jpeg',
        ]);

        $unitId = $canManageAll ? ($validated['unit_id'] ?? $userUnitId) : $userUnitId;
        if (!$unitId) {
            return back()->withErrors(['unit_id' => 'Unit tidak ditemukan untuk pengguna ini.']);
        }

        $document = Document::create([
            'unit_id' => $unitId,
            'uploaded_by' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'file_path' => '',
        ]);

        $media = $document
            ->addMedia($request->file('file'))
            ->toMediaCollection('documents');

        $disk = Storage::disk($media->disk);
        $diskRoot = $disk->path('');
        $relativePath = ltrim(str_replace($diskRoot, '', $media->getPath()), '/');
        $document->file_path = $relativePath;
        $document->mime = $media->mime_type;
        $document->size = $media->size;
        $document->save();

        // attach to submission
        $submission->documents()->syncWithoutDetaching([$document->id]);

        return back()->with('status', 'Dokumen diunggah dan ditautkan');
    }
}

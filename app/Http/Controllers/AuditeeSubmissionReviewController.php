<?php

namespace App\Http\Controllers;

use App\Models\AuditSession;
use App\Models\AuditSessionUnitAuditor;
use App\Models\AuditeeSubmission;
use App\Models\AuditorReview;
use App\Models\AuditSessionAuditorReport;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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

        // Also load unit names for display
        $assignedUnits = [];
        if ($assignedUnitIds->count() > 0) {
            $assignedUnits = \App\Models\Unit::whereIn('id', $assignedUnitIds)
                ->select('id', 'nama')
                ->orderBy('nama')
                ->get()
                ->map(function ($u) {
                    return ['id' => $u->id, 'nama' => $u->nama];
                });
        }

        // Load all pertanyaan in scope of this session's standars
        $standarIds = $session->standars()->pluck('standar_id');
        $indikatorIds = \App\Models\Indikator::whereIn('standar_id', $standarIds)->pluck('id');
        $pertanyaans = \App\Models\Pertanyaan::whereIn('indikator_id', $indikatorIds)
            ->select('id', 'isi', 'indikator_id')
            ->orderBy('indikator_id')
            ->orderBy('id')
            ->get();

        // Preload indikator and standars to avoid N+1 when creating placeholders
        $indikatorsMap = \App\Models\Indikator::whereIn('id', $indikatorIds)
            ->get(['id', 'nama', 'standar_id'])
            ->keyBy('id');
        $standarIdsFromInd = $indikatorsMap->pluck('standar_id')->unique()->filter();
        $standarsMap = \App\Models\StandarMutu::whereIn('id', $standarIdsFromInd)
            ->get(['id', 'nama'])
            ->keyBy('id');

        // Determine units to include: assigned units for auditor; if admin, include all units in session
        $targetUnitIds = $canManageAll
            ? \App\Models\AuditSessionUnit::where('audit_session_id', $sessionId)->pluck('unit_id')
            : $assignedUnitIds;

        // Fetch existing submissions for these units
        $existingSubs = AuditeeSubmission::with([
                'standar:id,nama',
                'indikator:id,nama',
                'pertanyaan:id,isi',
                'documents:id,title,mime,size',
                'auditorReview',
            ])
            ->where('audit_session_id', $sessionId)
            ->when($targetUnitIds->count() > 0, function ($q) use ($targetUnitIds) { $q->whereIn('unit_id', $targetUnitIds); }, function ($q) {
                // No assignments for this auditor -> no results
                $q->whereRaw('1=0');
            })
            ->get();

        // Index existing submissions by key "unit_id:pertanyaan_id"
        $existingByKey = $existingSubs->keyBy(function ($s) {
            return $s->unit_id . ':' . $s->pertanyaan_id;
        });

        // Build a complete list across units x pertanyaan
        $submissions = collect();
        foreach ($targetUnitIds as $unitId) {
            foreach ($pertanyaans as $p) {
                $key = $unitId . ':' . $p->id;
                if ($existingByKey->has($key)) {
                    $s = $existingByKey->get($key);
                    $submissions->push([
                        'unit_id' => $s->unit_id,
                        'id' => $s->id,
                        'standar' => $s->standar ? ['id' => $s->standar->id, 'nama' => $s->standar->nama] : null,
                        'indikator' => $s->indikator ? ['id' => $s->indikator->id, 'nama' => $s->indikator->nama] : null,
                        'pertanyaan' => $s->pertanyaan ? ['id' => $s->pertanyaan->id, 'isi' => $s->pertanyaan->isi] : ['id' => $p->id, 'isi' => $p->isi],
                        'answer_comment' => $s->answer_comment,
                        'documents' => $s->documents->map(function ($d) {
                            return [
                                'id' => $d->id,
                                'title' => $d->title,
                                'mime' => $d->mime,
                                'size' => $d->size,
                                'download_url' => route('documents.download', ['document' => $d->id], false),
                            ];
                        })->values(),
                        'review' => $s->auditorReview ? [
                            'score' => $s->auditorReview->score,
                            'reviewer_note' => $s->auditorReview->reviewer_note,
                            'outcome_status' => $s->auditorReview->outcome_status,
                            'special_note' => $s->auditorReview->special_note,
                            'is_submitted' => $s->auditorReview->is_submitted,
                            'submitted_at' => optional($s->auditorReview->submitted_at)->toIso8601String(),
                        ] : null,
                    ]);
                } else {
                    // Placeholder when submission not yet created by auditee
                    $indikator = $indikatorsMap->get($p->indikator_id);
                    $standar = $indikator ? $standarsMap->get($indikator->standar_id) : null;
                    $submissions->push([
                        'unit_id' => $unitId,
                        'id' => null,
                        'standar' => $standar ? ['id' => $standar->id, 'nama' => $standar->nama] : null,
                        'indikator' => $indikator ? ['id' => $indikator->id, 'nama' => $indikator->nama] : null,
                        'pertanyaan' => ['id' => $p->id, 'isi' => $p->isi],
                        'answer_comment' => null,
                        'documents' => [],
                        'review' => null,
                    ]);
                }
            }
        }

        // Sort by standar -> indikator -> pertanyaan for consistent display
        $submissions = $submissions->sortBy([
            ['standar.id', 'asc'],
            ['indikator.id', 'asc'],
            ['pertanyaan.id', 'asc'],
        ])->values();

        // Load existing auditor reports limited to target units within this session
        $auditorReports = AuditSessionAuditorReport::query()
            ->where('audit_session_id', $sessionId)
            ->when($targetUnitIds->count() > 0, function ($q) use ($targetUnitIds) { $q->whereIn('unit_id', $targetUnitIds); }, function ($q) {
                $q->whereRaw('1=0');
            })
            ->latest()
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'unit_id' => $r->unit_id,
                    'title' => $r->title,
                    'notes' => $r->notes,
                    'mime' => $r->mime,
                    'size' => $r->size,
                    'uploaded_by' => optional($r->uploader)->name,
                    'created_at' => optional($r->created_at)->toIso8601String(),
                    'download_url' => route('auditor-reports.download', ['report' => $r->id]),
                ];
            });

        return Inertia::render('audit-internal/AuditeeReviewIndex', [
            'session' => $session,
            'assigned_unit_ids' => $assignedUnitIds,
            'assigned_units' => $assignedUnits,
            'submissions' => $submissions,
            'auditor_reports' => $auditorReports,
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

    public function storeReport(Request $request, $sessionId)
    {
        $session = AuditSession::findOrFail($sessionId);
        $user = Auth::user();

        // Determine allowed unit IDs for this auditor in this session
        $assignedUnitIds = AuditSessionUnitAuditor::with(['sessionUnit','dosen'])
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

        $validated = $request->validate([
            'unit_id' => 'required|integer',
            'title' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'file' => 'required|file|max:51200|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx',
        ]);

        $unitId = (int) $validated['unit_id'];
        if (!$assignedUnitIds->contains($unitId) && !optional($user)->hasRole('admin')) {
            abort(403, 'Anda tidak ditugaskan pada unit ini.');
        }

        $report = AuditSessionAuditorReport::create([
            'audit_session_id' => $session->id,
            'unit_id' => $unitId,
            'uploaded_by' => $user->id,
            'title' => $validated['title'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'file_path' => '',
        ]);

        // Attach media and sync legacy fields
        $media = $report->addMedia($request->file('file'))->toMediaCollection('auditor_reports');
        $disk = Storage::disk($media->disk);
        $diskRoot = $disk->path('');
        $relativePath = ltrim(str_replace($diskRoot, '', $media->getPath()), '/');
        $report->file_path = $relativePath;
        $report->mime = $media->mime_type;
        $report->size = $media->size;
        $report->save();

        return back()->with('success', 'Laporan auditor berhasil diunggah');
    }

    public function destroyReport(Request $request, $sessionId, AuditSessionAuditorReport $report)
    {
        $session = AuditSession::findOrFail($sessionId);
        $user = Auth::user();

        if ($report->audit_session_id !== (int) $session->id) {
            abort(404);
        }

        // Determine allowed unit IDs for this auditor in this session
        $assignedUnitIds = AuditSessionUnitAuditor::with(['sessionUnit','dosen'])
            ->whereHas('sessionUnit', function ($q) use ($session) {
                $q->where('audit_session_id', $session->id);
            })
            ->whereHas('dosen', function ($q) {
                $q->where('user_id', Auth::id());
            })
            ->get()
            ->pluck('sessionUnit.unit_id');

        $canDelete = optional($user)->hasRole('admin') || ($assignedUnitIds->contains($report->unit_id) && $report->uploaded_by === $user->id);
        if (!$canDelete) {
            abort(403);
        }

        if ($media = $report->getFirstMedia('auditor_reports')) {
            $media->delete();
        }
        $report->delete();

        return back()->with('success', 'Laporan auditor dihapus');
    }

    public function downloadReport(AuditSessionAuditorReport $report)
    {
        // Simple authorization: must be assigned auditor of the session or admin
        $user = Auth::user();
        $assignedUnitIds = AuditSessionUnitAuditor::with('sessionUnit')
            ->whereHas('sessionUnit', function ($q) use ($report) {
                $q->where('audit_session_id', $report->audit_session_id);
            })
            ->whereHas('dosen', function ($q) {
                $q->where('user_id', Auth::id());
            })
            ->get()
            ->pluck('sessionUnit.unit_id');

        if (!optional($user)->hasRole('admin') && !$assignedUnitIds->contains($report->unit_id)) {
            abort(403);
        }

        $media = $report->getFirstMedia('auditor_reports');
        $inline = request()->boolean('inline');
        if ($media) {
            $ext = pathinfo($media->file_name, PATHINFO_EXTENSION);
            $baseTitle = $report->title ?: 'laporan-auditor';
            $filename = Str::slug($baseTitle) . ($ext ? ".{$ext}" : '');
            $disk = Storage::disk($media->disk);
            $diskRoot = $disk->path('');
            $relativePath = ltrim(str_replace($diskRoot, '', $media->getPath()), '/');
            if ($inline) {
                if ($media->disk === 'public' || $media->disk === 'local') {
                    return response()->file($media->getPath(), [
                        'Content-Type' => $media->mime_type,
                        'Content-Disposition' => 'inline; filename="' . $filename . '"',
                    ]);
                }
                $stream = $disk->readStream($relativePath);
                return response()->stream(function () use ($stream) {
                    fpassthru($stream);
                    if (is_resource($stream)) { fclose($stream); }
                }, 200, [
                    'Content-Type' => $media->mime_type,
                    'Content-Disposition' => 'inline; filename="' . $filename . '"',
                ]);
            } else {
                if (method_exists($disk, 'download')) {
                    return $disk->download($relativePath, $filename);
                }
                $stream = $disk->readStream($relativePath);
                return response()->streamDownload(function () use ($stream) {
                    fpassthru($stream);
                    if (is_resource($stream)) { fclose($stream); }
                }, $filename, [
                    'Content-Type' => $media->mime_type,
                ]);
            }
        }

        if (!$report->file_path || !Storage::disk('public')->exists($report->file_path)) {
            abort(404);
        }
        $ext = pathinfo($report->file_path, PATHINFO_EXTENSION);
        $baseTitle = $report->title ?: 'laporan-auditor';
        $filename = Str::slug($baseTitle) . ($ext ? ".{$ext}" : '');
        if ($inline) {
            return response()->file(Storage::disk('public')->path($report->file_path), [
                'Content-Type' => $report->mime ?? 'application/octet-stream',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);
        }
        return Storage::disk('public')->download($report->file_path, $filename);
    }
}

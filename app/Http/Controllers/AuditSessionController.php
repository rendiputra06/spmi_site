<?php

namespace App\Http\Controllers;

use App\Models\AuditSession;
use App\Models\Periode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditSessionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = AuditSession::query()->with('periode');
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('kode', 'like', "%$search%")
                  ->orWhere('nama', 'like', "%$search%")
                  ->orWhere('deskripsi', 'like', "%$search%");
            });
        }
        // Role-based visibility: admin sees all; others filtered by assignments
        $user = $request->user();
        $isManage = $user?->can('audit-internal-manage') ?? false;
        $canRespond = $user?->can('auditee-submission-view') ?? false;
        $canReview = $user?->can('auditee-submission-review') ?? false;

        if (!$isManage) {
            // Determine user's unit (adjust if your app stores unit differently)
            $unitId = $user?->dosen?->unit_id;

            $query->where(function($q) use ($user, $unitId) {
                // Auditor assignment: match via dosen_id of current user
                $dosenId = optional($user->dosen)->id;
                if ($dosenId) {
                    $q->whereHas('units.auditors', function ($qa) use ($dosenId) {
                        $qa->where('dosen_id', $dosenId);
                    });
                }

                // Auditee by unit assignment: session units matching user's unit
                if ($unitId) {
                    $q->orWhereHas('units', function ($qu) use ($unitId) {
                        $qu->where('unit_id', $unitId);
                    });
                }
            });

            // Only show active sessions
            $query->where('status', true)
                  ->whereDate('tanggal_mulai', '<=', now())
                  ->whereDate('tanggal_selesai', '>=', now());
        }

        $sessions = $query->orderByDesc('tanggal_mulai')->paginate(10);
        $periodeOptions = Periode::orderByDesc('mulai')->get(['id','nama','mulai','selesai']);

        return Inertia::render('audit-internal/Index', [
            'sessions' => $sessions,
            'search' => $search,
            'periode_options' => $periodeOptions,
            'can' => [
                'manage' => $isManage,
                'respond' => $canRespond,
                'review' => $canReview,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kode' => 'required|string|unique:audit_sessions,kode',
            'nama' => 'required|string',
            'periode_id' => 'nullable|exists:periodes,id',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'deskripsi' => 'nullable|string',
            'status' => 'boolean',
            'is_locked' => 'boolean',
        ]);
        $session = AuditSession::create($data);
        return redirect()->route('audit-internal.index');
    }

    public function update(Request $request, $id)
    {
        $s = AuditSession::findOrFail($id);
        $data = $request->validate([
            'kode' => 'required|string|unique:audit_sessions,kode,' . $s->id,
            'nama' => 'required|string',
            'periode_id' => 'nullable|exists:periodes,id',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'deskripsi' => 'nullable|string',
            'status' => 'boolean',
            'is_locked' => 'boolean',
        ]);
        $s->update($data);
        return redirect()->route('audit-internal.index');
    }

    public function destroy($id)
    {
        AuditSession::findOrFail($id)->delete();
        return redirect()->route('audit-internal.index');
    }
}

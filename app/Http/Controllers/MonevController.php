<?php

namespace App\Http\Controllers;

use App\Models\Dosen;
use App\Models\MataKuliah;
use App\Models\MonevEvaluation;
use App\Models\MonevSession;
use App\Models\MonevSessionProdi;
use App\Models\MonevTemplate;
use App\Models\Periode;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MonevController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $filterPeriode = $request->integer('periode_id');
        $filterTahun = $request->integer('tahun');
        $perPage = (int) $request->input('per_page', 10);
        $activeOnly = (bool) $request->boolean('active_only');

        $query = MonevSession::with(['periode', 'prodis.unit', 'prodis.gjm', 'template'])
            ->orderByDesc('created_at');

        if ($search) {
            $s = "%{$search}%";
            $query->where(function ($q) use ($s) {
                $q->where('nama', 'like', $s)
                  ->orWhereHas('periode', function ($qp) use ($s) {
                      $qp->where('kode', 'like', $s)->orWhere('nama', 'like', $s);
                  });
            });
        }
        if ($filterPeriode) {
            $query->where('periode_id', $filterPeriode);
        }
        if ($filterTahun) {
            $query->where('tahun', $filterTahun);
        }
        if ($activeOnly) {
            $today = date('Y-m-d');
            $query->whereDate('tanggal_mulai', '<=', $today)
                  ->whereDate('tanggal_selesai', '>=', $today);
        }

        // Restrict for GJM: only sessions where user is assigned as GJM in at least one prodi
        $user = $request->user();
        if ($user && ($user->hasRole('gjm') ?? false)) {
            $dosenId = optional($user->dosen)->id;
            if ($dosenId) {
                $query->whereHas('prodis', function($q) use ($dosenId) {
                    $q->where('gjm_dosen_id', $dosenId);
                });
            } else {
                $query->whereRaw('1=0');
            }
        }

        $sessions = $query->paginate($perPage)->appends($request->only(['search','periode_id','tahun','per_page']));

        $periodes = Periode::orderByDesc('is_active')->orderByDesc('mulai')->get(['id','kode','nama']);
        // only show units with tipe 'prodi'
        $units = Unit::where('tipe', 'prodi')->orderBy('nama')->get(['id','nama']);
        $dosens = Dosen::orderBy('nama')->get(['id','nidn','nama']);
        $templates = MonevTemplate::orderBy('nama')->get(['id','nama']);

        return Inertia::render('monev/Index', [
            'sessions' => $sessions,
            'periodes' => $periodes,
            'units' => $units,
            'dosens' => $dosens,
            'search' => $search,
            'filters' => [
                'periode_id' => $filterPeriode,
                'tahun' => $filterTahun,
                'per_page' => $perPage,
                'active_only' => $activeOnly,
            ],
            'templates' => $templates,
            'isGjm' => (bool) ($user && ($user->hasRole('gjm') ?? false)),
        ]);
    }

    public function detail($id)
    {
        $session = MonevSession::with(['prodis.unit','template'])->findOrFail($id);
        // Authorization: admin can view; GJM can view only if assigned
        $user = request()->user();
        if (!($user && ($user->can('monev-manage') || ($user->hasRole('gjm') && $session->prodis->pluck('gjm_dosen_id')->contains(optional($user->dosen)->id))))) {
            abort(403);
        }
        $unitIds = $session->prodis->pluck('unit_id')->unique()->values();

        $units = Unit::whereIn('id', $unitIds)->orderBy('nama')->get(['id','nama']);
        $courses = MataKuliah::whereIn('unit_id', $unitIds)->orderBy('nama')->get(['id','nama','unit_id']);
        $dosens = Dosen::whereIn('unit_id', $unitIds)->orderBy('nama')->get(['id','nama','nidn','unit_id']);
        $evaluations = MonevEvaluation::with(['unit','mataKuliah','dosen'])
            ->where('monev_session_id', $session->id)
            ->orderByDesc('id')
            ->get();

        return Inertia::render('monev/Detail', [
            'session' => $session,
            'units' => $units,
            'courses' => $courses,
            'dosens' => $dosens,
            'evaluations' => $evaluations,
            'isGjm' => (bool) ($user && ($user->hasRole('gjm') ?? false)),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->can('monev-manage'), 403);
        $data = $this->validatePayload($request);

        $session = MonevSession::create([
            'nama' => $data['nama'],
            'periode_id' => $data['periode_id'],
            'tahun' => $data['tahun'],
            'tanggal_mulai' => $data['tanggal_mulai'],
            'tanggal_selesai' => $data['tanggal_selesai'],
            'template_id' => $data['template_id'] ?? null,
        ]);

        $this->syncProdis($session, $data['prodis'] ?? []);

        return redirect()->route('monev.index');
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        abort_unless($user && $user->can('monev-manage'), 403);
        $session = MonevSession::findOrFail($id);
        $data = $this->validatePayload($request, $session->id);

        $session->update([
            'nama' => $data['nama'],
            'periode_id' => $data['periode_id'],
            'tahun' => $data['tahun'],
            'tanggal_mulai' => $data['tanggal_mulai'],
            'tanggal_selesai' => $data['tanggal_selesai'],
            'template_id' => $data['template_id'] ?? null,
        ]);

        $this->syncProdis($session, $data['prodis'] ?? []);

        return redirect()->route('monev.index');
    }

    public function destroy($id)
    {
        $user = request()->user();
        abort_unless($user && $user->can('monev-manage'), 403);
        $session = MonevSession::findOrFail($id);
        $session->delete();
        return redirect()->route('monev.index');
    }

    private function validatePayload(Request $request, $ignoreId = null): array
    {
        return $request->validate([
            'nama' => ['required','string','max:255'],
            'periode_id' => ['required', Rule::exists('periodes','id')],
            'tahun' => ['required','integer','min:2000','max:2100'],
            'tanggal_mulai' => ['required','date'],
            'tanggal_selesai' => ['required','date','after_or_equal:tanggal_mulai'],
            'template_id' => ['nullable','integer', Rule::exists('monev_templates','id')],
            'prodis' => ['nullable','array'],
            // unit must exist and be of tipe 'prodi'
            'prodis.*.unit_id' => ['required','integer', Rule::exists('units','id')->where('tipe', 'prodi')],
            // dosen table is singular 'dosen'
            'prodis.*.gjm_dosen_id' => ['required','integer', Rule::exists('dosen','id')],
        ]);
    }

    private function syncProdis(MonevSession $session, array $prodis): void
    {
        // Build desired state keyed by unit_id
        $desired = collect($prodis)
            ->map(fn($p) => [
                'unit_id' => (int) $p['unit_id'],
                'gjm_dosen_id' => (int) $p['gjm_dosen_id'],
            ])
            ->keyBy('unit_id');

        // Existing rows
        $existing = $session->prodis()->get()->keyBy('unit_id');

        // Upsert or update
        foreach ($desired as $unitId => $payload) {
            if ($existing->has($unitId)) {
                $row = $existing[$unitId];
                if ($row->gjm_dosen_id !== $payload['gjm_dosen_id']) {
                    $row->update(['gjm_dosen_id' => $payload['gjm_dosen_id']]);
                }
            } else {
                $session->prodis()->create($payload);
            }
        }

        // Delete removed
        foreach ($existing as $unitId => $row) {
            if (!$desired->has($unitId)) {
                $row->delete();
            }
        }
    }

    public function storeEvaluation(Request $request, $id)
    {
        $user = $request->user();
        $session = MonevSession::findOrFail($id);
        // Only admin/manajer monev can create penugasan
        abort_unless($user && $user->can('monev-manage'), 403);
        $data = $request->validate([
            'area' => ['required','string','max:255'],
            'unit_id' => ['required','integer', Rule::exists('units','id')->where('tipe','prodi')],
            'mata_kuliah_id' => ['required','integer', Rule::exists('mata_kuliah','id')->where(function($q) use ($request){
                if ($request->filled('unit_id')) $q->where('unit_id', $request->input('unit_id'));
            })],
            'dosen_id' => ['required','integer', Rule::exists('dosen','id')],
        ]);

        // Ensure unit is part of the session's registered prodis
        $isUnitInSession = MonevSessionProdi::where('monev_session_id', $session->id)
            ->where('unit_id', $data['unit_id'])
            ->exists();
        if (!$isUnitInSession) {
            return back()->withErrors(['unit_id' => 'Prodi tidak terdaftar pada sesi ini.'])->withInput();
        }

        MonevEvaluation::create([
            'monev_session_id' => $session->id,
            'unit_id' => $data['unit_id'],
            'mata_kuliah_id' => $data['mata_kuliah_id'],
            'dosen_id' => $data['dosen_id'],
            'area' => $data['area'],
        ]);

        return redirect()->route('monev.detail', $session->id);
    }

    public function destroyEvaluation($evaluationId)
    {
        $user = request()->user();
        $evaluation = MonevEvaluation::findOrFail($evaluationId);
        // Only admin/manajer monev can delete penugasan
        abort_unless($user && $user->can('monev-manage'), 403);
        $sessionId = $evaluation->monev_session_id;
        $evaluation->delete();
        return redirect()->route('monev.detail', $sessionId);
    }

    public function updateEvaluation(Request $request, $evaluationId)
    {
        $user = $request->user();
        $evaluation = MonevEvaluation::findOrFail($evaluationId);
        $sessionId = $evaluation->monev_session_id;
        // Only admin/manajer monev can update penugasan
        abort_unless($user && $user->can('monev-manage'), 403);

        $data = $request->validate([
            'area' => ['required','string','max:255'],
            'unit_id' => ['required','integer', Rule::exists('units','id')->where('tipe','prodi')],
            'mata_kuliah_id' => ['required','integer', Rule::exists('mata_kuliah','id')->where(function($q) use ($request){
                if ($request->filled('unit_id')) $q->where('unit_id', $request->input('unit_id'));
            })],
            'dosen_id' => ['required','integer', Rule::exists('dosen','id')],
        ]);

        // Ensure unit is part of the session's registered prodis
        $isUnitInSession = MonevSessionProdi::where('monev_session_id', $sessionId)
            ->where('unit_id', $data['unit_id'])
            ->exists();
        if (!$isUnitInSession) {
            return back()->withErrors(['unit_id' => 'Prodi tidak terdaftar pada sesi ini.'])->withInput();
        }

        $evaluation->update($data);

        return redirect()->route('monev.detail', $sessionId);
    }

    private function authorizeManageEvaluation($user, int $sessionId, int $unitId): void
    {
        if ($user && $user->can('monev-manage')) return; // admin/manajer monev
        if ($user && ($user->hasRole('gjm') ?? false)) {
            $dosenId = optional($user->dosen)->id;
            if (!$dosenId) abort(403);
            $allowed = MonevSessionProdi::where('monev_session_id', $sessionId)
                ->where('unit_id', $unitId)
                ->where('gjm_dosen_id', $dosenId)
                ->exists();
            if ($allowed) return;
        }
        abort(403);
    }

    public function scoreForm($evaluationId)
    {
        $user = request()->user();
        $evaluation = MonevEvaluation::with(['session','unit','mataKuliah'])->findOrFail($evaluationId);
        $session = $evaluation->session;
        // Check date window
        $today = date('Y-m-d');
        abort_if(($today < $session->tanggal_mulai) || ($today > $session->tanggal_selesai), 403, 'Di luar rentang tanggal sesi.');
        // Only GJM (authorized for this unit) or admin can score
        $this->authorizeManageEvaluation($user, $session->id, $evaluation->unit_id);
        if (!$session->template_id) {
            abort(400, 'Template sesi belum ditetapkan.');
        }
        $template = MonevTemplate::with(['questions' => function($q){ $q->orderBy('urutan'); }])->findOrFail($session->template_id);
        // Existing answers
        $answers = DB::table('monev_answers')
            ->where('evaluation_id', $evaluation->id)
            ->pluck('nilai','question_id');
        return Inertia::render('monev/Score', [
            'evaluation' => [
                'id' => $evaluation->id,
                'area' => $evaluation->area,
                'unit' => ['id' => $evaluation->unit->id, 'nama' => $evaluation->unit->nama],
                'mata_kuliah' => ['id' => $evaluation->mataKuliah->id, 'nama' => $evaluation->mataKuliah->nama],
            ],
            'template' => [
                'id' => $template->id,
                'nama' => $template->nama,
                'questions' => $template->questions->map(fn($q) => [
                    'id' => $q->id,
                    'urutan' => $q->urutan,
                    'pertanyaan' => $q->pertanyaan,
                    'aspek_penilaian' => $q->aspek_penilaian,
                    'skala' => $q->skala,
                ]),
            ],
            'answers' => $answers,
        ]);
    }

    public function saveScores(Request $request, $evaluationId)
    {
        $user = $request->user();
        $evaluation = MonevEvaluation::with(['session'])->findOrFail($evaluationId);
        $session = $evaluation->session;
        // Check date window
        $today = date('Y-m-d');
        abort_if(($today < $session->tanggal_mulai) || ($today > $session->tanggal_selesai), 403, 'Di luar rentang tanggal sesi.');
        // Only GJM (authorized for this unit) or admin can score
        $this->authorizeManageEvaluation($user, $session->id, $evaluation->unit_id);
        // Validate payload
        $payload = $request->validate([
            'scores' => ['required','array'],
            'scores.*.question_id' => ['required','integer', Rule::exists('monev_template_questions','id')->where('template_id', $session->template_id)],
            'scores.*.nilai' => ['nullable','integer','min:1','max:5'],
            'scores.*.catatan' => ['nullable','string'],
        ]);
        foreach ($payload['scores'] as $item) {
            DB::table('monev_answers')->updateOrInsert(
                ['evaluation_id' => $evaluation->id, 'question_id' => $item['question_id']],
                ['nilai' => $item['nilai'] ?? null, 'catatan' => $item['catatan'] ?? null, 'updated_at' => now(), 'created_at' => now()]
            );
        }
        return back()->with('status','Skor tersimpan');
    }
}

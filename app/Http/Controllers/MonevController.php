<?php

namespace App\Http\Controllers;

use App\Models\Dosen;
use App\Models\MataKuliah;
use App\Models\MonevEvaluation;
use App\Models\MonevSession;
use App\Models\MonevSessionProdi;
use App\Models\Periode;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MonevController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $filterPeriode = $request->integer('periode_id');
        $filterTahun = $request->integer('tahun');
        $perPage = (int) $request->input('per_page', 10);

        $query = MonevSession::with(['periode', 'prodis.unit', 'prodis.gjm'])
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

        $sessions = $query->paginate($perPage)->appends($request->only(['search','periode_id','tahun','per_page']));

        $periodes = Periode::orderByDesc('is_active')->orderByDesc('mulai')->get(['id','kode','nama']);
        // only show units with tipe 'prodi'
        $units = Unit::where('tipe', 'prodi')->orderBy('nama')->get(['id','nama']);
        $dosens = Dosen::orderBy('nama')->get(['id','nidn','nama']);

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
            ],
        ]);
    }

    public function detail($id)
    {
        $session = MonevSession::with(['prodis.unit'])->findOrFail($id);
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
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        $session = MonevSession::create([
            'nama' => $data['nama'],
            'periode_id' => $data['periode_id'],
            'tahun' => $data['tahun'],
            'tanggal_mulai' => $data['tanggal_mulai'],
            'tanggal_selesai' => $data['tanggal_selesai'],
        ]);

        $this->syncProdis($session, $data['prodis'] ?? []);

        return redirect()->route('monev.index');
    }

    public function update(Request $request, $id)
    {
        $session = MonevSession::findOrFail($id);
        $data = $this->validatePayload($request, $session->id);

        $session->update([
            'nama' => $data['nama'],
            'periode_id' => $data['periode_id'],
            'tahun' => $data['tahun'],
            'tanggal_mulai' => $data['tanggal_mulai'],
            'tanggal_selesai' => $data['tanggal_selesai'],
        ]);

        $this->syncProdis($session, $data['prodis'] ?? []);

        return redirect()->route('monev.index');
    }

    public function destroy($id)
    {
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
        $session = MonevSession::findOrFail($id);
        $data = $request->validate([
            'area' => ['required','string','max:255'],
            'unit_id' => ['required','integer', Rule::exists('units','id')->where('tipe','prodi')],
            'mata_kuliah_id' => ['required','integer', Rule::exists('mata_kuliah','id')->where(function($q) use ($request){
                if ($request->filled('unit_id')) $q->where('unit_id', $request->input('unit_id'));
            })],
            'dosen_id' => ['required','integer', Rule::exists('dosen','id')],
        ]);

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
        $evaluation = MonevEvaluation::findOrFail($evaluationId);
        $sessionId = $evaluation->monev_session_id;
        $evaluation->delete();
        return redirect()->route('monev.detail', $sessionId);
    }

    public function updateEvaluation(Request $request, $evaluationId)
    {
        $evaluation = MonevEvaluation::findOrFail($evaluationId);
        $sessionId = $evaluation->monev_session_id;

        $data = $request->validate([
            'area' => ['required','string','max:255'],
            'unit_id' => ['required','integer', Rule::exists('units','id')->where('tipe','prodi')],
            'mata_kuliah_id' => ['required','integer', Rule::exists('mata_kuliah','id')->where(function($q) use ($request){
                if ($request->filled('unit_id')) $q->where('unit_id', $request->input('unit_id'));
            })],
            'dosen_id' => ['required','integer', Rule::exists('dosen','id')],
        ]);

        $evaluation->update($data);

        return redirect()->route('monev.detail', $sessionId);
    }
}

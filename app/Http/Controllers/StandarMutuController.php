<?php

namespace App\Http\Controllers;

use App\Models\StandarMutu;
use App\Models\Indikator;
use App\Models\Pertanyaan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class StandarMutuController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = StandarMutu::query();
        if ($search) {
            $query->where('kode', 'like', "%$search%")
                ->orWhere('nama', 'like', "%$search%")
                ->orWhere('deskripsi', 'like', "%$search%");
        }
        // Hitung jumlah indikator dan jumlah pertanyaan (melalui relasi hasManyThrough)
        $standar = $query->withCount([
                'indikator as jumlah_indikator',
                'pertanyaan as jumlah_pertanyaan',
            ])
            ->paginate(10)
            ->withQueryString();
        return Inertia::render('standar-mutu/Index', [
            'standar' => $standar,
            'search' => $search,
        ]);
    }

    public function show($id)
    {
        $standar = StandarMutu::with(['indikator.pertanyaan'])->findOrFail($id);
        return Inertia::render('standar-mutu/Detail', [
            'standar' => $standar,
        ]);
    }

    public function showJson($id)
    {
        $standar = StandarMutu::with(['indikator' => function($q){
            $q->orderBy('urutan');
        }, 'indikator.pertanyaan' => function($q){
            $q->orderBy('urutan');
        }])->findOrFail($id);
        return response()->json($standar);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kode' => 'required|string|unique:standar_mutu,kode',
            'nama' => 'required|string',
            'deskripsi' => 'nullable|string',
            'status' => 'boolean',
        ]);
        StandarMutu::create($data);
        return redirect()->route('standar-mutu.index');
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'kode' => 'required|string|unique:standar_mutu,kode,' . $id,
            'nama' => 'required|string',
            'deskripsi' => 'nullable|string',
            'status' => 'boolean',
        ]);
        StandarMutu::findOrFail($id)->update($data);
        return redirect()->route('standar-mutu.index');
    }

    public function destroy($id)
    {
        StandarMutu::findOrFail($id)->delete();
        return redirect()->route('standar-mutu.index');
    }

    // CRUD Indikator
    public function storeIndikator(Request $request, $standar)
    {
        // Temporary log to verify incoming payload
        Log::info('storeIndikator payload', $request->all());
        $data = $request->validate([
            'nama' => 'required|string',
            'kriteria_penilaian' => 'nullable|string',
            'jenis_pengukuran' => 'required|in:kuantitatif,kualitatif',
            'target_pencapaian' => 'nullable|string',
        ]);
        $maxUrutan = Indikator::where('standar_id', $standar)->max('urutan');
        Indikator::create([
            'standar_id' => $standar,
            'nama' => $data['nama'],
            'kriteria_penilaian' => $data['kriteria_penilaian'] ?? null,
            'jenis_pengukuran' => $data['jenis_pengukuran'],
            'target_pencapaian' => $data['target_pencapaian'] ?? null,
            'urutan' => ($maxUrutan ?? 0) + 1,
        ]);
        return back();
    }
    public function updateIndikator(Request $request, $standar, $id)
    {
        $data = $request->validate([
            'nama' => 'required|string',
            'kriteria_penilaian' => 'nullable|string',
            'jenis_pengukuran' => 'required|in:kuantitatif,kualitatif',
            'target_pencapaian' => 'nullable|string',
        ]);
        Indikator::where('id', $id)->where('standar_id', $standar)->firstOrFail()->update($data);
        return back();
    }
    public function destroyIndikator($standar, $id)
    {
        Indikator::where('id', $id)->where('standar_id', $standar)->firstOrFail()->delete();
        return back();
    }

    // CRUD Pertanyaan
    public function storePertanyaan(Request $request, $indikatorId)
    {
        $data = $request->validate([
            'isi' => 'required|string',
        ]);
        $maxUrutan = Pertanyaan::where('indikator_id', $indikatorId)->max('urutan');
        Pertanyaan::create([
            'indikator_id' => $indikatorId,
            'isi' => $data['isi'],
            'urutan' => ($maxUrutan ?? 0) + 1,
        ]);
        return back();
    }
    public function updatePertanyaan(Request $request, $id)
    {
        $data = $request->validate([
            'isi' => 'required|string',
        ]);
        Pertanyaan::findOrFail($id)->update($data);
        return back();
    }
    public function destroyPertanyaan($standar, $indikator, $id)
    {
        $pertanyaan = Pertanyaan::where('id', $id)
            ->where('indikator_id', $indikator)
            ->whereHas('indikator', function($query) use ($standar) {
                $query->where('standar_id', $standar);
            })
            ->firstOrFail();
        $pertanyaan->delete();
        return back();
    }

    // Update urutan indikator/pertanyaan (drag-and-drop)
    public function updateUrutanIndikator(Request $request, $standar)
    {
        foreach ($request->input('urutan') as $id => $urutan) {
            Indikator::where('id', $id)->where('standar_id', $standar)->update(['urutan' => $urutan]);
        }
        return back();
    }
    public function updateUrutanPertanyaan(Request $request, $indikator)
    {
        foreach ($request->input('urutan') as $id => $urutan) {
            Pertanyaan::where('id', $id)->where('indikator_id', $indikator)->update(['urutan' => $urutan]);
        }
        return back();
    }
}

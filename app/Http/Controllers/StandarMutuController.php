<?php

namespace App\Http\Controllers;

use App\Models\StandarMutu;
use App\Models\Indikator;
use App\Models\Pertanyaan;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $standar = $query->withCount(['indikator as jumlah_indikator', 'indikator as jumlah_pertanyaan' => function ($q) {
            $q->withCount('pertanyaan');
        }])
            ->paginate(10);
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
    public function storeIndikator(Request $request, $standarId)
    {
        $data = $request->validate([
            'nama' => 'required|string',
        ]);
        Indikator::create([
            'standar_id' => $standarId,
            'nama' => $data['nama'],
            'urutan' => Indikator::where('standar_id', $standarId)->max('urutan') + 1,
        ]);
        return back();
    }
    public function updateIndikator(Request $request, $id)
    {
        $data = $request->validate([
            'nama' => 'required|string',
        ]);
        Indikator::findOrFail($id)->update($data);
        return back();
    }
    public function destroyIndikator($id)
    {
        Indikator::findOrFail($id)->delete();
        return back();
    }

    // CRUD Pertanyaan
    public function storePertanyaan(Request $request, $indikatorId)
    {
        $data = $request->validate([
            'isi' => 'required|string',
        ]);
        Pertanyaan::create([
            'indikator_id' => $indikatorId,
            'isi' => $data['isi'],
            'urutan' => Pertanyaan::where('indikator_id', $indikatorId)->max('urutan') + 1,
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
    public function destroyPertanyaan($id)
    {
        Pertanyaan::findOrFail($id)->delete();
        return back();
    }

    // Update urutan indikator/pertanyaan (drag-and-drop)
    public function updateUrutanIndikator(Request $request, $standarId)
    {
        foreach ($request->input('urutan') as $id => $urutan) {
            Indikator::where('id', $id)->where('standar_id', $standarId)->update(['urutan' => $urutan]);
        }
        return back();
    }
    public function updateUrutanPertanyaan(Request $request, $indikatorId)
    {
        foreach ($request->input('urutan') as $id => $urutan) {
            Pertanyaan::where('id', $id)->where('indikator_id', $indikatorId)->update(['urutan' => $urutan]);
        }
        return back();
    }
}

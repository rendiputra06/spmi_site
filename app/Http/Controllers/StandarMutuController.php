<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIndikatorRequest;
use App\Http\Requests\StorePertanyaanRequest;
use App\Http\Requests\StoreStandarMutuRequest;
use App\Http\Requests\UpdateIndikatorRequest;
use App\Http\Requests\UpdatePertanyaanRequest;
use App\Http\Requests\UpdateStandarMutuRequest;
use App\Models\StandarMutu;
use App\Models\Indikator;
use App\Models\Pertanyaan;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class StandarMutuController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', StandarMutu::class);
        $search = $request->input('search');
        $query = StandarMutu::query();
        if ($search) {
            $query->where('kode', 'like', "%{$search}%")->orWhere('nama', 'like', "%{$search}%");
        }
        $standar = $query->withCount(['indikator as jumlah_indikator', 'pertanyaan as jumlah_pertanyaan'])
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('standar-mutu/Index', [
            'standar' => $standar,
            'search' => $search,
            'flash' => fn () => $request->session()->get('success') ? ['success' => $request->session()->get('success')] : null,
        ]);
    }

    public function show(StandarMutu $standarMutu)
    {
        $this->authorize('view', $standarMutu);
        $standarMutu->load('indikator.pertanyaan');
        return Inertia::render('standar-mutu/Detail', [
            'standar' => $standarMutu,
            'flash' => fn () => session()->get('success') ? ['success' => session()->get('success')] : null,
        ]);
    }

    public function store(StoreStandarMutuRequest $request)
    {
        StandarMutu::create($request->validated());
        return redirect()->route('standar-mutu.index')->with('success', 'Standar Mutu berhasil ditambahkan.');
    }

    public function update(UpdateStandarMutuRequest $request, StandarMutu $standarMutu)
    {
        $standarMutu->update($request->validated());
        return redirect()->route('standar-mutu.index')->with('success', 'Standar Mutu berhasil diperbarui.');
    }

    public function destroy(StandarMutu $standarMutu)
    {
        $this->authorize('delete', $standarMutu);
        $standarMutu->delete();
        return redirect()->route('standar-mutu.index')->with('success', 'Standar Mutu berhasil dihapus.');
    }

    // CRUD Indikator
    public function storeIndikator(StoreIndikatorRequest $request, StandarMutu $standarMutu)
    {
        $standarMutu->indikator()->create([
            'nama' => $request->validated('nama'),
            'urutan' => $standarMutu->indikator()->max('urutan') + 1,
        ]);
        return back()->with('success', 'Indikator berhasil ditambahkan.');
    }

    public function updateIndikator(UpdateIndikatorRequest $request, Indikator $indikator)
    {
        $indikator->update($request->validated());
        return back()->with('success', 'Indikator berhasil diperbarui.');
    }

    public function destroyIndikator(Indikator $indikator)
    {
        $this->authorize('update', $indikator->standar);
        $indikator->delete();
        return back()->with('success', 'Indikator berhasil dihapus.');
    }

    // CRUD Pertanyaan
    public function storePertanyaan(StorePertanyaanRequest $request, Indikator $indikator)
    {
        $indikator->pertanyaan()->create([
            'isi' => $request->validated('isi'),
            'urutan' => $indikator->pertanyaan()->max('urutan') + 1,
        ]);
        return back()->with('success', 'Pertanyaan berhasil ditambahkan.');
    }

    public function updatePertanyaan(UpdatePertanyaanRequest $request, Pertanyaan $pertanyaan)
    {
        $pertanyaan->update($request->validated());
        return back()->with('success', 'Pertanyaan berhasil diperbarui.');
    }

    public function destroyPertanyaan(Pertanyaan $pertanyaan)
    {
        $this->authorize('update', $pertanyaan->indikator->standar);
        $pertanyaan->delete();
        return back()->with('success', 'Pertanyaan berhasil dihapus.');
    }

    // Update urutan
    public function updateUrutanIndikator(Request $request, StandarMutu $standarMutu)
    {
        $this->authorize('update', $standarMutu);
        $validated = $request->validate(['urutan' => 'required|array', 'urutan.*.id' => 'required|exists:indikator,id', 'urutan.*.urutan' => 'required|integer']);
        foreach ($validated['urutan'] as $item) {
            Indikator::where('id', $item['id'])->where('standar_id', $standarMutu->id)->update(['urutan' => $item['urutan']]);
        }
        return back()->with('success', 'Urutan indikator berhasil diperbarui.');
    }

    public function updateUrutanPertanyaan(Request $request, Indikator $indikator)
    {
        $this->authorize('update', $indikator->standar);
        $validated = $request->validate(['urutan' => 'required|array', 'urutan.*.id' => 'required|exists:pertanyaan,id', 'urutan.*.urutan' => 'required|integer']);
        foreach ($validated['urutan'] as $item) {
            Pertanyaan::where('id', $item['id'])->where('indikator_id', $indikator->id)->update(['urutan' => $item['urutan']]);
        }
        return back()->with('success', 'Urutan pertanyaan berhasil diperbarui.');
    }
}

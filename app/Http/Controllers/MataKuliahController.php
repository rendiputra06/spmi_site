<?php

namespace App\Http\Controllers;

use App\Models\MataKuliah;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MataKuliahController extends Controller
{
    public function index(Request $request)
    {
        $search = (string) $request->input('search', '');
        $unitId = $request->input('unit_id'); // prodi id
        $perPage = (int) $request->input('per_page', 10);

        $query = MataKuliah::query()->with(['unit']);
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode', 'like', "%$search%")
                  ->orWhere('nama', 'like', "%$search%");
            });
        }
        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        $items = $query->orderBy('kode')->paginate($perPage)->withQueryString();

        // Prodi options from units (tipe = prodi)
        $prodiOptions = Unit::select('id', 'nama')
            ->where('tipe', 'prodi')
            ->orderBy('nama')
            ->get();

        return Inertia::render('mata-kuliah/Index', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'unit_id' => $unitId ? (int) $unitId : '',
                'per_page' => $perPage,
            ],
            'prodi_options' => $prodiOptions,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kode' => 'required|string|unique:mata_kuliah,kode',
            'nama' => 'required|string',
            'sks' => 'required|integer|min:0|max:40',
            'status' => 'boolean',
            'unit_id' => 'nullable|exists:units,id',
        ]);

        MataKuliah::create($data);
        return redirect()->route('mata-kuliah.index')->with('status', 'Mata kuliah berhasil dibuat');
    }

    public function update(Request $request, $id)
    {
        $mk = MataKuliah::findOrFail($id);
        $data = $request->validate([
            'kode' => 'required|string|unique:mata_kuliah,kode,' . $mk->id,
            'nama' => 'required|string',
            'sks' => 'required|integer|min:0|max:40',
            'status' => 'boolean',
            'unit_id' => 'nullable|exists:units,id',
        ]);

        $mk->update($data);
        return redirect()->route('mata-kuliah.index')->with('status', 'Mata kuliah berhasil diperbarui');
    }

    public function destroy($id)
    {
        $mk = MataKuliah::findOrFail($id);
        $mk->delete();
        return redirect()->route('mata-kuliah.index')->with('status', 'Mata kuliah berhasil dihapus');
    }
}

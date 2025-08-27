<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\Dosen;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $tipe = $request->input('tipe');
        $parentId = $request->input('parent_id');
        $perPage = (int) $request->input('per_page', 10);

        $query = Unit::query()->with(['parent', 'leaderDosen']);
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('kode', 'like', "%$search%")
                  ->orWhere('nama', 'like', "%$search%")
                  ->orWhere('tipe', 'like', "%$search%")
                  ->orWhere('leader_nama', 'like', "%$search%")
                  ->orWhere('leader_jabatan', 'like', "%$search%");
            });
        }
        if ($tipe) {
            $query->where('tipe', $tipe);
        }
        if ($parentId) {
            $query->where('parent_id', $parentId);
        }
        $units = $query->orderBy('tipe')->orderBy('nama')->paginate($perPage)->withQueryString();

        // Options for parent and leader selector
        $parentOptions = Unit::select('id', 'nama', 'tipe')->orderBy('nama')->get();
        // Increase limit to provide more options; consider implementing searchable endpoint if data is large
        $leaderOptions = Dosen::select('id', 'nama', 'nidn')->orderBy('nama')->limit(200)->get();

        return Inertia::render('unit/Index', [
            'units' => $units,
            'filters' => [
                'search' => (string) ($search ?? ''),
                'tipe' => (string) ($tipe ?? ''),
                'parent_id' => $parentId ? (int) $parentId : '',
                'per_page' => $perPage,
            ],
            'parent_options' => $parentOptions,
            'leader_options' => $leaderOptions,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kode' => 'required|string|unique:units,kode',
            'nama' => 'required|string',
            'tipe' => 'required|in:universitas,fakultas,prodi,unit',
            'parent_id' => 'nullable|exists:units,id',
            'leader_id' => 'nullable|exists:dosen,id',
            'leader_nama' => 'nullable|string',
            'leader_jabatan' => 'nullable|string',
            'status' => 'boolean',
        ]);
        Unit::create($data);
        return redirect()->route('units.index')->with('status', 'Unit berhasil dibuat');
    }

    public function update(Request $request, $id)
    {
        $u = Unit::findOrFail($id);
        $data = $request->validate([
            'kode' => 'required|string|unique:units,kode,' . $u->id,
            'nama' => 'required|string',
            'tipe' => 'required|in:universitas,fakultas,prodi,unit',
            'parent_id' => 'nullable|exists:units,id',
            'leader_id' => 'nullable|exists:dosen,id',
            'leader_nama' => 'nullable|string',
            'leader_jabatan' => 'nullable|string',
            'status' => 'boolean',
        ]);
        $u->update($data);
        return redirect()->route('units.index')->with('status', 'Unit berhasil diperbarui');
    }

    public function destroy($id)
    {
        $unit = Unit::withCount('children')->findOrFail($id);
        if ($unit->children_count > 0) {
            return redirect()->route('units.index')->with('error', 'Tidak dapat menghapus unit karena masih memiliki unit turunan.');
        }
        $unit->delete();
        return redirect()->route('units.index')->with('status', 'Unit berhasil dihapus');
    }
}

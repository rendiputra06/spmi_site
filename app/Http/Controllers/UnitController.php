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
        $query = Unit::query()->with(['parent']);
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('kode', 'like', "%$search%")
                  ->orWhere('nama', 'like', "%$search%")
                  ->orWhere('tipe', 'like', "%$search%")
                  ->orWhere('leader_nama', 'like', "%$search%")
                  ->orWhere('leader_jabatan', 'like', "%$search%");
            });
        }
        $units = $query->orderBy('tipe')->orderBy('nama')->paginate(10);

        // Options for parent and leader selector
        $parentOptions = Unit::select('id', 'nama', 'tipe')->orderBy('nama')->get();
        $leaderOptions = Dosen::select('id', 'nama', 'nidn')->orderBy('nama')->limit(50)->get();

        return Inertia::render('unit/Index', [
            'units' => $units,
            'search' => $search,
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
        return redirect()->route('units.index');
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
        return redirect()->route('units.index');
    }

    public function destroy($id)
    {
        Unit::findOrFail($id)->delete();
        return redirect()->route('units.index');
    }
}

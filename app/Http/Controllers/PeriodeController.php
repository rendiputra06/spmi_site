<?php

namespace App\Http\Controllers;

use App\Models\Periode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PeriodeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = Periode::query();
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('kode', 'like', "%$search%")
                  ->orWhere('nama', 'like', "%$search%")
                  ->orWhere('keterangan', 'like', "%$search%");
            });
        }
        $periodes = $query->orderByDesc('is_active')->orderByDesc('mulai')->paginate(10);

        return Inertia::render('periode/Index', [
            'periodes' => $periodes,
            'search' => $search,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kode' => 'required|string|unique:periodes,kode',
            'nama' => 'required|string',
            'mulai' => 'required|date',
            'selesai' => 'required|date|after_or_equal:mulai',
            'keterangan' => 'nullable|string',
            'status' => 'boolean',
            'is_active' => 'boolean',
        ]);

        // Jika set active, matikan periode lain yang aktif
        if (!empty($data['is_active'])) {
            Periode::where('is_active', true)->update(['is_active' => false]);
        }

        Periode::create($data);
        return redirect()->route('periodes.index');
    }

    public function update(Request $request, $id)
    {
        $periode = Periode::findOrFail($id);
        $data = $request->validate([
            'kode' => 'required|string|unique:periodes,kode,' . $periode->id,
            'nama' => 'required|string',
            'mulai' => 'required|date',
            'selesai' => 'required|date|after_or_equal:mulai',
            'keterangan' => 'nullable|string',
            'status' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if (!empty($data['is_active'])) {
            Periode::where('is_active', true)->where('id', '!=', $periode->id)->update(['is_active' => false]);
        }

        $periode->update($data);
        return redirect()->route('periodes.index');
    }

    public function destroy($id)
    {
        Periode::findOrFail($id)->delete();
        return redirect()->route('periodes.index');
    }
}

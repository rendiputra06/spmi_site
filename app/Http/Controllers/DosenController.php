<?php

namespace App\Http\Controllers;

use App\Models\Dosen;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DosenController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = Dosen::query();
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('nidn', 'like', "%$search%")
                  ->orWhere('nama', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('prodi', 'like', "%$search%")
                  ->orWhere('jabatan', 'like', "%$search%")
                  ->orWhere('pangkat_golongan', 'like', "%$search%")
                  ->orWhere('pendidikan_terakhir', 'like', "%$search%");
            });
        }
        $dosen = $query->orderBy('nama')->paginate(10);
        return Inertia::render('dosen/Index', [
            'dosen' => $dosen,
            'search' => $search,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nidn' => 'required|string|unique:dosen,nidn',
            'nama' => 'required|string',
            'email' => 'required|email|unique:dosen,email',
            'prodi' => 'nullable|string',
            'jabatan' => 'nullable|string',
            'pangkat_golongan' => 'nullable|string',
            'pendidikan_terakhir' => 'nullable|string',
            'status' => 'boolean',
        ]);
        Dosen::create($data);
        return redirect()->route('dosen.index');
    }

    public function update(Request $request, $id)
    {
        $d = Dosen::findOrFail($id);
        $data = $request->validate([
            'nidn' => 'required|string|unique:dosen,nidn,' . $d->id,
            'nama' => 'required|string',
            'email' => 'required|email|unique:dosen,email,' . $d->id,
            'prodi' => 'nullable|string',
            'jabatan' => 'nullable|string',
            'pangkat_golongan' => 'nullable|string',
            'pendidikan_terakhir' => 'nullable|string',
            'status' => 'boolean',
        ]);
        $d->update($data);
        return redirect()->route('dosen.index');
    }

    public function destroy($id)
    {
        Dosen::findOrFail($id)->delete();
        return redirect()->route('dosen.index');
    }
}

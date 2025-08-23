<?php

namespace App\Http\Controllers;

use App\Models\Dosen;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
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
        $roles = \Spatie\Permission\Models\Role::query()->orderBy('name')->pluck('name');
        return Inertia::render('dosen/Index', [
            'dosen' => $dosen,
            'search' => $search,
            'roles' => $roles,
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
            'create_user' => 'sometimes|boolean',
            'send_invite' => 'sometimes|boolean',
            'user_roles' => 'sometimes|array',
            'user_roles.*' => 'string|exists:roles,name',
            'password' => 'nullable|string|min:6',
        ]);

        $dosen = new Dosen($data);

        // Optional: create/link user account
        if ($request->boolean('create_user')) {
            $user = User::where('email', $dosen->email)->first();
            if (!$user) {
                $user = User::create([
                    'name' => $dosen->nama,
                    'email' => $dosen->email,
                    'password' => $data['password'] ?? Str::password(12), // hashed via casts
                ]);
            }
            $dosen->user_id = $user->id;

            // Assign roles if provided
            if (!empty($data['user_roles'])) {
                foreach ($data['user_roles'] as $r) {
                    Role::findOrCreate($r);
                }
                $user->syncRoles($data['user_roles']);
            }

            if ($request->boolean('send_invite')) {
                Password::sendResetLink(['email' => $user->email]);
            }
        }

        $dosen->save();

        return redirect()->route('dosen.index')->with('status', 'Dosen tersimpan' . ($request->boolean('create_user') ? ' dan akun pengguna telah ' . (isset($user) && $user->wasRecentlyCreated ? 'dibuat' : 'ditautkan') : ''));
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
            'create_user' => 'sometimes|boolean',
            'send_invite' => 'sometimes|boolean',
            'user_roles' => 'sometimes|array',
            'user_roles.*' => 'string|exists:roles,name',
            'password' => 'nullable|string|min:6',
        ]);

        $d->update($data);

        // Optional: create/link user account on update as well (only if not linked yet)
        if (!$d->user_id && $request->boolean('create_user')) {
            $user = User::where('email', $d->email)->first();
            if (!$user) {
                $user = User::create([
                    'name' => $d->nama,
                    'email' => $d->email,
                    'password' => $data['password'] ?? Str::password(12),
                ]);
            }
            $d->user_id = $user->id;
            $d->save();

            if (!empty($data['user_roles'])) {
                foreach ($data['user_roles'] as $r) {
                    Role::findOrCreate($r);
                }
                $user->syncRoles($data['user_roles']);
            }

            if ($request->boolean('send_invite')) {
                Password::sendResetLink(['email' => $user->email]);
            }
        }

        return redirect()->route('dosen.index')->with('status', 'Dosen diperbarui' . ($request->boolean('create_user') ? ' dan akun pengguna telah ' . (isset($user) && $user->wasRecentlyCreated ? 'dibuat' : 'ditautkan') : ''));
    }

    public function destroy($id)
    {
        Dosen::findOrFail($id)->delete();
        return redirect()->route('dosen.index');
    }
}

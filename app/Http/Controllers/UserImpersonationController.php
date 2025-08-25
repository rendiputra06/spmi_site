<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserImpersonationController extends Controller
{
    public function start(Request $request, User $user)
    {
        // Authorize via permission
        if (!$request->user()->can('users.impersonate')) {
            abort(403, 'Unauthorized');
        }

        // Prevent self-impersonation
        if ($user->id === $request->user()->id) {
            return redirect()->back()->with('error', 'Tidak bisa impersonate diri sendiri.');
        }

        // Store original user id only if not already impersonating
        if (!$request->session()->has('impersonator_id')) {
            $request->session()->put('impersonator_id', $request->user()->id);
        }

        // Login as target user
        Auth::loginUsingId($user->id);

        // Optional: log activity here

        return redirect()->route('dashboard')->with('success', "Impersonate sebagai {$user->name} berhasil.");
    }

    public function stop(Request $request)
    {
        $impersonatorId = $request->session()->pull('impersonator_id');

        if (!$impersonatorId) {
            return redirect()->back()->with('error', 'Tidak sedang impersonate.');
        }

        Auth::loginUsingId($impersonatorId);

        // Optional: log activity here

        return redirect()->route('users.index')->with('success', 'Kembali ke akun Anda.');
    }
}

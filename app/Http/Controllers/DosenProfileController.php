<?php

namespace App\Http\Controllers;

use App\Models\Dosen;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DosenProfileController extends Controller
{
    public function __invoke(Request $request)
    {
        // Only allow users with the permission to access
        if (!$request->user()->can('my-dosen-view')) {
            abort(403);
        }

        $dosen = Dosen::with(['unit'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$dosen) {
            // No dosen data attached
            return Inertia::render('dosen/ProfileMissing');
        }

        return Inertia::render('dosen/Profile', [
            'dosen' => $dosen,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DocumentsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $search = $request->string('search')->toString();
        $unitId = $request->input('unit_id');
        $category = $request->string('category')->toString();
        $status = $request->string('status')->toString();

        $canManageAll = method_exists($user, 'hasRole') && $user->hasRole('admin');
        $userUnitId = optional(optional($user)->dosen)->unit_id; // if user linked to dosen

        $query = Document::query()->with(['unit', 'uploader']);

        if (!$canManageAll && $userUnitId) {
            $query->where('unit_id', $userUnitId);
        } elseif ($unitId) {
            $query->where('unit_id', $unitId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%$search%")
                    ->orWhere('description', 'like', "%$search%")
                    ->orWhere('category', 'like', "%$search%")
                    ->orWhere('status', 'like', "%$search%");
            });
        }
        if ($category) {
            $query->where('category', $category);
        }
        if ($status) {
            $query->where('status', $status);
        }

        $documents = $query->orderByDesc('created_at')->paginate(10);
        $unitOptions = Unit::select('id', 'nama', 'tipe')->orderBy('nama')->get();

        return Inertia::render('documents/Index', [
            'documents' => $documents,
            'search' => $search,
            'unit_id' => $canManageAll ? $unitId : $userUnitId,
            'can_manage_all' => $canManageAll,
            'unit_options' => $unitOptions,
            'category' => $category,
            'status' => $status,
        ]);
    }

    public function jsonIndex(Request $request)
    {
        $user = Auth::user();
        $search = $request->string('search')->toString();
        $unitId = $request->input('unit_id');
        $category = $request->string('category')->toString();
        $status = $request->string('status')->toString();
        $perPage = (int) $request->input('per_page', 10);

        $canManageAll = method_exists($user, 'hasRole') && $user->hasRole('admin');
        $userUnitId = optional(optional($user)->dosen)->unit_id;

        $query = Document::query();
        if (!$canManageAll && $userUnitId) {
            $query->where('unit_id', $userUnitId);
        } elseif ($unitId) {
            $query->where('unit_id', $unitId);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%$search%")
                    ->orWhere('description', 'like', "%$search%")
                    ->orWhere('category', 'like', "%$search%")
                    ->orWhere('status', 'like', "%$search%");
            });
        }
        if ($category) { $query->where('category', $category); }
        if ($status) { $query->where('status', $status); }

        $documents = $query->orderByDesc('created_at')->paginate($perPage);

        $items = collect($documents->items())->map(function ($d) {
            return [
                'id' => $d->id,
                'title' => $d->title,
                'description' => $d->description,
                'size' => $d->size,
                'mime' => $d->mime,
                'download_url' => route('documents.download', ['document' => $d->id]),
            ];
        });

        return response()->json([
            'data' => $items,
            'current_page' => $documents->currentPage(),
            'last_page' => $documents->lastPage(),
            'per_page' => $documents->perPage(),
            'total' => $documents->total(),
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $canManageAll = method_exists($user, 'hasRole') && $user->hasRole('admin');
        $userUnitId = optional(optional($user)->dosen)->unit_id;

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'status' => 'nullable|in:draft,published,archived',
            'unit_id' => 'nullable|exists:units,id',
            'file' => 'required|file|max:51200', // 50MB
        ]);

        $unitId = $canManageAll ? ($validated['unit_id'] ?? $userUnitId) : $userUnitId;
        if (!$unitId) {
            return back()->withErrors(['unit_id' => 'Unit tidak ditemukan untuk pengguna ini.']);
        }

        $path = $request->file('file')->store('documents', 'public');
        $mime = $request->file('file')->getMimeType();
        $size = $request->file('file')->getSize();

        Document::create([
            'unit_id' => $unitId,
            'uploaded_by' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'file_path' => $path,
            'mime' => $mime,
            'size' => $size,
        ]);

        return redirect()->route('documents.index')->with('status', 'Dokumen diunggah');
    }

    public function update(Request $request, Document $document)
    {
        // $this->authorize('update', $document);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'status' => 'nullable|in:draft,published,archived',
            'file' => 'nullable|file|max:51200',
        ]);

        if ($request->hasFile('file')) {
            // optional: delete old file
            if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }
            $path = $request->file('file')->store('documents', 'public');
            $document->file_path = $path;
            $document->mime = $request->file('file')->getMimeType();
            $document->size = $request->file('file')->getSize();
        }

        $document->fill([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? null,
            'status' => $validated['status'] ?? $document->status,
        ])->save();

        return back()->with('status', 'Dokumen diperbarui');
    }

    public function destroy(Document $document)
    {
        // $this->authorize('delete', $document);
        // optional: delete file from storage too
        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }
        $document->delete();
        return back()->with('status', 'Dokumen dihapus');
    }

    public function download(Document $document)
    {
        // $this->authorize('view', $document);
        if (!$document->file_path || !Storage::disk('public')->exists($document->file_path)) {
            abort(404);
        }
        $ext = pathinfo($document->file_path, PATHINFO_EXTENSION);
        $filename = Str::slug($document->title) . ($ext ? ".{$ext}" : '');
        return Storage::disk('public')->download($document->file_path, $filename);
    }
}

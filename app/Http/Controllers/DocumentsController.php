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
            'file' => 'required|file|max:51200|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,png,jpg,jpeg', // 50MB
        ]);

        $unitId = $canManageAll ? ($validated['unit_id'] ?? $userUnitId) : $userUnitId;
        if (!$unitId) {
            return back()->withErrors(['unit_id' => 'Unit tidak ditemukan untuk pengguna ini.']);
        }

        $document = Document::create([
            'unit_id' => $unitId,
            'uploaded_by' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? null,
            'status' => $validated['status'] ?? 'draft',
        ]);

        // Attach media via Spatie (singleFile collection ensures old is replaced automatically)
        $media = $document
            ->addMedia($request->file('file'))
            ->toMediaCollection('documents');

        // Keep legacy fields in sync for existing frontend usages
        $document->file_path = ltrim(str_replace(Storage::disk('public')->path(''), '', $media->getPath()), '/');
        $document->mime = $media->mime_type;
        $document->size = $media->size;
        $document->save();

        return redirect()->route('documents.index')->with('success', 'Dokumen diunggah');
    }

    public function update(Request $request, Document $document)
    {
        // $this->authorize('update', $document);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'status' => 'nullable|in:draft,published,archived',
            'file' => 'nullable|file|max:51200|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,png,jpg,jpeg',
        ]);

        if ($request->hasFile('file')) {
            // Replace media (singleFile collection auto-deletes previous)
            $media = $document
                ->addMedia($request->file('file'))
                ->toMediaCollection('documents');

            // Sync legacy fields
            $document->file_path = ltrim(str_replace(Storage::disk('public')->path(''), '', $media->getPath()), '/');
            $document->mime = $media->mime_type;
            $document->size = $media->size;
        }

        $document->fill([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? null,
            'status' => $validated['status'] ?? $document->status,
        ])->save();

        return back()->with('success', 'Dokumen diperbarui');
    }

    public function destroy(Document $document)
    {
        // $this->authorize('delete', $document);
        // MediaLibrary will handle file deletion if you also remove associated media.
        if ($media = $document->getFirstMedia('documents')) {
            $media->delete();
        }
        $document->delete();
        return back()->with('success', 'Dokumen dihapus');
    }

    public function download(Document $document)
    {
        // $this->authorize('view', $document);
        $media = $document->getFirstMedia('documents');
        if ($media) {
            $ext = pathinfo($media->file_name, PATHINFO_EXTENSION);
            $filename = Str::slug($document->title) . ($ext ? ".{$ext}" : '');
            return response()->download($media->getPath(), $filename);
        }
        // Fallback to legacy storage if media not found
        if (!$document->file_path || !Storage::disk('public')->exists($document->file_path)) {
            abort(404);
        }
        $ext = pathinfo($document->file_path, PATHINFO_EXTENSION);
        $filename = Str::slug($document->title) . ($ext ? ".{$ext}" : '');
        return Storage::disk('public')->download($document->file_path, $filename);
    }
}

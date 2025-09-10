<?php

namespace App\Http\Controllers;

use App\Models\MonevTemplate;
use App\Models\MonevTemplateQuestion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MonevTemplateController extends Controller
{
    public function index()
    {
        $templates = MonevTemplate::with('questions')->orderBy('id', 'desc')->get();
        $user = request()->user();
        return Inertia::render('monev-templates/Index', [
            'templates' => $templates,
            'canManage' => (bool) ($user && $user->can('monev-manage')),
        ]);
    }

    public function show($id)
    {
        $template = MonevTemplate::with(['questions' => function($q){ $q->orderBy('urutan'); }])->findOrFail($id);
        $user = request()->user();

        // Recap nilai: rata-rata dan jumlah jawaban per pertanyaan
        $questionIds = $template->questions->pluck('id');
        $agg = collect();
        $overallAvg = null;
        $overallCount = 0;
        if ($questionIds->count() > 0) {
            $rows = DB::table('monev_answers')
                ->select('question_id', DB::raw('AVG(nilai) as avg_nilai'), DB::raw('COUNT(nilai) as cnt'))
                ->whereIn('question_id', $questionIds)
                ->groupBy('question_id')
                ->get()
                ->keyBy('question_id');
            $agg = $template->questions->map(function ($q) use ($rows) {
                $r = $rows->get($q->id);
                return [
                    'question_id' => $q->id,
                    'urutan' => $q->urutan,
                    'pertanyaan' => $q->pertanyaan,
                    'avg' => $r ? round((float)$r->avg_nilai, 2) : null,
                    'count' => $r ? (int)$r->cnt : 0,
                ];
            });
            // Overall average dari semua nilai (berat sama)
            $overallData = DB::table('monev_answers')
                ->whereIn('question_id', $questionIds)
                ->select(DB::raw('AVG(nilai) as avg_all'), DB::raw('COUNT(nilai) as cnt_all'))
                ->first();
            if ($overallData) {
                $overallAvg = round((float)$overallData->avg_all, 2);
                $overallCount = (int)$overallData->cnt_all;
            }
        }

        return Inertia::render('monev-templates/Detail', [
            'template' => $template,
            'recap' => [
                'per_question' => $agg,
                'overall' => ['avg' => $overallAvg, 'count' => $overallCount],
            ],
            'canManage' => (bool) ($user && $user->can('monev-manage')),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeManage($request);
        $data = $request->validate([
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ]);
        MonevTemplate::create($data);
        return back();
    }

    public function update(Request $request, $id)
    {
        $this->authorizeManage($request);
        $template = MonevTemplate::findOrFail($id);
        $data = $request->validate([
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ]);
        $template->update($data);
        return back();
    }

    public function destroy(Request $request, $id)
    {
        $this->authorizeManage($request);
        $template = MonevTemplate::findOrFail($id);
        $template->delete();
        return back();
    }

    public function storeQuestion(Request $request, $templateId)
    {
        $this->authorizeManage($request);
        $template = MonevTemplate::findOrFail($templateId);
        $data = $request->validate([
            'pertanyaan' => 'required|string',
            'urutan' => 'nullable|integer|min:0',
            'tipe' => 'nullable|in:rating_1_5',
            'aspek_penilaian' => 'nullable|string',
            'skala' => 'nullable|array',
        ]);
        $template->questions()->create([
            'pertanyaan' => $data['pertanyaan'],
            'urutan' => $data['urutan'] ?? 0,
            'tipe' => $request->input('tipe', 'rating_1_5'),
            'aspek_penilaian' => $data['aspek_penilaian'] ?? null,
            'skala' => $data['skala'] ?? null,
        ]);
        return back();
    }

    public function updateQuestion(Request $request, $templateId, $questionId)
    {
        $this->authorizeManage($request);
        $q = MonevTemplateQuestion::where('template_id', $templateId)->findOrFail($questionId);
        $data = $request->validate([
            'pertanyaan' => 'required|string',
            'urutan' => 'nullable|integer|min:0',
            'tipe' => 'nullable|in:rating_1_5',
            'aspek_penilaian' => 'nullable|string',
            'skala' => 'nullable|array',
        ]);
        $q->update($data);
        return back();
    }

    public function destroyQuestion(Request $request, $templateId, $questionId)
    {
        $this->authorizeManage($request);
        $q = MonevTemplateQuestion::where('template_id', $templateId)->findOrFail($questionId);
        $q->delete();
        return back();
    }

    public function reorderQuestions(Request $request, $templateId)
    {
        $this->authorizeManage($request);
        $validated = $request->validate([
            'orders' => 'required|array|min:1',
            'orders.*.id' => 'required|integer|exists:monev_template_questions,id',
            'orders.*.urutan' => 'required|integer|min:0',
        ]);
        $ids = MonevTemplateQuestion::where('template_id', $templateId)->pluck('id')->toArray();
        foreach ($validated['orders'] as $item) {
            if (!in_array($item['id'], $ids, true)) continue;
            MonevTemplateQuestion::where('id', $item['id'])->update(['urutan' => $item['urutan']]);
        }
        return back()->with('status', 'Urutan pertanyaan diperbarui');
    }

    private function authorizeManage(Request $request): void
    {
        $user = $request->user();
        abort_unless($user && $user->can('monev-manage'), 403);
    }

    public function duplicate(Request $request, $id)
    {
        $this->authorizeManage($request);
        $src = MonevTemplate::with('questions')->findOrFail($id);
        $new = MonevTemplate::create([
            'nama' => $src->nama.' (Copy)',
            'deskripsi' => $src->deskripsi,
        ]);
        foreach ($src->questions as $q) {
            $new->questions()->create([
                'pertanyaan' => $q->pertanyaan,
                'tipe' => $q->tipe,
                'keterangan' => $q->keterangan,
                'aspek_penilaian' => $q->aspek_penilaian,
                'skala' => $q->skala,
                'urutan' => $q->urutan,
            ]);
        }
        if ($request->boolean('stay')) {
            // Stay on the same page (e.g., index) and let client reload data
            return back()->with('status','Template diduplikasi');
        }
        return redirect()->route('monev-templates.show', $new->id)->with('status','Template diduplikasi');
    }

    public function exportRecap(Request $request, $id)
    {
        $this->authorizeManage($request);
        $template = MonevTemplate::with(['questions' => function($q){ $q->orderBy('urutan'); }])->findOrFail($id);
        $questionIds = $template->questions->pluck('id');
        $rows = [];
        $rows[] = ['Urutan', 'Pertanyaan', 'Rata-rata', 'Jumlah Jawaban'];
        if ($questionIds->count() > 0) {
            $agg = DB::table('monev_answers')
                ->select('question_id', DB::raw('AVG(nilai) as avg_nilai'), DB::raw('COUNT(nilai) as cnt'))
                ->whereIn('question_id', $questionIds)
                ->groupBy('question_id')
                ->get()
                ->keyBy('question_id');
            foreach ($template->questions as $q) {
                $r = $agg->get($q->id);
                $rows[] = [
                    $q->urutan,
                    $q->pertanyaan,
                    $r ? round((float)$r->avg_nilai, 2) : '',
                    $r ? (int)$r->cnt : 0,
                ];
            }
        }

        $filename = 'rekap_template_'.$template->id.'.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($rows) {
            $fh = fopen('php://output', 'w');
            foreach ($rows as $line) {
                fputcsv($fh, $line);
            }
            fclose($fh);
        };

        return response()->stream($callback, 200, $headers);
    }
}

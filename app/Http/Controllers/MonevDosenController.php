<?php

namespace App\Http\Controllers;

use App\Models\SurveyAssignment;
use App\Models\SurveyAnswer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MonevDosenController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->can('monev-dosen-view')) {
            abort(403);
        }

        $assignments = SurveyAssignment::with(['survey'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('monev-dosen/Index', [
            'assignments' => $assignments,
        ]);
    }

    public function show(Request $request, SurveyAssignment $assignment)
    {
        if (!$request->user()->can('monev-dosen-view')) {
            abort(403);
        }
        if ($assignment->user_id !== $request->user()->id) {
            abort(403);
        }

        $assignment->load(['survey.questions.options', 'answers']);

        return Inertia::render('monev-dosen/Fill', [
            'assignment' => $assignment,
        ]);
    }

    public function submit(Request $request, SurveyAssignment $assignment)
    {
        if (!$request->user()->can('monev-dosen-view')) {
            abort(403);
        }
        if ($assignment->user_id !== $request->user()->id) {
            abort(403);
        }
        if ($assignment->status === 'submitted') {
            throw ValidationException::withMessages(['assignment' => 'Survei sudah disubmit.']);
        }

        $data = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|integer',
            'answers.*.value_text' => 'nullable|string',
            'answers.*.value_numeric' => 'nullable|numeric',
        ]);

        DB::transaction(function () use ($assignment, $data) {
            foreach ($data['answers'] as $ans) {
                SurveyAnswer::updateOrCreate(
                    [
                        'assignment_id' => $assignment->id,
                        'question_id' => $ans['question_id'],
                    ],
                    [
                        'value_text' => $ans['value_text'] ?? null,
                        'value_numeric' => $ans['value_numeric'] ?? null,
                    ]
                );
            }

            $assignment->update([
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);
        });

        return redirect()->route('monev-dosen.index')->with('success', 'Terima kasih, jawaban Anda telah direkam.');
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Survey;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SurveyController extends Controller
{
    public function index()
    {
        $surveys = Survey::query()
            ->select(['id','name','is_active','starts_at','ends_at','created_at'])
            ->withCount(['questions','assignments'])
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/surveys/Index', [
            'surveys' => $surveys,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/surveys/Edit', [
            'survey' => null,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'is_active' => ['boolean'],
            'starts_at' => ['nullable','date'],
            'ends_at' => ['nullable','date','after_or_equal:starts_at'],
        ]);
        $survey = Survey::create($data);
        return redirect()->route('admin.surveys.edit', $survey)->with('success','Survey created');
    }

    public function edit(Survey $survey)
    {
        $survey->load(['questions.options']);
        return Inertia::render('admin/surveys/Edit', [
            'survey' => $survey,
        ]);
    }

    public function update(Request $request, Survey $survey)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'is_active' => ['boolean'],
            'starts_at' => ['nullable','date'],
            'ends_at' => ['nullable','date','after_or_equal:starts_at'],
        ]);
        $survey->update($data);
        return back()->with('success','Survey updated');
    }

    public function destroy(Survey $survey)
    {
        $survey->delete();
        return redirect()->route('admin.surveys.index')->with('success','Survey deleted');
    }
}

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
            ->select(['id','name','description','is_active','starts_at','ends_at','created_at'])
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
        // Normalize boolean in case checkbox is unchecked/not sent
        $data['is_active'] = $request->boolean('is_active');
        Survey::create($data);
        return back()->with('success','Survey created');
    }

    public function edit(Survey $survey)
    {
        $survey->load(['questions.options']);
        return Inertia::render('admin/surveys/Detail', [
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
        $data['is_active'] = $request->boolean('is_active');
        $survey->update($data);
        return back()->with('success','Survey updated');
    }

    public function destroy(Survey $survey)
    {
        $survey->delete();
        return redirect()->route('admin.surveys.index')->with('success','Survey deleted');
    }
}

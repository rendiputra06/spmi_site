<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SurveyOption;
use App\Models\SurveyQuestion;
use Illuminate\Http\Request;

class SurveyOptionController extends Controller
{
    public function store(Request $request, SurveyQuestion $question)
    {
        $data = $request->validate([
            'label' => ['required','string','max:255'],
            'value' => ['required','integer'],
            'order' => ['nullable','integer','min:0'],
        ]);
        $data['order'] = $data['order'] ?? ($question->options()->max('order') + 1);
        $data['question_id'] = $question->id;
        SurveyOption::create($data);
        return back()->with('success','Option added');
    }

    public function update(Request $request, SurveyQuestion $question, SurveyOption $option)
    {
        abort_unless($option->question_id === $question->id, 404);
        $data = $request->validate([
            'label' => ['required','string','max:255'],
            'value' => ['required','integer'],
            'order' => ['nullable','integer','min:0'],
        ]);
        $option->update($data);
        return back()->with('success','Option updated');
    }

    public function destroy(SurveyQuestion $question, SurveyOption $option)
    {
        abort_unless($option->question_id === $question->id, 404);
        $option->delete();
        return back()->with('success','Option deleted');
    }

    public function reorder(Request $request, SurveyQuestion $question)
    {
        $payload = $request->validate([
            'ids' => ['required','array'],
            'ids.*' => ['integer','exists:survey_options,id']
        ]);
        foreach ($payload['ids'] as $index => $id) {
            SurveyOption::where('id', $id)->where('question_id', $question->id)->update(['order' => $index + 1]);
        }
        return back()->with('success','Options reordered');
    }
}

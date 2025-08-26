<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Survey;
use App\Models\SurveyQuestion;
use Illuminate\Http\Request;

class SurveyQuestionController extends Controller
{
    public function store(Request $request, Survey $survey)
    {
        $data = $request->validate([
            'section' => ['nullable','string','max:255'],
            'text' => ['required','string'],
            'type' => ['required','in:likert,text'],
            'required' => ['boolean'],
            'order' => ['nullable','integer','min:0'],
        ]);
        $data['required'] = $data['required'] ?? true;
        $data['order'] = $data['order'] ?? ($survey->questions()->max('order') + 1);
        $data['survey_id'] = $survey->id;
        $question = SurveyQuestion::create($data);
        return back()->with('success', 'Question added')->with('focus', 'q-'.$question->id);
    }

    public function update(Request $request, Survey $survey, SurveyQuestion $question)
    {
        abort_unless($question->survey_id === $survey->id, 404);
        $data = $request->validate([
            'section' => ['nullable','string','max:255'],
            'text' => ['required','string'],
            'type' => ['required','in:likert,text'],
            'required' => ['boolean'],
            'order' => ['nullable','integer','min:0'],
        ]);
        $question->update($data);
        return back()->with('success', 'Question updated');
    }

    public function destroy(Survey $survey, SurveyQuestion $question)
    {
        abort_unless($question->survey_id === $survey->id, 404);
        $question->delete();
        return back()->with('success','Question deleted');
    }

    public function reorder(Request $request, Survey $survey)
    {
        $payload = $request->validate([
            'ids' => ['required','array'],
            'ids.*' => ['integer','exists:survey_questions,id']
        ]);
        foreach ($payload['ids'] as $index => $id) {
            SurveyQuestion::where('id', $id)->where('survey_id', $survey->id)->update(['order' => $index + 1]);
        }
        return back()->with('success','Questions reordered');
    }
}

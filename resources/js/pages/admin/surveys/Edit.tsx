import React from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

type SurveyForm = {
  name: string;
  description: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  section: string;
  text: string;
  type: 'likert' | 'text';
  required: boolean;
};

export default function AdminSurveysEdit() {
  const { props }: any = usePage();
  const survey = props.survey as any | null;

  const { data, setData, post, put, processing, errors, reset } = useForm<SurveyForm>({
    name: survey?.name || '',
    description: survey?.description || '',
    is_active: !!(survey?.is_active ?? true),
    starts_at: survey?.starts_at || '',
    ends_at: survey?.ends_at || '',
    section: '',
    text: '',
    type: 'likert',
    required: true,
  });

  const isCreate = !survey;

  // Local UI state for managing adding options per question
  const [optionDrafts, setOptionDrafts] = React.useState<Record<number, { label: string; value: string }>>({});
  const [recentlySuccessful, setRecentlySuccessful] = React.useState(false);

  const setOptionDraft = (qId: number, field: 'label' | 'value', value: string) => {
    setOptionDrafts((prev) => ({ ...prev, [qId]: { label: prev[qId]?.label || '', value: prev[qId]?.value || '', [field]: value } }));
  };

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '#' },
    { title: 'Surveys', href: '/admin/surveys' },
    { title: isCreate ? 'Create' : `Edit: ${survey?.name}`, href: '#' },
  ];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreate) {
      post('/admin/surveys', {
        onSuccess: () => {
          setRecentlySuccessful(true);
          setTimeout(() => setRecentlySuccessful(false), 2000);
        }
      });
    } else {
      put(`/admin/surveys/${survey.id}` , {
        onSuccess: () => {
          setRecentlySuccessful(true);
          setTimeout(() => setRecentlySuccessful(false), 2000);
        }
      });
    }
  };

  const addQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;
    post(`/admin/surveys/${survey.id}/questions`, {
      preserveScroll: true,
      onSuccess: () => {
        reset('section', 'text', 'type', 'required');
        setData('type', 'likert');
        setData('required', true);
        setRecentlySuccessful(true);
        setTimeout(() => setRecentlySuccessful(false), 2000);
      },
      data: {
        section: data.section,
        text: data.text,
        type: data.type,
        required: data.required,
      }
    } as any);
  };

  const deleteQuestion = (qId: number) => {
    if (!survey) return;
    router.delete(`/admin/surveys/${survey.id}/questions/${qId}`, {
      preserveScroll: true,
      onSuccess: () => {
        setRecentlySuccessful(true);
        setTimeout(() => setRecentlySuccessful(false), 2000);
      }
    });
  };

  const addOption = (qId: number) => {
    const draft = optionDrafts[qId] || { label: '', value: '' };
    if (!draft.label || draft.value === '') return;
    router.post(`/admin/questions/${qId}/options`, { label: draft.label, value: Number(draft.value) }, {
      preserveScroll: true,
      onSuccess: () => {
        setOptionDrafts((prev) => ({ ...prev, [qId]: { label: '', value: '' } }));
        setRecentlySuccessful(true);
        setTimeout(() => setRecentlySuccessful(false), 2000);
      },
    });
  };

  const deleteOption = (qId: number, optionId: number) => {
    router.delete(`/admin/questions/${qId}/options/${optionId}`, { preserveScroll: true, onSuccess: () => {
      setRecentlySuccessful(true);
      setTimeout(() => setRecentlySuccessful(false), 2000);
    }});
  };

  // Reorder helpers
  const reorderQuestions = (ids: number[]) => {
    if (!survey) return;
    router.post(`/admin/surveys/${survey.id}/questions/reorder`, { ids }, { preserveScroll: true });
  };
  const moveQuestion = (qId: number, dir: -1 | 1) => {
    if (!survey?.questions) return;
    const ids = survey.questions.map((q: any) => q.id);
    const idx = ids.indexOf(qId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= ids.length) return;
    const swapped = [...ids];
    const [it] = swapped.splice(idx, 1);
    swapped.splice(newIdx, 0, it);
    reorderQuestions(swapped);
  };
  const moveOption = (q: any, optionId: number, dir: -1 | 1) => {
    const ids = (q.options || []).map((o: any) => o.id);
    const idx = ids.indexOf(optionId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= ids.length) return;
    const swapped = [...ids];
    const [it] = swapped.splice(idx, 1);
    swapped.splice(newIdx, 0, it);
    router.post(`/admin/questions/${q.id}/options/reorder`, { ids: swapped }, { preserveScroll: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs} title={isCreate ? 'Create Survey' : 'Edit Survey'}>
      <Head title={isCreate ? 'Create Survey' : 'Edit Survey'} />

      <form onSubmit={onSubmit} className="space-y-4 max-w-3xl">
        {recentlySuccessful && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">Tersimpan</div>
        )}
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input className="input" value={data.name} onChange={e => setData('name', e.target.value)} />
          {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea className="textarea" value={data.description} onChange={e => setData('description', e.target.value)} />
          {errors.description && <div className="text-sm text-red-600">{errors.description}</div>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active
          </label>
          <div>
            <label className="block text-sm font-medium">Starts At</label>
            <input type="datetime-local" className="input" value={data.starts_at || ''} onChange={e => setData('starts_at', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Ends At</label>
            <input type="datetime-local" className="input" value={data.ends_at || ''} onChange={e => setData('ends_at', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button disabled={processing} type="submit">{isCreate ? 'Create' : 'Save'}</Button>
          <Link href="/admin/surveys" className="btn">Cancel</Link>
        </div>
      </form>

      {!isCreate && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-3">Questions</h2>

          <form onSubmit={addQuestion} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium">Section</label>
              <input className="input" value={data.section} onChange={e => setData('section', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Text</label>
              <input className="input" value={data.text} onChange={e => setData('text', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Type</label>
              <select className="input" value={data.type} onChange={e => setData('type', e.target.value as SurveyForm['type'])}>
                <option value="likert">Likert</option>
                <option value="text">Text</option>
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.required} onChange={e => setData('required', e.target.checked)} /> Required
            </label>
            <Button type="submit" variant="outline" disabled={processing}>Add Question</Button>
          </form>

          <div className="mt-4 space-y-3">
            {(survey?.questions || []).map((q: any) => (
              <div key={q.id} className="border p-3 rounded">
                <div className="font-medium flex items-center justify-between gap-2">
                  <div>{q.section ? `[${q.section}] ` : ''}{q.text} <span className="text-xs">({q.type}{q.required ? ', required' : ''})</span></div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => moveQuestion(q.id, -1)}>Naik</Button>
                    <Button type="button" variant="outline" onClick={() => moveQuestion(q.id, 1)}>Turun</Button>
                  </div>
                </div>
                {q.type === 'likert' && (
                  <ul className="list-disc ml-6">
                    {(q.options || []).map((o: any) => (
                      <li key={o.id} className="flex items-center gap-2">
                        <span>{o.label} ({o.value})</span>
                        <div className="ml-auto flex items-center gap-2">
                          <Button type="button" variant="outline" onClick={() => moveOption(q, o.id, -1)}>▲</Button>
                          <Button type="button" variant="outline" onClick={() => moveOption(q, o.id, 1)}>▼</Button>
                          <button type="button" className="text-red-600 text-xs" onClick={() => deleteOption(q.id, o.id)}>hapus</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {q.type === 'likert' && (
                  <div className="mt-2 flex gap-2 items-end">
                    <div>
                      <label className="block text-xs text-gray-600">Label</label>
                      <input className="input" value={optionDrafts[q.id]?.label || ''} onChange={e => setOptionDraft(q.id, 'label', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">Value</label>
                      <input type="number" className="input w-24" value={optionDrafts[q.id]?.value || ''} onChange={e => setOptionDraft(q.id, 'value', e.target.value)} />
                    </div>
                    <Button type="button" variant="secondary" onClick={() => addOption(q.id)}>Tambah Opsi</Button>
                  </div>
                )}
                <div className="mt-2">
                  <button type="button" className="text-red-600 text-sm" onClick={() => deleteQuestion(q.id)}>Hapus Pertanyaan</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

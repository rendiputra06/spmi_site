import React, { useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';

interface Option { id: number; label: string; value: number; }
interface Question {
  id: number;
  section?: string | null;
  text: string;
  type: 'likert' | 'text';
  required: boolean;
  options?: Option[];
}
interface Survey { id: number; name: string; description?: string | null; questions: Question[]; }
interface Answer { question_id: number; value_text?: string | null; value_numeric?: number | null }
interface Assignment { id: number; status: 'draft' | 'submitted'; survey: Survey; answers?: { question_id: number; value_text?: string | null; value_numeric?: number | null }[] }

interface PageProps { assignment: Assignment }

export default function Fill({ assignment }: PageProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Monev Dosen', href: '/monev-dosen' },
    { title: assignment.survey.name, href: `/monev-dosen/assignments/${assignment.id}` },
  ];

  const initial = useMemo(() => {
    const map = new Map<number, Answer>();
    assignment.answers?.forEach(a => map.set(a.question_id, { ...a }));
    return assignment.survey.questions.map(q => {
      const prev = map.get(q.id);
      return {
        question_id: q.id,
        value_text: prev?.value_text ?? null,
        value_numeric: prev?.value_numeric ?? null,
      } as Answer;
    });
  }, [assignment]);

  const { data, setData, post, processing, errors } = useForm<any>({ answers: initial });

  const onChangeLikert = (qid: number, val: number) => {
    setData('answers', (data.answers as Answer[]).map((a: Answer) => a.question_id === qid ? { ...a, value_numeric: val } : a));
  };
  const onChangeText = (qid: number, val: string) => {
    setData('answers', (data.answers as Answer[]).map((a: Answer) => a.question_id === qid ? { ...a, value_text: val } : a));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/monev-dosen/assignments/${assignment.id}/submit`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs} title={assignment.survey.name}>
      <Head title={assignment.survey.name} />
      <form onSubmit={onSubmit} className="p-4 md:p-6 space-y-4">
        <Card className="p-6 space-y-2">
          <div className="text-xl font-semibold">{assignment.survey.name}</div>
          {assignment.survey.description && (
            <div className="text-sm text-muted-foreground">{assignment.survey.description}</div>
          )}
        </Card>

        {assignment.survey.questions.map((q, idx) => (
          <Card key={q.id} className="p-5 space-y-3">
            <div className="flex items-start gap-2">
              <Label htmlFor={`q-${q.id}`} className="font-medium">
                {idx + 1}. {q.text} {q.required && <span className="text-red-500">*</span>}
              </Label>
            </div>

            {q.type === 'likert' ? (
              <ToggleGroup
                id={`q-${q.id}`}
                type="single"
                value={String((data.answers as Answer[]).find((a: Answer) => a.question_id === q.id)?.value_numeric ?? '')}
                onValueChange={(v) => v && onChangeLikert(q.id, Number(v))}
                className="flex flex-wrap gap-2"
              >
                {(q.options || []).map(opt => (
                  <ToggleGroupItem key={opt.id} value={String(opt.value)} aria-label={opt.label}>
                    {opt.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            ) : (
              <Textarea
                id={`q-${q.id}`}
                value={(data.answers as Answer[]).find((a: Answer) => a.question_id === q.id)?.value_text ?? ''}
                onChange={(e) => onChangeText(q.id, e.target.value)}
                placeholder="Tulis jawaban Anda"
              />
            )}

            {errors.answers && (
              <div className="text-sm text-red-500">{(errors as any).answers}</div>
            )}
          </Card>
        ))}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={processing || assignment.status === 'submitted'}>
            {assignment.status === 'submitted' ? 'Sudah Disubmit' : 'Submit'}
          </Button>
          <Button asChild variant="outline">
            <Link href="/monev-dosen">Kembali</Link>
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}

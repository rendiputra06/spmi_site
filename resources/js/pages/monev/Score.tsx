import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { router, useForm } from '@inertiajs/react';
import React from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface EvaluationLite {
  id: number;
  area: string;
  unit: { id: number; nama: string };
  mata_kuliah: { id: number; nama: string };
}

interface Question {
  id: number;
  urutan: number;
  pertanyaan: string;
  aspek_penilaian?: string | null;
  skala?: string[] | null;
}

interface TemplateLite {
  id: number;
  nama: string;
  questions: Question[];
}

interface Props {
  evaluation: EvaluationLite;
  template: TemplateLite;
  answers: Record<string, number | null>;
}

export default function MonevScore({ evaluation, template, answers }: Props) {
  const { processing } = useForm();
  const [scores, setScores] = React.useState<Record<number, { nilai: number | null; catatan?: string }>>(() => {
    const init: Record<number, { nilai: number | null; catatan?: string }> = {};
    for (const q of template.questions) {
      const existing = answers[String(q.id)];
      init[q.id] = { nilai: typeof existing === 'number' ? existing : null, catatan: '' };
    }
    return init;
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      scores: Object.entries(scores).map(([qid, v]) => ({ question_id: Number(qid), nilai: v.nilai ?? null, catatan: v.catatan || null })),
    };
    router.post(`/monev/evaluations/${evaluation.id}/score`, payload, {
      preserveScroll: true,
      onSuccess: () => { toast.success('Skor berhasil disimpan'); router.reload({ only: [] }); },
    });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Kegiatan', href: '#' },
        { title: 'Monev', href: '/monev' },
        { title: 'Skoring', href: '#' },
      ]}
      title={`Skor: ${evaluation.mata_kuliah.nama} • ${evaluation.unit.nama}`}
    >
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Mulai Evaluasi</h2>
            <div className="text-sm text-muted-foreground">Area: {evaluation.area} • Template: {template.nama}</div>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-lg border divide-y">
            {template.questions.map((q) => (
              <div key={q.id} className="p-4 grid gap-2">
                <div className="font-medium">{q.urutan}. {q.pertanyaan}</div>
                {q.aspek_penilaian && (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{q.aspek_penilaian}</div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {[1,2,3,4,5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setScores(prev => ({ ...prev, [q.id]: { ...prev[q.id], nilai: n } }))}
                      className={`h-9 px-3 rounded border text-sm ${scores[q.id]?.nilai === n ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                    >
                      {n}{q.skala && q.skala[n-1] ? ` • ${q.skala[n-1]}` : ''}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setScores(prev => ({ ...prev, [q.id]: { ...prev[q.id], nilai: null } }))}
                    className={`h-9 px-3 rounded border text-sm ${scores[q.id]?.nilai == null ? 'bg-muted' : ''}`}
                  >
                    Kosongkan
                  </button>
                </div>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="Catatan (opsional)"
                  value={scores[q.id]?.catatan || ''}
                  onChange={(e) => setScores(prev => ({ ...prev, [q.id]: { ...prev[q.id], catatan: e.target.value } }))}
                  rows={2}
                />
              </div>
            ))}
          </div>
          {/* Total score */}
          <div className="flex items-center justify-end text-sm text-muted-foreground">
            <div className="rounded-md border px-3 py-1">Total skor: <span className="font-semibold text-foreground">{
              Object.values(scores).reduce((sum, v) => sum + (typeof v.nilai === 'number' ? v.nilai : 0), 0)
            }</span></div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="submit" disabled={processing}>
              <Save className="h-4 w-4 mr-2" /> Simpan Skor
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

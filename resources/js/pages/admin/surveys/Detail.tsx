import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { SurveyHeaderCard } from './components/SurveyHeaderCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, Pencil } from 'lucide-react';

export default function AdminSurveysDetail() {
  const { props }: any = usePage();
  const survey = props.survey as any;

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '#' },
    { title: 'Surveys', href: '/admin/surveys' },
    { title: `Detail: ${survey?.name ?? ''}`, href: '#' },
  ];


  // Question form state
  const [qSection, setQSection] = React.useState('');
  const [qText, setQText] = React.useState('');
  const [qType, setQType] = React.useState<'likert' | 'text'>('likert');
  const [qRequired, setQRequired] = React.useState(true);
  const [openAddQ, setOpenAddQ] = React.useState(false);

  // Edit Question state
  const [openEditQ, setOpenEditQ] = React.useState(false);
  const [editQ, setEditQ] = React.useState<any | null>(null);
  const [qEditSection, setQEditSection] = React.useState('');
  const [qEditText, setQEditText] = React.useState('');
  const [qEditType, setQEditType] = React.useState<'likert' | 'text'>('likert');
  const [qEditRequired, setQEditRequired] = React.useState(true);

  const openQuestionEditor = (q: any) => {
    setEditQ(q);
    setQEditSection(q.section || '');
    setQEditText(q.text || '');
    setQEditType(q.type || 'likert');
    setQEditRequired(!!q.required);
    setOpenEditQ(true);
  };

  const submitEditQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey || !editQ) return;
    router.put(`/admin/surveys/${survey.id}/questions/${editQ.id}`,
      {
        section: qEditSection || undefined,
        text: qEditText,
        type: qEditType,
        required: qEditRequired,
      },
      { preserveScroll: true, onSuccess: () => setOpenEditQ(false) }
    );
  };

  // Edit Option state
  const [openEditOpt, setOpenEditOpt] = React.useState(false);
  const [editOpt, setEditOpt] = React.useState<{ qId: number; id: number; label: string; value: number } | null>(null);
  const [optLabel, setOptLabel] = React.useState('');
  const [optValue, setOptValue] = React.useState('');

  const openOptionEditor = (q: any, o: any) => {
    setEditOpt({ qId: q.id, id: o.id, label: o.label, value: o.value });
    setOptLabel(o.label || '');
    setOptValue(String(o.value ?? ''));
    setOpenEditOpt(true);
  };

  const submitEditOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOpt) return;
    router.put(`/admin/questions/${editOpt.qId}/options/${editOpt.id}`,
      { label: optLabel, value: Number(optValue) },
      { preserveScroll: true, onSuccess: () => setOpenEditOpt(false) }
    );
  };

  const addQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;
    router.post(`/admin/surveys/${survey.id}/questions`, {
      section: qSection || undefined,
      text: qText,
      type: qType,
      required: qRequired,
    }, { preserveScroll: true, onSuccess: () => { setQSection(''); setQText(''); setQType('likert'); setQRequired(true); } });
  };

  // ----- Drag & Drop (Questions) -----
  const [dragQId, setDragQId] = React.useState<number | null>(null);
  const onQuestionDragStart = (e: React.DragEvent, qId: number) => {
    setDragQId(qId);
    // Create custom ghost image
    const el = (e.currentTarget as HTMLElement);
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    clone.style.opacity = '0.85';
    clone.style.transform = 'scale(0.98)';
    clone.style.pointerEvents = 'none';
    clone.style.position = 'absolute';
    clone.style.top = '-1000px';
    document.body.appendChild(clone);
    e.dataTransfer?.setDragImage(clone, clone.offsetWidth / 2, 20);
    // Remove the clone after the current event loop tick
    setTimeout(() => {
      if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
    }, 0);
  };
  const onQuestionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const onQuestionDrop = (targetQId: number) => {
    if (dragQId == null || dragQId === targetQId) return;
    const ids = (survey.questions || []).map((q: any) => q.id);
    const from = ids.indexOf(dragQId);
    const to = ids.indexOf(targetQId);
    if (from === -1 || to === -1) return;
    const next = [...ids];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    reorderQuestions(next);
    setDragQId(null);
  };

  // ----- Drag & Drop (Options) -----
  const [dragOpt, setDragOpt] = React.useState<{ qId: number; optionId: number } | null>(null);
  const onOptionDragStart = (e: React.DragEvent, qId: number, optionId: number) => {
    setDragOpt({ qId, optionId });
    const el = (e.currentTarget as HTMLElement);
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
    clone.style.opacity = '0.9';
    clone.style.transform = 'scale(0.98)';
    clone.style.pointerEvents = 'none';
    clone.style.position = 'absolute';
    clone.style.top = '-1000px';
    document.body.appendChild(clone);
    e.dataTransfer?.setDragImage(clone, 24, 12);
    setTimeout(() => {
      if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
    }, 0);
  };
  const onOptionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const onOptionDrop = (q: any, targetOptionId: number) => {
    if (!dragOpt || dragOpt.qId !== q.id || dragOpt.optionId === targetOptionId) return;
    const ids = (q.options || []).map((o: any) => o.id);
    const from = ids.indexOf(dragOpt.optionId);
    const to = ids.indexOf(targetOptionId);
    if (from === -1 || to === -1) return;
    const next = [...ids];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    router.post(`/admin/questions/${q.id}/options/reorder`, { ids: next }, { preserveScroll: true });
    setDragOpt(null);
  };

  const deleteQuestion = (qId: number) => {
    router.delete(`/admin/surveys/${survey.id}/questions/${qId}`, { preserveScroll: true });
  };

  const reorderQuestions = (ids: number[]) => {
    router.post(`/admin/surveys/${survey.id}/questions/reorder`, { ids }, { preserveScroll: true });
  };

  const moveQuestion = (qId: number, dir: -1 | 1) => {
    const ids = (survey.questions || []).map((q: any) => q.id);
    const idx = ids.indexOf(qId);
    const ni = idx + dir;
    if (ni < 0 || ni >= ids.length) return;
    const swapped = [...ids];
    const [it] = swapped.splice(idx, 1);
    swapped.splice(ni, 0, it);
    reorderQuestions(swapped);
  };

  const addOption = (qId: number, label: string, value: number) => {
    router.post(`/admin/questions/${qId}/options`, { label, value }, { preserveScroll: true });
  };

  const deleteOption = (qId: number, optionId: number) => {
    router.delete(`/admin/questions/${qId}/options/${optionId}`, { preserveScroll: true });
  };

  const moveOption = (q: any, optionId: number, dir: -1 | 1) => {
    const ids = (q.options || []).map((o: any) => o.id);
    const idx = ids.indexOf(optionId);
    const ni = idx + dir;
    if (ni < 0 || ni >= ids.length) return;
    const swapped = [...ids];
    const [it] = swapped.splice(idx, 1);
    swapped.splice(ni, 0, it);
    router.post(`/admin/questions/${q.id}/options/reorder`, { ids: swapped }, { preserveScroll: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs} title={`Detail Survey`}>
      <Head title={`Detail Survey`} />

      <div className="space-y-6 p-4 md:p-6">
        <SurveyHeaderCard survey={survey} />

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pertanyaan</span>
              <Dialog open={openAddQ} onOpenChange={setOpenAddQ}>
                <DialogTrigger asChild>
                  <Button type="button">Tambah Pertanyaan</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Pertanyaan</DialogTitle>
                    <DialogDescription>Isi detail pertanyaan untuk survey ini.</DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      addQuestion(e);
                      setOpenAddQ(false);
                    }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
                  >
                    <div>
                      <Label>Bagian</Label>
                      <Input value={qSection} onChange={(e) => setQSection(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Teks</Label>
                      <Input value={qText} onChange={(e) => setQText(e.target.value)} />
                    </div>
                    <div>
                      <Label>Jenis</Label>
                      <select
                        className="input w-full border rounded h-9 px-3"
                        value={qType}
                        onChange={(e) => setQType(e.target.value as 'likert' | 'text')}
                      >
                        <option value="likert">Likert</option>
                        <option value="text">Text</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={qRequired} onCheckedChange={(v: any) => setQRequired(!!v)} id="qreq" />
                      <Label htmlFor="qreq">Wajib</Label>
                    </div>
                    <DialogFooter className="md:col-span-4 flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setOpenAddQ(false)}>
                        Batal
                      </Button>
                      <Button type="submit">Simpan</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Edit Question Dialog */}
            <Dialog open={openEditQ} onOpenChange={setOpenEditQ}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Pertanyaan</DialogTitle>
                  <DialogDescription>Ubah detail pertanyaan.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submitEditQuestion} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <Label>Bagian</Label>
                    <Input value={qEditSection} onChange={(e) => setQEditSection(e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Teks</Label>
                    <Input value={qEditText} onChange={(e) => setQEditText(e.target.value)} />
                  </div>
                  <div>
                    <Label>Jenis</Label>
                    <select className="input w-full border rounded h-9 px-3" value={qEditType} onChange={(e) => setQEditType(e.target.value as 'likert' | 'text')}>
                      <option value="likert">Likert</option>
                      <option value="text">Text</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={qEditRequired} onCheckedChange={(v: any) => setQEditRequired(!!v)} id="qeditreq" />
                    <Label htmlFor="qeditreq">Wajib</Label>
                  </div>
                  <DialogFooter className="md:col-span-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpenEditQ(false)}>Batal</Button>
                    <Button type="submit">Simpan</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <div className="space-y-4">
              {(survey?.questions || []).map((q: any) => (
                <Card
                  key={q.id}
                  draggable
                  onDragStart={(e) => onQuestionDragStart(e, q.id)}
                  onDragOver={onQuestionDragOver}
                  onDrop={() => onQuestionDrop(q.id)}
                  className={dragQId === q.id ? 'opacity-60' : ''}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="truncate flex items-center gap-2">
                        <span className="cursor-grab select-none text-muted-foreground" title="Drag">≡</span>
                        {q.section ? `[${q.section}] ` : ''}{q.text}
                        <span className="ml-2 text-xs text-muted-foreground">({q.type}{q.required ? ', wajib' : ''})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openQuestionEditor(q)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteQuestion(q.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Hapus</span>
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {q.type === 'likert' && (
                      <div className="space-y-2">
                        <ul className="list-disc ml-6">
                          {(q.options || []).map((o: any) => (
                            <li
                              key={o.id}
                              draggable
                              onDragStart={(e) => onOptionDragStart(e, q.id, o.id)}
                              onDragOver={onOptionDragOver}
                              onDrop={() => onOptionDrop(q, o.id)}
                              className={`flex items-center gap-2 ${dragOpt?.optionId === o.id ? 'opacity-60' : ''}`}
                            >
                              <span className="cursor-grab select-none text-muted-foreground" title="Drag">⋮⋮</span>
                              <span>{o.label} ({o.value})</span>
                              <div className="ml-auto flex items-center gap-1">
                                <Button type="button" variant="ghost" size="icon" onClick={() => openOptionEditor(q, o)}>
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit Opsi</span>
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteOption(q.id, o.id)}>
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Hapus Opsi</span>
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-end gap-2">
                          <div>
                            <Label className="text-xs">Label</Label>
                            <Input id={`ol-${q.id}`} />
                          </div>
                          <div>
                            <Label className="text-xs">Value</Label>
                            <Input type="number" id={`ov-${q.id}`} className="w-24" />
                          </div>
                          <Button type="button" variant="secondary" onClick={() => {
                            const l = (document.getElementById(`ol-${q.id}`) as HTMLInputElement)?.value || '';
                            const vStr = (document.getElementById(`ov-${q.id}`) as HTMLInputElement)?.value || '';
                            if (!l || vStr === '') return;
                            addOption(q.id, l, Number(vStr));
                          }}>Tambah Opsi</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

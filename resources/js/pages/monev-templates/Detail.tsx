import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { ArrowLeft, Copy, Plus, Download } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Question { id: number; pertanyaan: string; urutan: number; tipe?: string; aspek_penilaian?: string | null; skala?: string[] | null }

// note: we'll attach drag listeners only to specific cells (order & question)
interface Template { id: number; nama: string; deskripsi?: string | null; questions: Question[] }

interface Props { template: Template; recap?: { per_question: { question_id: number; urutan: number; pertanyaan: string; avg: number | null; count: number }[]; overall: { avg: number | null; count: number } }; canManage?: boolean }

export default function MonevTemplateDetail({ template, recap, canManage = false }: Props) {
  const [questions, setQuestions] = useState<Question[]>([...template.questions]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [editQ, setEditQ] = useState<Question | null>(null);
  const [activeTab, setActiveTab] = useState<'pertanyaan'|'rekap'>('pertanyaan');

  // Local form state for add/edit
  const [form, setForm] = useState<{ pertanyaan: string; urutan: string; aspek_penilaian: string; skala: string[] }>({
    pertanyaan: '', urutan: '0', aspek_penilaian: '', skala: ['', '', '', '', ''],
  });

  const openAdd = () => { setForm({ pertanyaan: '', urutan: String(questions.length + 1), aspek_penilaian: '', skala: ['', '', '', '', ''] }); setAddOpen(true); };
  const openEdit = (q: Question) => {
    setEditQ(q);
    setForm({
      pertanyaan: q.pertanyaan,
      urutan: String(q.urutan),
      aspek_penilaian: q.aspek_penilaian || '',
      skala: (q.skala as any) || ['', '', '', '', ''],
    });
    setEditOpen(true);
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(`/monev-templates/${template.id}/questions`, {
      pertanyaan: form.pertanyaan,
      urutan: Number(form.urutan),
      tipe: 'rating_1_5',
      aspek_penilaian: form.aspek_penilaian || undefined,
      skala: form.skala,
    }, {
      preserveScroll: true,
      onSuccess: () => { toast.success('Pertanyaan ditambahkan'); setAddOpen(false); router.reload({ only: ['template'] }); },
      onError: () => toast.error('Gagal menambahkan pertanyaan'),
    });
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editQ) return;
    router.put(`/monev-templates/${template.id}/questions/${editQ.id}` , {
      pertanyaan: form.pertanyaan,
      urutan: Number(form.urutan),
      tipe: 'rating_1_5',
      aspek_penilaian: form.aspek_penilaian || '',
      skala: form.skala,
    }, {
      preserveScroll: true,
      onSuccess: () => { toast.success('Pertanyaan diperbarui'); setEditOpen(false); setEditQ(null); router.reload({ only: ['template'] }); },
      onError: () => toast.error('Gagal memperbarui pertanyaan'),
    });
  };

  const confirmDelete = (q: Question) => {
    router.delete(`/monev-templates/${template.id}/questions/${q.id}`, {
      preserveScroll: true,
      onSuccess: () => { toast.success('Pertanyaan dihapus'); router.reload({ only: ['template'] }); },
      onError: () => toast.error('Gagal menghapus pertanyaan'),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canManage) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = questions.findIndex((x) => x.id === Number(active.id));
    const newIndex = questions.findIndex((x) => x.id === Number(over.id));
    const moved = arrayMove(questions, oldIndex, newIndex).map((q, idx) => ({ ...q, urutan: idx + 1 } as Question));
    setQuestions(moved);
    // Persist order
    const orders = moved.map((q) => ({ id: q.id, urutan: q.urutan }));
    router.post(`/monev-templates/${template.id}/questions/reorder`, { orders }, {
      preserveScroll: true,
      onSuccess: () => toast.success('Urutan diperbarui'),
      onError: () => toast.error('Gagal memperbarui urutan'),
    });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Kegiatan', href: '#' }, { title: 'Template Monev', href: '/monev-templates' }, { title: template.nama, href: '#' }]} title={`Template: ${template.nama}`}>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{template.nama}</h2>
            {template.deskripsi && <div className="text-sm text-muted-foreground">{template.deskripsi}</div>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.get('/monev-templates')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!canManage}><Copy className="h-4 w-4 mr-2" /> Duplikasi Template</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Duplikasi template "{template.nama}"?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => router.post(`/monev-templates/${template.id}/duplicate`)} disabled={!canManage}>Duplikasi</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button variant={activeTab==='pertanyaan' ? 'default' : 'outline'} onClick={() => setActiveTab('pertanyaan')}>Pertanyaan</Button>
            <Button variant={activeTab==='rekap' ? 'default' : 'outline'} onClick={() => setActiveTab('rekap')}>Rekap Nilai</Button>
          </div>

          {activeTab === 'pertanyaan' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Pertanyaan (Rating 1-5)</h3>
                <Button onClick={openAdd} disabled={!canManage}><Plus className="h-4 w-4 mr-2" /> Tambah Pertanyaan</Button>
              </div>
              <div className="rounded-lg border overflow-x-auto">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={questions.map(q => q.id.toString())} strategy={verticalListSortingStrategy}>
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left w-16">Urut</th>
                          <th className="px-3 py-2 text-left">Pertanyaan</th>
                          
                          <th className="px-3 py-2 text-left">Aspek Penilaian</th>
                          <th className="px-3 py-2 text-left">Label Skala</th>
                          <th className="px-3 py-2 text-right w-48">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {questions.length === 0 && (
                          <tr><td colSpan={6} className="px-3 py-3 text-muted-foreground">Belum ada pertanyaan.</td></tr>
                        )}
                        {questions.map((q) => {
                          const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: q.id.toString() });
                          const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
                          return (
                            <tr key={q.id} ref={setNodeRef} style={style}>
                              <td className="px-3 py-2 align-top select-none">
                                <span className="cursor-grab" {...attributes} {...listeners}>{q.urutan}</span>
                              </td>
                              <td className="px-3 py-2 align-top">
                                <span className="inline-block cursor-grab" {...attributes} {...listeners}>{q.pertanyaan}</span>
                              </td>
                              <td className="px-3 py-2 align-top text-muted-foreground whitespace-pre-wrap">{q.aspek_penilaian}</td>
                              <td className="px-3 py-2 align-top text-muted-foreground">
                                {(Array.isArray(q.skala) ? q.skala : []).map((s, i) => (
                                  <div key={i}>{i+1}. {s}</div>
                                ))}
                              </td>
                              <td className="px-3 py-2 align-top">
                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline" onClick={() => openEdit(q)} disabled={!canManage}>Edit</Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" disabled={!canManage}>Hapus</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Hapus pertanyaan ini?</AlertDialogTitle>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => confirmDelete(q)} disabled={!canManage}>Hapus</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          )}

          {activeTab === 'rekap' && recap && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Rekap Nilai</h3>
                <Button variant="outline" onClick={() => window.open(`/monev-templates/${template.id}/export-recap`, '_blank')}>
                  <Download className="h-4 w-4 mr-2" /> Export CSV
                </Button>
              </div>
              <div className="rounded-md border">
                <div className="p-3 text-sm">Rata-rata keseluruhan: <span className="font-semibold">{recap.overall.avg ?? '-'}</span> ({recap.overall.count} jawaban)</div>
                <div className="divide-y">
                  {(recap.per_question || []).map(r => (
                    <div key={r.question_id} className="p-3 text-sm flex items-center justify-between gap-3">
                      <div className="min-w-0 truncate">{r.urutan}. {r.pertanyaan}</div>
                      <div className="shrink-0">Avg: <span className="font-medium">{r.avg ?? '-'}</span> ({r.count})</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

          {/* Modal Add */}
          <Dialog open={isAddOpen} onOpenChange={setAddOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pertanyaan</DialogTitle>
              </DialogHeader>
              <form className="grid gap-3" onSubmit={submitAdd}>
                <div>
                  <label className="text-xs">Urutan</label>
                  <Input value={form.urutan} onChange={(e) => setForm({ ...form, urutan: e.target.value })} type="number" />
                </div>
                <div>
                  <label className="text-xs">Aspek Penilaian</label>
                  <Textarea rows={3} value={form.aspek_penilaian} onChange={(e) => setForm({ ...form, aspek_penilaian: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs">Label Skala (1..5)</label>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {[0,1,2,3,4].map((i) => (
                      <Input key={i} value={form.skala[i] || ''} onChange={(e) => { const next = [...form.skala]; next[i] = e.target.value; setForm({ ...form, skala: next }); }} placeholder={`Label ${i+1}`} />
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                    <span className="inline-flex items-center"><span className="mr-2">✕</span> Batal</span>
                  </Button>
                  <Button type="submit" disabled={!canManage}>
                    <span className="inline-flex items-center"><span className="mr-2">＋</span> Tambah</span>
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Modal Edit */}
          <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Pertanyaan</DialogTitle>
              </DialogHeader>
              <form className="grid gap-3" onSubmit={submitEdit}>
                <div>
                  <label className="text-xs">Pertanyaan</label>
                  <Input value={form.pertanyaan} onChange={(e) => setForm({ ...form, pertanyaan: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs">Aspek Penilaian</label>
                  <Textarea rows={3} value={form.aspek_penilaian} onChange={(e) => setForm({ ...form, aspek_penilaian: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs">Label Skala (1..5)</label>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {[0,1,2,3,4].map((i) => (
                      <Input key={i} value={form.skala[i] || ''} onChange={(e) => { const next = [...form.skala]; next[i] = e.target.value; setForm({ ...form, skala: next }); }} placeholder={`Label ${i+1}`} />
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                    <span className="inline-flex items-center"><span className="mr-2">✕</span> Batal</span>
                  </Button>
                  <Button type="submit" disabled={!canManage}>
                    <span className="inline-flex items-center"><span className="mr-2">💾</span> Simpan</span>
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
      </div>
    </AppLayout>
  );
}

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { router, useForm } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import EvaluationList from './components/EvaluationList';
import EvaluationEditDialog from './components/EvaluationEditDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

interface Unit { id: number; nama: string }
interface Course { id: number; nama: string; unit_id: number }
interface Dosen { id: number; nama: string; nidn?: string; unit_id: number }

interface Evaluation {
  id: number;
  area: string;
  unit: Unit;
  mata_kuliah: Course; 
  mataKuliah?: Course; 
  dosen: Dosen;
}

interface Session { id: number; nama: string }

interface Props {
  session: Session;
  units: Unit[];
  courses: Course[];
  dosens: Dosen[];
  evaluations: Evaluation[];
}

export default function MonevDetail({ session, units, courses, dosens, evaluations }: Props) {
  const { data, setData, post, processing, reset, errors } = useForm({
    area: '',
    unit_id: '' as number | '',
    mata_kuliah_id: '' as number | '',
    dosen_id: '' as number | '',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const coursesByUnit = useMemo(() => {
    const map = new Map<number, Course[]>();
    for (const c of courses) {
      if (!map.has(c.unit_id)) map.set(c.unit_id, []);
      map.get(c.unit_id)!.push(c);
    }
    // sort by nama
    for (const [, arr] of map) arr.sort((a, b) => a.nama.localeCompare(b.nama));
    return map;
  }, [courses]);

  const dosenByUnit = useMemo(() => {
    const map = new Map<number, Dosen[]>();
    for (const d of dosens) {
      if (!map.has(d.unit_id)) map.set(d.unit_id, []);
      map.get(d.unit_id)!.push(d);
    }
    for (const [, arr] of map) arr.sort((a, b) => a.nama.localeCompare(b.nama));
    return map;
  }, [dosens]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/monev/${session.id}/evaluations`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Penugasan evaluasi ditambahkan');
        reset();
        setIsOpen(false);
      },
      onError: () => toast.error('Gagal menambahkan penugasan evaluasi'),
    });
  };

  const openEdit = (ev: Evaluation) => {
    setEditingId(ev.id);
    setData('area', ev.area);
    setData('unit_id', ev.unit?.id || '');
    setData('mata_kuliah_id', ev.mata_kuliah?.id || '');
    setData('dosen_id', ev.dosen?.id || '');
    setEditOpen(true);
  };

  const onUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    router.put(`/monev/evaluations/${editingId}` , data as any, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Penugasan evaluasi diperbarui');
        setEditOpen(false);
        setEditingId(null);
        reset();
      },
      onError: () => toast.error('Gagal memperbarui penugasan evaluasi'),
    });
  };

  const removeEvaluation = (id: number) => {
    router.delete(`/monev/evaluations/${id}` , {
      preserveScroll: true,
      onSuccess: () => toast.success('Penugasan evaluasi dihapus'),
      onError: () => toast.error('Gagal menghapus penugasan evaluasi'),
    });
  };

  const selectedUnitId = data.unit_id ? Number(data.unit_id) : 0;
  const unitCourses = selectedUnitId ? (coursesByUnit.get(selectedUnitId) || []) : [];
  const unitDosens = selectedUnitId ? (dosenByUnit.get(selectedUnitId) || []) : [];

  return (
    <AppLayout breadcrumbs={[{ title: 'Kegiatan', href: '#' }, { title: 'Monev', href: '/monev' }, { title: 'Detail', href: '#' }]} title={`Detail Monev - ${session.nama}`}>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Penugasan Evaluasi Mata Kuliah</h2>
          <Button variant="outline" onClick={() => router.get('/monev')}>Kembali</Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Tambah penugasan evaluasi pada sesi ini</div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>Tambah Penugasan</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Penugasan</DialogTitle>
              </DialogHeader>
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-sm">Area Monev</label>
                  <Input value={data.area} onChange={e => setData('area', e.target.value)} placeholder="Contoh: RPS, Perkuliahan, Asesmen" />
                  {errors.area && <div className="text-xs text-red-500">{errors.area as any}</div>}
                </div>
                <div>
                  <label className="text-sm">Prodi</label>
                  <select className="w-full border rounded-md h-9 px-3" value={data.unit_id} onChange={e => setData('unit_id', e.target.value ? Number(e.target.value) : '')}>
                    <option value="">Pilih Prodi</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>{u.nama}</option>
                    ))}
                  </select>
                  {(errors as any)['unit_id'] && <div className="text-xs text-red-500">{(errors as any)['unit_id']}</div>}
                </div>
                <div>
                  <label className="text-sm">Mata Kuliah</label>
                  <select className="w-full border rounded-md h-9 px-3" value={data.mata_kuliah_id} onChange={e => setData('mata_kuliah_id', e.target.value ? Number(e.target.value) : '')} disabled={!selectedUnitId}>
                    <option value="">Pilih Mata Kuliah</option>
                    {unitCourses.map(c => (
                      <option key={c.id} value={c.id}>{c.nama}</option>
                    ))}
                  </select>
                  {(errors as any)['mata_kuliah_id'] && <div className="text-xs text-red-500">{(errors as any)['mata_kuliah_id']}</div>}
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm">Dosen Pengajar</label>
                  <select className="w-full border rounded-md h-9 px-3" value={data.dosen_id} onChange={e => setData('dosen_id', e.target.value ? Number(e.target.value) : '')} disabled={!selectedUnitId}>
                    <option value="">Pilih Dosen</option>
                    {unitDosens.map(d => (
                      <option key={d.id} value={d.id}>{d.nama}{d.nidn ? ` • ${d.nidn}` : ''}</option>
                    ))}
                  </select>
                  {(errors as any)['dosen_id'] && <div className="text-xs text-red-500">{(errors as any)['dosen_id']}</div>}
                </div>
                <DialogFooter className="md:col-span-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={processing}>Simpan</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <EvaluationList evaluations={evaluations as any} onEdit={openEdit as any} onDelete={removeEvaluation} />

        {/* Edit Modal */}
        <EvaluationEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          data={data as any}
          errors={errors as any}
          processing={processing}
          units={units as any}
          unitCourses={unitCourses as any}
          unitDosens={unitDosens as any}
          selectedUnitId={selectedUnitId}
          setField={(key, value) => setData(key as any, value)}
          onSubmit={onUpdate}
        />
      </div>
    </AppLayout>
  );
}

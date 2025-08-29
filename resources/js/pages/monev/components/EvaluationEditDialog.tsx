import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface Unit { id: number; nama: string }
export interface Course { id: number; nama: string; unit_id: number }
export interface Dosen { id: number; nama: string; nidn?: string; unit_id: number }

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: { area: string; unit_id: number | ''; mata_kuliah_id: number | ''; dosen_id: number | '' };
  errors: Record<string, string>;
  processing?: boolean;
  units: Unit[];
  unitCourses: Course[];
  unitDosens: Dosen[];
  selectedUnitId: number;
  setField: (key: 'area' | 'unit_id' | 'mata_kuliah_id' | 'dosen_id', value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EvaluationEditDialog({ open, onOpenChange, data, errors, processing, units, unitCourses, unitDosens, selectedUnitId, setField, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Penugasan</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm">Area Monev</label>
            <Input value={data.area} onChange={e => setField('area', e.target.value)} />
            {errors.area && <div className="text-xs text-red-500">{errors.area}</div>}
          </div>
          <div>
            <label className="text-sm">Prodi</label>
            <select className="w-full border rounded-md h-9 px-3" value={data.unit_id} onChange={e => setField('unit_id', e.target.value ? Number(e.target.value) : '')}>
              <option value="">Pilih Prodi</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.nama}</option>
              ))}
            </select>
            {errors['unit_id'] && <div className="text-xs text-red-500">{errors['unit_id']}</div>}
          </div>
          <div>
            <label className="text-sm">Mata Kuliah</label>
            <select className="w-full border rounded-md h-9 px-3" value={data.mata_kuliah_id} onChange={e => setField('mata_kuliah_id', e.target.value ? Number(e.target.value) : '')} disabled={!selectedUnitId}>
              <option value="">Pilih Mata Kuliah</option>
              {unitCourses.map(c => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>
            {errors['mata_kuliah_id'] && <div className="text-xs text-red-500">{errors['mata_kuliah_id']}</div>}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Dosen Pengajar</label>
            <select className="w-full border rounded-md h-9 px-3" value={data.dosen_id} onChange={e => setField('dosen_id', e.target.value ? Number(e.target.value) : '')} disabled={!selectedUnitId}>
              <option value="">Pilih Dosen</option>
              {unitDosens.map(d => (
                <option key={d.id} value={d.id}>{d.nama}{d.nidn ? ` • ${d.nidn}` : ''}</option>
              ))}
            </select>
            {errors['dosen_id'] && <div className="text-xs text-red-500">{errors['dosen_id']}</div>}
          </div>
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={processing}>Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

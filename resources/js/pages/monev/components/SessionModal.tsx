import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProdiRow from './ProdiRow';

type PeriodeOpt = { id: number; kode: string; nama: string };
type UnitOpt = { id: number; nama: string };
type DosenOpt = { id: number; nidn?: string; nama: string };

export type ProdiRowValue = { unit_id: number | ''; gjm_dosen_id: number | '' };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  data: {
    nama: string;
    periode_id: number | '';
    tahun: number;
    tanggal_mulai: string;
    tanggal_selesai: string;
    prodis: ProdiRowValue[];
    template_id?: number | '';
  };
  errors: Record<string, any>;
  processing?: boolean;
  periodes: PeriodeOpt[];
  templates?: { id: number; nama: string }[];
  units: UnitOpt[];
  dosens: DosenOpt[];
  onSubmit: (e: React.FormEvent) => void;
  onChangeField: (key: keyof Props['data'], value: any) => void;
  onAddProdi: () => void;
  onChangeProdiUnit: (index: number, value: string) => void;
  onChangeProdiGjm: (index: number, value: string) => void;
  onRemoveProdi: (index: number) => void;
}

export default function SessionModal({ open, onOpenChange, isEditing, data, errors, processing, periodes, templates = [], units, dosens, onSubmit, onChangeField, onAddProdi, onChangeProdiUnit, onChangeProdiGjm, onRemoveProdi }: Props) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? 'flex' : 'hidden'} items-center justify-center bg-black/50`}>
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-background p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">{isEditing ? 'Edit' : 'Tambah'} Sesi Monev</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Nama</label>
              <Input value={data.nama} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeField('nama', e.target.value)} />
              {errors.nama && <div className="text-xs text-red-500">{errors.nama as any}</div>}
            </div>
            <div>
              <label className="text-sm">Template Pertanyaan</label>
              <select className="w-full border rounded-md h-9 px-3" value={data.template_id ?? ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChangeField('template_id', e.target.value ? Number(e.target.value) : '')}>
                <option value="">Tanpa Template</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.nama}</option>
                ))}
              </select>
              {errors['template_id'] && <div className="text-xs text-red-500">{errors['template_id'] as any}</div>}
            </div>
            <div>
              <label className="text-sm">Periode</label>
              <select className="w-full border rounded-md h-9 px-3" value={data.periode_id} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChangeField('periode_id', e.target.value ? Number(e.target.value) : '')}>
                <option value="">Pilih Periode</option>
                {periodes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.kode || p.nama}
                  </option>
                ))}
              </select>
              {errors.periode_id && <div className="text-xs text-red-500">{errors.periode_id as any}</div>}
            </div>
            <div>
              <label className="text-sm">Tahun</label>
              <Input type="number" value={data.tahun} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeField('tahun', Number(e.target.value || new Date().getFullYear()))} />
              {errors.tahun && <div className="text-xs text-red-500">{errors.tahun as any}</div>}
            </div>
            <div>
              <label className="text-sm">Tanggal Mulai</label>
              <Input type="date" value={data.tanggal_mulai} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeField('tanggal_mulai', e.target.value)} />
              {errors.tanggal_mulai && <div className="text-xs text-red-500">{errors.tanggal_mulai as any}</div>}
            </div>
            <div>
              <label className="text-sm">Tanggal Selesai</label>
              <Input type="date" value={data.tanggal_selesai} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeField('tanggal_selesai', e.target.value)} />
              {errors.tanggal_selesai && <div className="text-xs text-red-500">{errors.tanggal_selesai as any}</div>}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">Prodi & GJM</div>
              <Button type="button" variant="outline" onClick={onAddProdi}>
                <Plus className="h-4 w-4 mr-2" /> Tambah Prodi
              </Button>
            </div>
            <div className="space-y-2">
              {data.prodis.map((row, idx) => (
                <ProdiRow
                  key={idx}
                  index={idx}
                  row={row}
                  units={units}
                  dosens={dosens}
                  onChangeUnit={onChangeProdiUnit}
                  onChangeGjm={onChangeProdiGjm}
                  onRemove={onRemoveProdi}
                />
              ))}
              {(errors as any)['prodis'] && <div className="text-xs text-red-500">{(errors as any)['prodis']}</div>}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" /> Batal
            </Button>
            <Button type="submit" disabled={processing}>
              <Save className="h-4 w-4 mr-2" /> {isEditing ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

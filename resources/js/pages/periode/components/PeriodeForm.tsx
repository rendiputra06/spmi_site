import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import React from 'react';
import { PeriodeFormData } from '../types';

type Props = {
  data: PeriodeFormData;
  setData: <K extends keyof PeriodeFormData>(key: K, value: PeriodeFormData[K]) => void;
  errors: Partial<Record<keyof PeriodeFormData, string>> & Record<string, string>;
  processing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEdit?: boolean;
};

export function PeriodeForm({ data, setData, errors, processing, onSubmit, onCancel, isEdit }: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="periode-kode">Kode</Label>
        <Input
          id="periode-kode"
          value={data.kode}
          onChange={(e) => setData('kode', e.target.value)}
          placeholder="Contoh: 2024-GENAP"
          required
          disabled={processing || isEdit}
        />
        <InputError message={errors.kode} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="periode-nama">Nama</Label>
        <Input
          id="periode-nama"
          value={data.nama}
          onChange={(e) => setData('nama', e.target.value)}
          placeholder="Contoh: Semester Genap 2024/2025"
          required
          disabled={processing}
        />
        <InputError message={errors.nama} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="periode-mulai">Mulai</Label>
          <Input
            type="date"
            id="periode-mulai"
            value={data.mulai}
            onChange={(e) => setData('mulai', e.target.value)}
            required
            disabled={processing}
          />
          <InputError message={errors.mulai} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="periode-selesai">Selesai</Label>
          <Input
            type="date"
            id="periode-selesai"
            value={data.selesai}
            onChange={(e) => setData('selesai', e.target.value)}
            required
            disabled={processing}
          />
          <InputError message={errors.selesai} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="periode-keterangan">Keterangan</Label>
        <textarea
          id="periode-keterangan"
          className="min-h-[80px] rounded border p-2 text-sm"
          value={data.keterangan || ''}
          onChange={(e) => setData('keterangan', e.target.value)}
          placeholder="Catatan tambahan"
          disabled={processing}
        />
        <InputError message={errors.keterangan} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="periode-status">Status</Label>
        <select
          id="periode-status"
          className="border rounded h-9 px-3"
          value={data.status ? '1' : '0'}
          onChange={(e) => setData('status', e.target.value === '1')}
          disabled={processing}
        >
          <option value="1">Aktif</option>
          <option value="0">Non-aktif</option>
        </select>
        <InputError message={errors.status as unknown as string} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="periode-active">Jadikan Periode Aktif</Label>
        <select
          id="periode-active"
          className="border rounded h-9 px-3"
          value={data.is_active ? '1' : '0'}
          onChange={(e) => setData('is_active', e.target.value === '1')}
          disabled={processing}
        >
          <option value="1">Ya</option>
          <option value="0">Tidak</option>
        </select>
        <InputError message={errors.is_active as unknown as string} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
          Batal
        </Button>
        <Button type="submit" disabled={processing}>
          {processing ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}

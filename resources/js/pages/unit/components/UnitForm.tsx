import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import React from 'react';
import { Option, UnitFormData } from '../types';

type Props = {
  data: UnitFormData;
  setData: <K extends keyof UnitFormData>(key: K, value: UnitFormData[K]) => void;
  errors: Partial<Record<keyof UnitFormData, string>> & Record<string, string>;
  processing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEdit?: boolean;
  parentOptions: Option[];
  leaderOptions: Option[];
};

export function UnitForm({ data, setData, errors, processing, onSubmit, onCancel, isEdit, parentOptions, leaderOptions }: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="unit-kode">Kode</Label>
        <Input
          id="unit-kode"
          value={data.kode}
          onChange={(e) => setData('kode', e.target.value)}
          placeholder="Contoh: FIK, IF, UNIV"
          required
          disabled={processing || isEdit}
        />
        <InputError message={errors.kode} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="unit-nama">Nama</Label>
        <Input
          id="unit-nama"
          value={data.nama}
          onChange={(e) => setData('nama', e.target.value)}
          placeholder="Contoh: Fakultas Ilmu Komputer"
          required
          disabled={processing}
        />
        <InputError message={errors.nama} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="unit-tipe">Tipe</Label>
        <select
          id="unit-tipe"
          className="border rounded h-9 px-3"
          value={data.tipe}
          onChange={(e) => setData('tipe', e.target.value as UnitFormData['tipe'])}
          disabled={processing}
          required
        >
          <option value="universitas">Universitas</option>
          <option value="fakultas">Fakultas</option>
          <option value="prodi">Program Studi</option>
          <option value="unit">Unit</option>
        </select>
        <InputError message={errors.tipe as unknown as string} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="unit-parent">Parent</Label>
        <select
          id="unit-parent"
          className="border rounded h-9 px-3"
          value={(data.parent_id as number) || ''}
          onChange={(e) => setData('parent_id', e.target.value ? Number(e.target.value) : '')}
          disabled={processing}
        >
          <option value="">Tidak ada</option>
          {parentOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.nama} {opt.tipe ? `(${opt.tipe})` : ''}
            </option>
          ))}
        </select>
        <InputError message={errors.parent_id as unknown as string} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="unit-leader">Pimpinan (Dosen)</Label>
        <select
          id="unit-leader"
          className="border rounded h-9 px-3"
          value={(data.leader_id as number) || ''}
          onChange={(e) => setData('leader_id', e.target.value ? Number(e.target.value) : '')}
          disabled={processing}
        >
          <option value="">Tidak ada</option>
          {leaderOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.nama} {opt.nidn ? `(${opt.nidn})` : ''}
            </option>
          ))}
        </select>
        <InputError message={errors.leader_id as unknown as string} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="unit-leader-nama">Nama Pimpinan (opsional)</Label>
        <Input
          id="unit-leader-nama"
          value={data.leader_nama || ''}
          onChange={(e) => setData('leader_nama', e.target.value)}
          placeholder="Isi jika leader belum terdaftar sebagai dosen"
          disabled={processing}
        />
        <InputError message={errors.leader_nama} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="unit-leader-jabatan">Jabatan Pimpinan</Label>
        <Input
          id="unit-leader-jabatan"
          value={data.leader_jabatan || ''}
          onChange={(e) => setData('leader_jabatan', e.target.value)}
          placeholder="Contoh: Dekan, Kaprodi, Kepala BAA"
          disabled={processing}
        />
        <InputError message={errors.leader_jabatan} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="unit-status">Status</Label>
        <select
          id="unit-status"
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

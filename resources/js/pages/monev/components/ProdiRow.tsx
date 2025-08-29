import React from 'react';
import { Button } from '@/components/ui/button';

type UnitOpt = { id: number; nama: string };
type DosenOpt = { id: number; nidn?: string; nama: string };

export type ProdiRowValue = { unit_id: number | ''; gjm_dosen_id: number | '' };

interface Props {
  index: number;
  row: ProdiRowValue;
  units: UnitOpt[];
  dosens: DosenOpt[];
  onChangeUnit: (index: number, value: string) => void;
  onChangeGjm: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

export default function ProdiRow({ index, row, units, dosens, onChangeUnit, onChangeGjm, onRemove }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-2 items-center">
      <select
        className="w-full border rounded-md h-9 px-3"
        value={row.unit_id}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChangeUnit(index, e.target.value)}
      >
        <option value="">Pilih Prodi (Unit)</option>
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {u.nama}
          </option>
        ))}
      </select>
      <select
        className="w-full border rounded-md h-9 px-3"
        value={row.gjm_dosen_id}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChangeGjm(index, e.target.value)}
      >
        <option value="">Pilih Dosen GJM</option>
        {dosens.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nama}
            {d.nidn ? ` • ${d.nidn}` : ''}
          </option>
        ))}
      </select>
      <Button type="button" variant="destructive" onClick={() => onRemove(index)}>
        Hapus
      </Button>
    </div>
  );
}

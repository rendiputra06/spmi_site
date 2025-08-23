import { Button } from '@/components/ui/button';
import { Dosen } from '../types';

type Props = {
  item: Dosen;
  index: number;
  currentPage: number;
  perPage: number;
  onEdit: (row: Dosen) => void;
  onDelete: (row: Dosen) => void;
};

export function DosenCard({ item, index, currentPage, perPage, onEdit, onDelete }: Props) {
  const number = (currentPage - 1) * perPage + (index + 1);
  return (
    <div className="flex items-start justify-between rounded-lg border p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium">
            {number}
          </span>
          <h3 className="text-base font-semibold">{item.nama}</h3>
          <span className={`rounded px-2 py-0.5 text-xs ${item.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {item.status ? 'Aktif' : 'Non-aktif'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">NIDN: {item.nidn} • Email: {item.email}</p>
        <p className="text-sm text-muted-foreground">
          Prodi: {item.prodi || '-'} • Jabatan: {item.jabatan || '-'} • Pangkat: {item.pangkat_golongan || '-'} • Pendidikan: {item.pendidikan_terakhir || '-'}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>Edit</Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>Hapus</Button>
      </div>
    </div>
  );
}

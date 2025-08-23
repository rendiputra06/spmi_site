import { Button } from '@/components/ui/button';
import { Periode } from '../types';

type Props = {
  item: Periode;
  index: number;
  currentPage: number;
  perPage: number;
  onEdit: (row: Periode) => void;
  onDelete: (row: Periode) => void;
};

export function PeriodeCard({ item, index, currentPage, perPage, onEdit, onDelete }: Props) {
  const number = (currentPage - 1) * perPage + (index + 1);
  const formatDateID = (value: string) => {
    if (!value) return '';
    const datePart = value.includes('T') ? value.split('T')[0] : value;
    const [y, m, d] = datePart.split('-').map((v) => parseInt(v, 10));
    if (!y || !m || !d) return value;
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return `${d} ${months[m - 1]} ${y}`;
  };
  return (
    <div className="flex items-start justify-between rounded-lg border p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium">
            {number}
          </span>
          <h3 className="text-base font-semibold">{item.nama}</h3>
          <span className={`rounded px-2 py-0.5 text-xs ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {item.is_active ? 'Aktif (Periode Berjalan)' : 'Tidak Aktif'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Kode: {item.kode}</p>
        <p className="text-sm text-muted-foreground">Tanggal: {formatDateID(item.mulai)} s/d {formatDateID(item.selesai)}</p>
        {item.keterangan ? (
          <p className="text-sm text-muted-foreground">Keterangan: {item.keterangan}</p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>Edit</Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>Hapus</Button>
      </div>
    </div>
  );
}

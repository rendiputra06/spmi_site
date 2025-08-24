import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AuditSessionFormData, Option } from '../types';

export type ModalType = 'add' | 'edit' | null;

interface Props {
  isOpen: boolean;
  modalType: ModalType;
  data: AuditSessionFormData;
  errors: Record<string, string>;
  processing: boolean;
  periodeOptions: Option[];
  onChange: (field: keyof AuditSessionFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function SessionFormDialog({ isOpen, modalType, data, errors, processing, periodeOptions, onChange, onSubmit, onClose }: Props) {
  if (!isOpen || !modalType) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-xl rounded-lg bg-background p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-semibold">{modalType === 'add' ? 'Buat' : 'Edit'} Sesi Audit</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Kode</label>
              <Input value={data.kode} onChange={(e) => onChange('kode', e.target.value)} required disabled={processing || modalType==='edit'} />
              <div className="text-xs text-destructive">{(errors as any).kode}</div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nama</label>
              <Input value={data.nama} onChange={(e) => onChange('nama', e.target.value)} required disabled={processing} />
              <div className="text-xs text-destructive">{(errors as any).nama}</div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Periode</label>
              <select className="h-9 rounded border px-3" value={(data.periode_id as number) || ''} onChange={(e) => onChange('periode_id', e.target.value ? Number(e.target.value) : '')}>
                <option value="">-</option>
                {periodeOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.nama}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tanggal Mulai</label>
              <Input type="date" value={data.tanggal_mulai} onChange={(e) => onChange('tanggal_mulai', e.target.value)} required />
              <div className="text-xs text-destructive">{(errors as any).tanggal_mulai}</div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tanggal Selesai</label>
              <Input type="date" value={data.tanggal_selesai} onChange={(e) => onChange('tanggal_selesai', e.target.value)} required />
              <div className="text-xs text-destructive">{(errors as any).tanggal_selesai}</div>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Deskripsi</label>
            <textarea className="min-h-[80px] rounded border p-2 text-sm" value={data.deskripsi || ''} onChange={(e) => onChange('deskripsi', e.target.value)} />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Status</label>
              <select className="h-9 rounded border px-3" value={data.status ? '1' : '0'} onChange={(e) => onChange('status', e.target.value === '1')}>
                <option value="1">Aktif</option>
                <option value="0">Non-aktif</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Kunci (Lock)</label>
              <select className="h-9 rounded border px-3" value={data.is_locked ? '1' : '0'} onChange={(e) => onChange('is_locked', e.target.value === '1')}>
                <option value="0">Tidak</option>
                <option value="1">Ya</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
              Batal
            </Button>
            <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

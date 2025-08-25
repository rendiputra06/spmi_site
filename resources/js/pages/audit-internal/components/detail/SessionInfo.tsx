import React from 'react';
import dayjs from 'dayjs';
import { AuditSession } from '../types';
import { Button } from '@/components/ui/button';

type Stats = {
  total_standar: number;
  total_indikator: number;
  total_pertanyaan: number;
  total_unit: number;
};

interface Props {
  session: AuditSession;
  stats: Stats;
}

function computeStatusLabel(session: AuditSession) {
  const now = dayjs();
  const mulai = session.tanggal_mulai ? dayjs(session.tanggal_mulai) : null;
  const selesai = session.tanggal_selesai ? dayjs(session.tanggal_selesai) : null;

  if (mulai && selesai) {
    if (now.isBefore(mulai, 'day')) return { text: 'Akan datang', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (now.isAfter(selesai, 'day')) return { text: 'Selesai', color: 'bg-gray-50 text-gray-700 border-gray-200' };
    return { text: 'Aktif', color: 'bg-green-50 text-green-700 border-green-200' };
  }
  return { text: 'Tidak diketahui', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
}

export default function SessionInfo({ session, stats }: Props) {
  const status = computeStatusLabel(session);
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${status.color}`}>{status.text}</span>
          {session.is_locked && (
            <span className="inline-flex items-center rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">Dikunci</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="text-xs text-muted-foreground">Kode</div>
          <div className="font-medium">{session.kode || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Nama</div>
          <div className="font-medium">{session.nama}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Periode</div>
          <div className="font-medium">{session.periode?.nama || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Tanggal Mulai</div>
          <div className="font-medium">{session.tanggal_mulai ? dayjs(session.tanggal_mulai).format('DD MMM YYYY') : '-'}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Tanggal Selesai</div>
          <div className="font-medium">{session.tanggal_selesai ? dayjs(session.tanggal_selesai).format('DD MMM YYYY') : '-'}</div>
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <div className="text-xs text-muted-foreground">Deskripsi</div>
          <div className="text-sm text-muted-foreground">{session.deskripsi || '-'}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border p-3">
          <div className="text-xs text-muted-foreground">Standar</div>
          <div className="text-2xl font-bold">{stats.total_standar}</div>
        </div>
        <div className="rounded border p-3">
          <div className="text-xs text-muted-foreground">Indikator</div>
          <div className="text-2xl font-bold">{stats.total_indikator}</div>
        </div>
        <div className="rounded border p-3">
          <div className="text-xs text-muted-foreground">Pertanyaan</div>
          <div className="text-2xl font-bold">{stats.total_pertanyaan}</div>
        </div>
        <div className="rounded border p-3">
          <div className="text-xs text-muted-foreground">Unit</div>
          <div className="text-2xl font-bold">{stats.total_unit}</div>
        </div>
      </div>
    </div>
  );
}

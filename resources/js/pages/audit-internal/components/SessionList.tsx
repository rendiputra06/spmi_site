import React from 'react';
import { Button } from '@/components/ui/button';
import type { AuditSession } from '../types';
import dayjs from 'dayjs';

export type CanFlags = { manage: boolean; respond: boolean } | undefined;

const computeStatus = (row: AuditSession) => {
  const now = dayjs();
  const mulai = row.tanggal_mulai ? dayjs(row.tanggal_mulai) : null;
  const selesai = row.tanggal_selesai ? dayjs(row.tanggal_selesai) : null;
  if (mulai && selesai) {
    if (now.isBefore(mulai, 'day')) return { text: 'Akan datang', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (now.isAfter(selesai, 'day')) return { text: 'Selesai', color: 'bg-gray-50 text-gray-700 border-gray-200' };
    return { text: 'Aktif', color: 'bg-green-50 text-green-700 border-green-200' };
  }
  return { text: 'Tidak diketahui', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
};

function toYMD(value: string) {
  return value && value.includes('T') ? value.split('T')[0] : value;
}

interface SessionListProps {
  sessions: { data: AuditSession[]; current_page: number; per_page: number; total: number; last_page: number };
  can?: CanFlags;
  onOpenDetail: (row: AuditSession) => void;
  onOpenEdit: (row: AuditSession) => void;
  onConfirmDelete: (row: AuditSession) => void;
  onGoToPage: (page: number) => void;
  onOpenRespond: (row: AuditSession) => void;
}

export default function SessionList({ sessions, can, onOpenDetail, onOpenEdit, onConfirmDelete, onGoToPage, onOpenRespond }: SessionListProps) {
  if (sessions.data.length === 0) {
    return null;
  }
  return (
    <>
      <div className="space-y-3">
        {sessions.data.map((row) => {
          const status = computeStatus(row);
          return (
            <div key={row.id} className="flex items-start justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{row.nama}</h3>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs">{row.kode}</span>
                  <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${status.color}`}>{status.text}</span>
                </div>
                <p className="text-sm text-muted-foreground">Periode: {row.periode?.nama || '-'}</p>
                <p className="text-sm text-muted-foreground">Tanggal: {toYMD(row.tanggal_mulai)} s/d {toYMD(row.tanggal_selesai)}</p>
              </div>
              <div className="flex gap-2">
                {can?.manage && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => onOpenDetail(row)}>Detail</Button>
                    <Button variant="outline" size="sm" onClick={() => onOpenEdit(row)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => onConfirmDelete(row)}>Hapus</Button>
                  </>
                )}
                {can?.respond && (
                  <Button size="sm" onClick={() => onOpenRespond(row)}>Buka Respon</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Halaman {sessions.current_page} dari {sessions.last_page} • Total {sessions.total} data
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onGoToPage(sessions.current_page - 1)} disabled={sessions.current_page <= 1}>
            Sebelumnya
          </Button>
          <Button variant="outline" onClick={() => onGoToPage(sessions.current_page + 1)} disabled={sessions.current_page >= sessions.last_page}>
            Berikutnya
          </Button>
        </div>
      </div>
    </>
  );
}

import React from 'react';
import { ReportRow } from '../../types';
import dayjs from 'dayjs';

export default function ReportTable({ rows }: { rows: ReportRow[] }) {
  return (
    <div className="space-y-4">
      {/* Card list for small/medium screens */}
      <div className="space-y-3 lg:hidden">
        {rows.length === 0 && (
          <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">Belum ada data laporan.</div>
        )}
        {rows.map((r) => (
          <div key={r.id} className="rounded-md border p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-medium">
                {r.unit?.nama ?? '-'}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDateTime(r.submitted_at)}
              </div>
            </div>
            <div className="mt-1 text-sm">
              <div className="text-muted-foreground">Standar</div>
              <div>
                {r.standar ? (
                  <span>
                    <span className="font-mono mr-1">{r.standar.kode}</span>
                    {r.standar.nama}
                  </span>
                ) : (
                  '-'
                )}
              </div>
            </div>
            {r.indikator?.nama && (
              <div className="mt-1 text-sm">
                <div className="text-muted-foreground">Indikator</div>
                <div className="break-words">{r.indikator.nama}</div>
              </div>
            )}
            <div className="mt-2 text-sm">
              <div className="text-muted-foreground">Pertanyaan</div>
              <div className="break-words">{r.pertanyaan?.isi ?? '-'}</div>
            </div>
            {r.note && (
              <div className="mt-2 text-sm">
                <div className="text-muted-foreground">Catatan Auditee</div>
                <div className="break-words">{r.note}</div>
              </div>
            )}
            {r.auditorReview?.reviewer_note && (
              <div className="mt-2 text-sm">
                <div className="text-muted-foreground">Catatan Auditor</div>
                <div className="break-words">{r.auditorReview.reviewer_note}</div>
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                Skor Auditor: {r.auditorReview?.score ?? '-'}
              </span>
              {(r.auditorReview?.outcome_status ?? r.status) && (
                <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-gray-400/10 dark:text-gray-300">
                  {(r.auditorReview?.outcome_status ?? r.status) as string}
                </span>
              )}
              {r.auditorReview?.reviewed_at && (
                <span className="ml-auto text-xs text-muted-foreground">
                  Reviewed: {formatDateTime(r.auditorReview.reviewed_at)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Compact table for large screens */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="p-2">Unit</th>
              <th className="p-2">Standar</th>
              <th className="p-2">Pertanyaan</th>
              <th className="p-2 text-center">Skor Auditor</th>
              <th className="p-2">Outcome Status</th>
              <th className="p-2">Dikirim</th>
              <th className="p-2">Direview</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-center text-muted-foreground" colSpan={8}>
                  Belum ada data laporan.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b hover:bg-muted/10">
                <td className="p-2 whitespace-nowrap">{r.unit?.nama}</td>
                <td className="p-2 whitespace-nowrap">
                  {r.standar ? (
                    <span>
                      <span className="font-mono mr-1">{r.standar.kode}</span>
                      {r.standar.nama}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="p-2 align-top whitespace-normal break-words max-w-[520px]" title={r.pertanyaan?.isi ?? ''}>
                  <div className="text-sm">{r.pertanyaan?.isi ?? '-'}</div>
                  {r.indikator?.nama && (
                    <div className="mt-1 text-xs text-muted-foreground">Indikator: {r.indikator.nama}</div>
                  )}
                  {r.note && (
                    <div className="mt-1 text-xs text-muted-foreground">Catatan Auditee: {r.note}</div>
                  )}
                  {r.auditorReview?.reviewer_note && (
                    <div className="mt-1 text-xs text-muted-foreground">Catatan Auditor: {r.auditorReview.reviewer_note}</div>
                  )}
                </td>
                <td className="p-2 text-center whitespace-nowrap">{r.auditorReview?.score ?? '-'}</td>
                <td className="p-2 whitespace-nowrap">{(r.auditorReview?.outcome_status ?? r.status) ?? '-'}</td>
                <td className="p-2 whitespace-nowrap">{formatDateTime(r.submitted_at)}</td>
                <td className="p-2 whitespace-nowrap">{formatDateTime(r.auditorReview?.reviewed_at ?? null)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';
  try {
    const d = dayjs(value);
    if (!d.isValid()) return value as string;
    return d.format('YYYY-MM-DD HH:mm');
  } catch {
    return value as string;
  }
}

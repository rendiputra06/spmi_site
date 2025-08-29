import React from 'react';

export type AuditorReportItem = {
  id: number;
  unit_id: number;
  title?: string;
  notes?: string;
  mime?: string;
  size?: number;
  uploaded_by?: string;
  created_at?: string;
  download_url: string;
};

interface Props {
  auditor_reports: AuditorReportItem[];
  unitNameById: Map<number, string>;
}

export default function AuditorDocumentsTab({ auditor_reports, unitNameById }: Props) {
  return (
    <div className="rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Dokumen Laporan Auditor</h3>
        <p className="text-sm text-muted-foreground">Daftar dokumen yang diunggah oleh auditor pada sesi ini.</p>
      </div>
      <div className="divide-y">
        {auditor_reports.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">Belum ada dokumen.</div>
        )}
        {auditor_reports.map((r) => (
          <div key={r.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-medium truncate">{r.title || 'Laporan Auditor'}</div>
              <div className="text-xs text-muted-foreground truncate">
                {unitNameById.get(r.unit_id) ? `Unit: ${unitNameById.get(r.unit_id)}` : ''}
                {r.uploaded_by ? ` • Oleh ${r.uploaded_by}` : ''}
                {r.size ? ` • ${(r.size / 1024 / 1024).toFixed(2)} MB` : ''}
                {r.created_at ? ` • ${r.created_at}` : ''}
              </div>
              {r.notes && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.notes}</div>}
            </div>
            <div className="shrink-0">
              <a className="text-sm underline" href={`${r.download_url}?inline=1`} target="_blank" rel="noreferrer">Lihat / Unduh</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

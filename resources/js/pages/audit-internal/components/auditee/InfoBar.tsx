import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

interface AuditorInfo { id: number; name?: string | null; email?: string | null }
interface AuditeeInfo { id: number; name: string; email?: string | null; unit_id?: number | null }
interface SessionInfo {
  id: number;
  kode?: string;
  nama?: string;
  status?: boolean;
  is_locked?: boolean;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  periode?: { id: number; nama?: string } | null;
}

interface Props {
  session?: SessionInfo;
  standars: Array<{ indikator: Array<{ pertanyaan: Array<{ id: number }> }> }>;
  submissions: Record<string, { doc_count: number }>;
  auditors?: AuditorInfo[];
  auditee?: AuditeeInfo | null;
}

export default function InfoBar({ session, standars, submissions, auditors = [], auditee }: Props) {
  const { totalQuestions, answered } = useMemo(() => {
    let total = 0;
    let answered = 0;
    standars.forEach((s) => s.indikator.forEach((i) => i.pertanyaan.forEach((q) => {
      total += 1;
      if (submissions[q.id]?.doc_count && submissions[q.id].doc_count > 0) answered += 1;
    })));
    return { totalQuestions: total, answered };
  }, [standars, submissions]);

  const formatIDDate = (s?: string) => {
    if (!s) return '-';
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
  };

  return (
    <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-3">
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">Total Pertanyaan</div>
        <div className="text-xl font-semibold">{totalQuestions}</div>
        <div className="text-xs text-muted-foreground">Sudah Dijawab</div>
        <div className="text-xl font-semibold">{answered}</div>
      </div>
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">Informasi Sesi Audit</div>
        <div className="text-sm">
          <div className="font-medium">{session?.kode ? `${session.kode} — ` : ''}{session?.nama || '-'}</div>
          {session?.periode?.nama ? <div className="text-muted-foreground">Periode: {session.periode.nama}</div> : null}
          {(session?.tanggal_mulai || session?.tanggal_selesai) ? (
            <div className="text-muted-foreground">Tanggal: {formatIDDate(session?.tanggal_mulai)} s.d {formatIDDate(session?.tanggal_selesai)}</div>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-1">
            {typeof session?.status === 'boolean' ? <Badge variant={session.status ? 'default' : 'secondary'}>{session.status ? 'Aktif' : 'Nonaktif'}</Badge> : null}
            {typeof session?.is_locked === 'boolean' ? <Badge variant={session.is_locked ? 'secondary' : 'outline'}>{session.is_locked ? 'Terkunci' : 'Terbuka'}</Badge> : null}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <div className="text-xs text-muted-foreground">Auditee</div>
          <div className="text-sm">
            {auditee ? (
              <>
                <div className="font-medium">{auditee.name}</div>
                {auditee.email ? <div className="text-muted-foreground">{auditee.email}</div> : null}
              </>
            ) : <span className="text-muted-foreground">-</span>}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Auditor</div>
          <div className="flex flex-wrap gap-1">
            {auditors.length > 0 ? auditors.map((a) => (
              <Badge key={a.id} variant="outline">{a.name || a.email || `User ${a.id}`}</Badge>
            )) : <span className="text-muted-foreground text-sm">-</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

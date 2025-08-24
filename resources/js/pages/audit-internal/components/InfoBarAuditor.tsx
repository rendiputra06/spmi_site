import React from 'react';
import { Badge } from '@/components/ui/badge';

type Session = any;

interface InfoBarAuditorProps {
  session: Session;
  assignedUnitIds: number[];
  auditorName?: string;
}

export default function InfoBarAuditor({ session, assignedUnitIds, auditorName }: InfoBarAuditorProps) {
  return (
    <div className="space-y-4">
      <div className="bg-muted/30 rounded-lg border p-4">
        <div className="text-muted-foreground text-sm">Sesi Audit</div>
        <div className="text-lg font-semibold">
          {session?.kode ? `${session.kode} — ` : ''}
          {session?.nama}
        </div>
        <div className="text-muted-foreground text-sm">Periode: {session?.periode?.nama || '-'}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {typeof session?.status === 'boolean' && (
            <Badge variant={session.status ? 'default' : 'secondary'}>{session.status ? 'Aktif' : 'Nonaktif'}</Badge>
          )}
          {typeof session?.is_locked === 'boolean' && (
            <Badge variant={session.is_locked ? 'secondary' : 'outline'}>{session.is_locked ? 'Terkunci' : 'Terbuka'}</Badge>
          )}
          {auditorName && (
            <Badge variant="outline">Auditor: {auditorName}</Badge>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-1 font-medium">Unit Ditugaskan</div>
        {assignedUnitIds?.length ? (
          <div className="flex flex-wrap gap-2">
            {assignedUnitIds.map((id) => (
              <Badge key={id} variant="outline">
                Unit #{id}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">Tidak ada unit yang ditugaskan untuk sesi ini.</div>
        )}
      </div>
    </div>
  );
}

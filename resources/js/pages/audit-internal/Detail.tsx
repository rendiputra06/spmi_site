import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import React, { useMemo, useState } from 'react';
import { AuditSession, AuditorOption, StandarOption, UnitOption } from './types';
import StandarTab from './components/StandarTab';
import UnitAuditorTab from './components/UnitAuditorTab';
import SessionInfo from './components/SessionInfo';

interface DetailProps {
  session: AuditSession & {
    standars: StandarOption[];
    units: Array<{
      id: number;
      unit: UnitOption;
      auditors: Array<{ id: number; dosen: AuditorOption; role: 'auditor' | 'auditee' }>;
    }>;
  };
  standar_options: StandarOption[];
  unit_options: UnitOption[];
  auditor_options: AuditorOption[];
  stats: { total_standar: number; total_indikator: number; total_pertanyaan: number; total_unit: number };
}

type TabKey = 'standar' | 'unit';

export default function Detail({ session, standar_options, unit_options, auditor_options, stats }: DetailProps) {
  const [tab, setTab] = useState<TabKey>('standar');
  const selectedStandarIds = useMemo(() => (session.standars || []).map((s) => s.id), [session.standars]);

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Audit Mutu Internal', href: '/audit-internal' },
        { title: session.nama, href: `/audit-internal/${session.id}/detail` },
      ]}
      title={`AMI • ${session.nama}`}
    >
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{session.nama}</h2>
            <p className="text-sm text-muted-foreground">Periode: {session.periode?.nama || '-'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.history.back()}>Kembali</Button>
            <Button variant={tab === 'standar' ? 'default' : 'outline'} onClick={() => setTab('standar')}>Standar</Button>
            <Button variant={tab === 'unit' ? 'default' : 'outline'} onClick={() => setTab('unit')}>Unit & Auditor</Button>
          </div>
        </div>

        {/* Session Info */}
        <SessionInfo session={session} stats={stats} />

        {tab === 'standar' && (
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-semibold">Pilih Standar</h3>
            <StandarTab sessionId={session.id} allStandars={standar_options} initialSelectedIds={selectedStandarIds} />
          </div>
        )}

        {tab === 'unit' && (
          <UnitAuditorTab
            sessionId={session.id}
            unitOptions={unit_options}
            auditorOptions={auditor_options}
            sessionUnits={session.units}
          />
        )}
      </div>
    </AppLayout>
  );
}

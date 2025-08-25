import React from 'react';

type UnitOpt = { id: number; nama: string };

type Props = {
  units: UnitOpt[];
  standars: { id: number; label: string }[];
  statuses: string[];
  unitId: number | 'all';
  standarId: number | 'all';
  status: 'all' | string;
  groupBy: 'unit' | 'standar';
  setUnitId: (v: number | 'all') => void;
  setStandarId: (v: number | 'all') => void;
  setStatus: (v: 'all' | string) => void;
  setGroupBy: (v: 'unit' | 'standar') => void;
  onExport: () => void;
};

export default function ReportControls({
  units,
  standars,
  statuses,
  unitId,
  standarId,
  status,
  groupBy,
  setUnitId,
  setStandarId,
  setStatus,
  setGroupBy,
  onExport,
}: Props) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end">
      <div className="flex flex-col">
        <label className="text-xs text-muted-foreground">Unit</label>
        <select
          className="h-9 rounded-md border bg-background px-2"
          value={unitId}
          onChange={(e) => setUnitId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
        >
          <option value="all">Semua Unit</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nama}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-muted-foreground">Standar</label>
        <select
          className="h-9 rounded-md border bg-background px-2"
          value={standarId}
          onChange={(e) => setStandarId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
        >
          <option value="all">Semua Standar</option>
          {standars.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-muted-foreground">Status</label>
        <select
          className="h-9 rounded-md border bg-background px-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="all">Semua Status</option>
          {statuses.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-muted-foreground">Group By</label>
        <select
          className="h-9 rounded-md border bg-background px-2"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as any)}
        >
          <option value="unit">Unit</option>
          <option value="standar">Standar</option>
        </select>
      </div>

      <div className="grow" />
      <button
        className="h-9 rounded-md bg-[var(--primary)] px-3 text-white hover:opacity-90"
        onClick={onExport}
      >
        Export CSV
      </button>
    </div>
  );
}

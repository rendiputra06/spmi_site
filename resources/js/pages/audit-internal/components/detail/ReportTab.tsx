import React, { useMemo, useState } from 'react';
import { ReportRow } from '../../types';
import dayjs from 'dayjs';
import ReportControls from './ReportControls';
import ReportChart from './ReportChart';
import ReportStatusChart from './ReportStatusChart';
import ReportTable from './ReportTable';
import ReportAvgTable, { AuditorAvgRow } from './ReportAvgTable';
import ReportHeatmap from './ReportHeatmap';

type Props = {
  rows: ReportRow[];
};

type GroupBy = 'unit' | 'standar';

export default function ReportTab({ rows }: Props) {
  // filters
  const [unitId, setUnitId] = useState<number | 'all'>('all');
  const [standarId, setStandarId] = useState<number | 'all'>('all');
  const [status, setStatus] = useState<'all' | string>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('unit');
  const [view, setView] = useState<'overview' | 'averages' | 'heatmap' | 'detail'>('overview');

  const units = useMemo(() => {
    const map = new Map<number, { id: number; nama: string }>();
    rows.forEach((r) => {
      if (r.unit) map.set(r.unit.id, { id: r.unit.id, nama: r.unit.nama });
    });
    return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama));
  }, [rows]);

  const standars = useMemo(() => {
    const map = new Map<number, { id: number; label: string }>();
    rows.forEach((r) => {
      if (r.standar) map.set(r.standar.id, { id: r.standar.id, label: `${r.standar.kode} • ${r.standar.nama}` });
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const okUnit = unitId === 'all' || r.unit?.id === unitId;
      const okStandar = standarId === 'all' || r.standar?.id === standarId;
      const rowStatus = r.auditorReview?.outcome_status ?? r.status ?? '-';
      const okStatus = status === 'all' || rowStatus === status;
      return okUnit && okStandar && okStatus;
    });
  }, [rows, unitId, standarId, status]);

  const chartData = useMemo(() => {
    // Auditor-only averages per group
    const groups = new Map<string, { key: string; auditorTotal: number; count: number }>();
    const toNum = (v: unknown) => (v === null || v === undefined || v === '' ? NaN : Number(v));
    filteredRows.forEach((r) => {
      const key = groupBy === 'unit' ? r.unit?.nama ?? '-' : r.standar ? `${r.standar.kode} ${r.standar.nama}` : '-';
      const item = groups.get(key) ?? { key, auditorTotal: 0, count: 0 };
      const auditor = toNum(r.auditorReview?.score);
      if (!isNaN(auditor)) item.auditorTotal += auditor;
      item.count += 1;
      groups.set(key, item);
    });
    return Array.from(groups.values())
      .map((g) => ({
        name: g.key,
        auditor: g.count ? Number((g.auditorTotal / g.count).toFixed(2)) : 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredRows, groupBy]);

  const statuses = useMemo(() => {
    // Fixed order for filters (observasi removed)
    const ORDER = ['positif', 'negatif_minor', 'negatif_mayor'];
    const set = new Set<string>();
    rows.forEach((r) => set.add((r.auditorReview?.outcome_status ?? r.status ?? '-')));
    const items = Array.from(set.values());
    const ordered = items.filter((x) => ORDER.includes(x as string));
    const others = items.filter((x) => !ORDER.includes(x as string));
    return [...ordered, ...others];
  }, [rows]);

  const statusChartData = useMemo(() => {
    const LABELS: Record<string, string> = {
      positif: 'Positif',
      negatif_minor: 'Negatif Minor',
      negatif_mayor: 'Negatif Mayor',
    };
    const ORDER = ['positif', 'negatif_minor', 'negatif_mayor'];
    const counts = new Map<string, number>();
    filteredRows.forEach((r) => {
      const st = (r.auditorReview?.outcome_status ?? r.status ?? '-') as string;
      counts.set(st, (counts.get(st) ?? 0) + 1);
    });
    const entries = Array.from(counts.entries());
    const orderedKnown = ORDER.filter((k) => counts.has(k)).map((k) => [k, counts.get(k)!] as const);
    const others = entries.filter(([k]) => !ORDER.includes(k));
    return [...orderedKnown, ...others].map(([key, value]) => ({
      key,
      name: LABELS[key] ?? key,
      value,
    }));
  }, [filteredRows]);

  // Total skor auditor berdasarkan rows yang ter-filter
  const totalSkor = useMemo(() => {
    const toNum = (v: unknown) => (v === null || v === undefined || v === '' ? NaN : Number(v));
    let sum = 0;
    filteredRows.forEach((r) => {
      const n = toNum(r.auditorReview?.score);
      if (!isNaN(n)) sum += n;
    });
    return Number(sum.toFixed(2));
  }, [filteredRows]);

  // Aggregations for averages
  const avgByUnit: AuditorAvgRow[] = useMemo(() => {
    const map = new Map<string, { key: string; auditor: number; cB: number; count: number }>();
    const toNum = (v: unknown) => (v === null || v === undefined || v === '' ? NaN : Number(v));
    filteredRows.forEach((r) => {
      const key = r.unit?.nama ?? '-';
      const cur = map.get(key) ?? { key, auditor: 0, cB: 0, count: 0 };
      const a2 = toNum(r.auditorReview?.score);
      if (!isNaN(a2)) { cur.auditor += a2; cur.cB += 1; }
      cur.count += 1;
      map.set(key, cur);
    });
    return Array.from(map.values()).map((v) => ({
      key: v.key,
      auditor: v.cB ? Number((v.auditor / v.cB).toFixed(2)) : NaN,
      count: v.count,
    })).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredRows]);

  const avgByStandar: AuditorAvgRow[] = useMemo(() => {
    const map = new Map<string, { key: string; auditor: number; cB: number; count: number }>();
    const toNum = (v: unknown) => (v === null || v === undefined || v === '' ? NaN : Number(v));
    filteredRows.forEach((r) => {
      const key = r.standar ? `${r.standar.kode} • ${r.standar.nama}` : '-';
      const cur = map.get(key) ?? { key, auditor: 0, cB: 0, count: 0 };
      const a2 = toNum(r.auditorReview?.score);
      if (!isNaN(a2)) { cur.auditor += a2; cur.cB += 1; }
      cur.count += 1;
      map.set(key, cur);
    });
    return Array.from(map.values()).map((v) => ({
      key: v.key,
      auditor: v.cB ? Number((v.auditor / v.cB).toFixed(2)) : NaN,
      count: v.count,
    })).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredRows]);

  const handleExport = () => {
    const header = [
      'Unit',
      'Standar',
      'Indikator',
      'Pertanyaan',
      'Catatan Auditor',
      'Skor Auditor',
      'Outcome Status',
      'Dikirim',
      'Direview',
    ];
    const lines = filteredRows.map((r) => [
      safe(r.unit?.nama),
      r.standar ? `${r.standar.kode} ${r.standar.nama}` : '-',
      safe(r.indikator?.nama),
      safe(r.pertanyaan?.isi),
      safe(r.auditorReview?.reviewer_note),
      safe(r.auditorReview?.score),
      safe(r.auditorReview?.outcome_status),
      safe(formatDateTime(r.submitted_at)),
      safe(formatDateTime(r.auditorReview?.reviewed_at ?? null)),
    ]);
    const csv = [header, ...lines]
      .map((row) => row.map(csvEscape).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-ami-${dayjs().format('YYYYMMDD-HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <ReportControls
        units={units}
        standars={standars}
        statuses={statuses}
        unitId={unitId}
        standarId={standarId}
        status={status}
        groupBy={groupBy}
        setUnitId={setUnitId}
        setStandarId={setStandarId}
        setStatus={setStatus}
        setGroupBy={setGroupBy}
        onExport={handleExport}
      />

      {/* Ringkasan Total Skor */}
      <div className="rounded-lg border p-3 flex items-center gap-4">
        <div className="text-sm text-muted-foreground">Total Skor (sesuai filter)</div>
        <div className="text-xl font-semibold">{totalSkor}</div>
      </div>

      {/* View switcher */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setView('overview')} className={`text-sm px-2 py-1 rounded border ${view==='overview' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}>Overview</button>
        <button onClick={() => setView('averages')} className={`text-sm px-2 py-1 rounded border ${view==='averages' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}>Averages</button>
        <button onClick={() => setView('heatmap')} className={`text-sm px-2 py-1 rounded border ${view==='heatmap' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}>Heatmap</button>
        <button onClick={() => setView('detail')} className={`text-sm px-2 py-1 rounded border ${view==='detail' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}>Detail</button>
      </div>

      {view === 'overview' && (
        <>
          <ReportChart data={chartData} />
          <ReportStatusChart data={statusChartData} />
        </>
      )}

      {view === 'averages' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ReportAvgTable data={avgByUnit} title="Rata-rata Skor per Unit" />
          <ReportAvgTable data={avgByStandar} title="Rata-rata Skor per Standar" />
        </div>
      )}

      {view === 'heatmap' && (
        <ReportHeatmap
          rows={filteredRows}
          units={units}
          standars={standars}
          title="Heatmap Skor (Auditor) — Unit x Standar"
        />
      )}

      {view === 'detail' && (
        <ReportTable rows={filteredRows} />
      )}
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

function csvEscape(val: string) {
  if (val == null) return '';
  const needsQuote = /[",\n]/.test(val);
  const escaped = String(val).replace(/\"/g, '\"\"');
  return needsQuote ? `\"${escaped}\"` : escaped;
}

function safe(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val);
}

import React, { useMemo, useState } from 'react';
import { ReportRow } from '../../types';
import dayjs from 'dayjs';
import ReportControls from './ReportControls';
import ReportChart from './ReportChart';
import ReportStatusChart from './ReportStatusChart';
import ReportTable from './ReportTable';

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
    const groups = new Map<string, { key: string; auditeeTotal: number; auditorTotal: number; count: number }>();
    const toNum = (v: unknown) => (v === null || v === undefined || v === '' ? NaN : Number(v));
    filteredRows.forEach((r) => {
      const key = groupBy === 'unit' ? r.unit?.nama ?? '-' : r.standar ? `${r.standar.kode} ${r.standar.nama}` : '-';
      const item = groups.get(key) ?? { key, auditeeTotal: 0, auditorTotal: 0, count: 0 };
      const auditee = toNum(r.score);
      const auditor = toNum(r.auditorReview?.score);
      if (!isNaN(auditee)) item.auditeeTotal += auditee;
      if (!isNaN(auditor)) item.auditorTotal += auditor;
      item.count += 1;
      groups.set(key, item);
    });
    return Array.from(groups.values())
      .map((g) => ({
        name: g.key,
        auditee: g.count ? Number((g.auditeeTotal / g.count).toFixed(2)) : 0,
        auditor: g.count ? Number((g.auditorTotal / g.count).toFixed(2)) : 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredRows, groupBy]);

  const statuses = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => s.add((r.auditorReview?.outcome_status ?? r.status ?? '-')));
    return Array.from(s.values()).sort();
  }, [rows]);

  const statusChartData = useMemo(() => {
    const counts = new Map<string, number>();
    filteredRows.forEach((r) => {
      const st = r.auditorReview?.outcome_status ?? r.status ?? '-';
      counts.set(st, (counts.get(st) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredRows]);

  const handleExport = () => {
    const header = [
      'Unit',
      'Standar',
      'Indikator',
      'Pertanyaan',
      'Catatan Auditee',
      'Skor Auditee',
      'Status',
      'Skor Auditor',
      'Catatan Auditor',
      'Dikirim',
      'Direview',
    ];
    const lines = filteredRows.map((r) => [
      safe(r.unit?.nama),
      r.standar ? `${r.standar.kode} ${r.standar.nama}` : '-',
      safe(r.indikator?.nama),
      safe(r.pertanyaan?.isi),
      safe(r.note),
      safe(r.score),
      safe(r.status),
      safe(r.auditorReview?.score),
      safe(r.auditorReview?.reviewer_note),
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

      <ReportChart data={chartData} />

      <ReportStatusChart data={statusChartData} />

      <ReportTable rows={filteredRows} />
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

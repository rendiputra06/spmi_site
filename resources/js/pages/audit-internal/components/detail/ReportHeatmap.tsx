import React, { useMemo } from 'react';
import { ReportRow } from '../../types';

export default function ReportHeatmap({
  rows,
  units,
  standars,
  title = 'Heatmap Skor (Auditor) — Unit x Standar',
}: {
  rows: ReportRow[];
  units: { id: number; nama: string }[];
  standars: { id: number; label: string }[];
  title?: string;
}) {
  const matrix = useMemo(() => {
    // Build averages of auditor scores per (unit, standar) — auditor only
    const map = new Map<string, { sum: number; count: number }>();
    const key = (u: number, s: number) => `${u}:${s}`;
    rows.forEach((r) => {
      const u = r.unit?.id;
      const s = r.standar?.id;
      if (!u || !s) return;
      const vRaw = r.auditorReview?.score;
      const v = vRaw === null || vRaw === undefined || vRaw === '' ? NaN : Number(vRaw);
      if (isNaN(v)) return;
      const k = key(u, s);
      const cur = map.get(k) ?? { sum: 0, count: 0 };
      cur.sum += v;
      cur.count += 1;
      map.set(k, cur);
    });
    return { map, key };
  }, [rows]);

  const valueAt = (u: number, s: number) => {
    const rec = matrix.map.get(matrix.key(u, s));
    if (!rec || rec.count === 0) return null;
    return rec.sum / rec.count;
  };

  const colorFor = (val: number | null): React.CSSProperties => {
    if (val === null) return { backgroundColor: 'transparent' };
    // Map 0..2 to color gradient (red -> yellow -> green)
    const t = Math.max(0, Math.min(1, val / 2));
    const r = Math.round(255 * (1 - t));
    const g = Math.round(200 * t + 55 * (1 - t));
    const b = Math.round(100 * (1 - Math.abs(t - 0.5) * 2));
    return { backgroundColor: `rgba(${r}, ${g}, ${b}, 0.6)` } as React.CSSProperties;
  };

  const format = (n: number | null) => (n === null ? '-' : n.toFixed(2));

  return (
    <div className="rounded-md border">
      <div className="px-3 py-2 border-b bg-muted/40 flex items-center justify-between">
        <h4 className="text-sm font-medium">{title}</h4>
        <div className="text-xs text-muted-foreground">{units.length} unit × {standars.length} standar</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="p-2 sticky left-0 bg-muted/30 z-10">Unit \\ Standar</th>
              {standars.map((s) => (
                <th key={s.id} className="p-2 whitespace-nowrap">{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {units.length === 0 && (
              <tr>
                <td className="p-3 text-center text-muted-foreground" colSpan={standars.length + 1}>Tidak ada data</td>
              </tr>
            )}
            {units.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-2 sticky left-0 bg-background z-10 whitespace-nowrap">{u.nama}</td>
                {standars.map((s) => {
                  const v = valueAt(u.id, s.id);
                  return (
                    <td key={s.id} className="p-1 text-center align-middle">
                      <div className={`rounded px-1 py-1 ${v === null ? 'bg-muted' : ''}`} style={colorFor(v)} title={`${u.nama} × ${s.label}`}>
                        {format(v)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 text-xs text-muted-foreground">
        Keterangan: warna mendekati merah=skor rendah, hijau=skor tinggi. Nilai menggunakan rata-rata skor dari auditor saja.
      </div>
    </div>
  );
}

import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type StatusDatum = { key?: string; name: string; value: number };
const COLOR_BY_KEY: Record<string, string> = {
  positif: '#34d399',
  negatif_minor: '#f97316',
  negatif_mayor: '#ef4444',
};
const FALLBACK_COLORS = ['#a78bfa', '#60a5fa', '#f472b6', '#c084fc'];

export default function ReportStatusChart({ data }: { data: StatusDatum[] }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  return (
    <div className="w-full rounded-md border p-2">
      <div className="flex items-center justify-between px-2 py-1">
        <h4 className="text-sm font-medium">Distribusi Outcome Status</h4>
        <div className="text-xs text-muted-foreground">Total {total}</div>
      </div>
      <div className="h-48 sm:h-56 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip formatter={(v: number, n, p: any) => {
              const val = Number(v || 0);
              const pct = total ? ((val / total) * 100).toFixed(1) : '0.0';
              return [`${val} item (${pct}%)`, p && p.payload ? p.payload.name : n];
            }} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              stroke="#fff"
              strokeWidth={1}
            >
              {data.map((entry, index) => {
                const key = entry.key as string | undefined;
                const color = key && COLOR_BY_KEY[key] ? COLOR_BY_KEY[key] : FALLBACK_COLORS[index % FALLBACK_COLORS.length];
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="px-2 pb-2 text-xs text-muted-foreground">
        Sumber: kolom outcome_status pada tabel auditor_reviews.
      </div>
    </div>
  );
}

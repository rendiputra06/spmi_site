import React from 'react';

export type AuditorAvgRow = {
  key: string; // unit name or standar label
  auditor: number;
  count: number;
};

export default function ReportAvgTable({ data, title }: { data: AuditorAvgRow[]; title: string }) {
  return (
    <div className="rounded-md border">
      <div className="px-3 py-2 border-b bg-muted/40 flex items-center justify-between">
        <h4 className="text-sm font-medium">{title}</h4>
        <div className="text-xs text-muted-foreground">{data.length} baris</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="p-2">Nama</th>
              <th className="p-2 text-center">Rata-rata Skor (Auditor)</th>
              <th className="p-2 text-center">Jumlah Item</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td className="p-3 text-center text-muted-foreground" colSpan={3}>Tidak ada data</td>
              </tr>
            )}
            {data.map((r) => (
              <tr key={r.key} className="border-b hover:bg-muted/10">
                <td className="p-2 whitespace-nowrap">{r.key}</td>
                <td className="p-2 text-center">{formatNum(r.auditor)}</td>
                <td className="p-2 text-center">{r.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatNum(n: number) {
  if (isNaN(n)) return '-';
  return n.toFixed(2);
}

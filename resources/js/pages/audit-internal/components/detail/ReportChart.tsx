import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ChartDatum = { name: string; auditor: number };

export default function ReportChart({ data }: { data: ChartDatum[] }) {
  return (
    <div className="w-full rounded-md border p-2">
      <div className="h-56 sm:h-64 md:h-72 lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              hide={data.length > 12}
              tick={{ fontSize: 11 }}
              interval={0}
              height={data.length > 12 ? 0 : 40}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="auditor" name="Rata-rata (Auditor)" fill="#34d399" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

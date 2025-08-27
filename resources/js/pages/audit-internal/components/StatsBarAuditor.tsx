import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

interface DocItem {
  id: number;
  title: string;
  mime?: string | null;
  size?: number | null;
  download_url: string;
}
interface SubmissionRow {
  id: number | null;
  documents: DocItem[];
  review: { score?: number | string | null } | null;
}

interface StatsBarAuditorProps {
  submissions: SubmissionRow[];
}

export default function StatsBarAuditor({ submissions }: StatsBarAuditorProps) {
  const stats = useMemo(() => {
    const total = submissions.length;
    const scored = submissions.filter((s) => {
      const v = s.review?.score;
      return v !== undefined && v !== null && `${v}` !== '';
    }).length;
    const totalDocs = submissions.reduce((acc, s) => acc + (s.documents?.length || 0), 0);
    const percent = total > 0 ? Math.round((scored / total) * 100) : 0;
    return { total, scored, percent, totalDocs };
  }, [submissions]);

  return (
    <div className="rounded-lg border p-4 flex flex-wrap items-center gap-3">
      <div className="font-medium">Ringkasan</div>
      <Badge variant="outline">Total Pertanyaan: {stats.total}</Badge>
      <Badge variant="outline">Sudah Dinilai: {stats.scored}</Badge>
      <Badge variant="outline">Progress: {stats.percent}%</Badge>
      <Badge variant="outline">Total Dokumen: {stats.totalDocs}</Badge>
    </div>
  );
}

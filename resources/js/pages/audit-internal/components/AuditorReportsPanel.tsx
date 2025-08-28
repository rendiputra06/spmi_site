import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface AssignedUnit {
  id: number;
  nama: string;
}

interface AuditorReportItem {
  id: number;
  unit_id: number;
  title?: string;
  notes?: string;
  mime?: string;
  size?: number;
  uploaded_by?: string;
  created_at?: string;
  download_url: string;
}

interface AuditorReportsPanelProps {
  sessionId: number;
  assignedUnits: AssignedUnit[];
  auditorReports: AuditorReportItem[];
  selectedUnitId?: number;
}

export default function AuditorReportsPanel({ sessionId, assignedUnits, auditorReports, selectedUnitId }: AuditorReportsPanelProps) {
  const [reportUnitId, setReportUnitId] = useState<number | ''>(() => selectedUnitId ?? assignedUnits[0]?.id ?? '');
  React.useEffect(() => {
    if (selectedUnitId && reportUnitId !== selectedUnitId) {
      setReportUnitId(selectedUnitId);
    }
  }, [selectedUnitId]);
  const [reportTitle, setReportTitle] = useState('');
  const [reportNotes, setReportNotes] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const submitReport = () => {
    if (!reportUnitId || !reportFile) {
      toast.error('Pilih Unit dan File terlebih dahulu');
      return;
    }
    const data: Record<string, any> = {
      unit_id: reportUnitId,
      title: reportTitle || null,
      notes: reportNotes || null,
      file: reportFile,
    };
    setUploading(true);
    router.post(
      `/audit-internal/${sessionId}/auditor-reports`,
      data,
      {
        forceFormData: true,
        onFinish: () => setUploading(false),
        onSuccess: () => {
          setReportTitle('');
          setReportNotes('');
          setReportFile(null);
        },
      },
    );
  };

  const deleteReport = (reportId: number) => {
    router.delete(`/audit-internal/${sessionId}/auditor-reports/${reportId}`, { preserveScroll: true });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="unit">Unit</Label>
            <select
              id="unit"
              className="mt-1 block w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              value={reportUnitId as any}
              onChange={(e) => setReportUnitId(e.target.value ? parseInt(e.target.value) : '')}
            >
              <option value="">Pilih Unit</option>
              {assignedUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="title">Judul (opsional)</Label>
            <Input id="title" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="Contoh: Laporan Hasil Audit Unit X" />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Catatan (opsional)</Label>
          <Textarea id="notes" value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} rows={3} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="file">File</Label>
            <Input id="file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={(e) => setReportFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={submitReport} disabled={uploading}>
              {uploading ? 'Mengunggah...' : 'Unggah Laporan'}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="p-3 border-b font-medium">Daftar Laporan</div>
        <div className="divide-y">
          {auditorReports.length === 0 && <div className="p-4 text-sm text-neutral-500">Belum ada laporan</div>}
          {auditorReports.map((r) => (
            <div key={r.id} className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{r.title || 'Laporan Auditor'}</div>
                <div className="text-xs text-neutral-500">
                  {r.uploaded_by ? `Oleh ${r.uploaded_by}` : ''}
                  {r.size ? ` • ${(r.size / 1024 / 1024).toFixed(2)} MB` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={r.download_url} className="text-sm underline" target="_blank" rel="noreferrer">
                  Download
                </a>
                <Button variant="destructive" size="sm" onClick={() => deleteReport(r.id)}>
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

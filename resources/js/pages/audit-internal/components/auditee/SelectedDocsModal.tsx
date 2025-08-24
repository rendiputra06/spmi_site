import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

interface DocItem { id: number; title: string; size?: number | null; mime?: string | null; download_url: string }

interface Props {
  open: boolean;
  submissionId: number | null;
  onClose: () => void;
}

export default function SelectedDocsModal({ open, submissionId, onClose }: Props) {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!submissionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/auditee-submissions/${submissionId}/documents`);
      const data = await res.json();
      setDocs(data.documents || []);
    } finally {
      setLoading(false);
    }
  };

  const remove = (docId: number) => {
    if (!submissionId) return;
    router.post(`/auditee-submissions/${submissionId}/detach-documents`, { document_ids: [docId] }, {
      preserveScroll: true,
      onSuccess: () => load(),
    });
  };

  useEffect(() => {
    if (open) load();
  }, [open, submissionId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-xl rounded-lg bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Dokumen Terpilih</h3>
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        </div>
        <div className="max-h-[50vh] overflow-auto rounded border">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Memuat...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Judul</th>
                  <th className="px-3 py-2 text-left">Tipe</th>
                  <th className="px-3 py-2 text-left">Ukuran</th>
                  <th className="px-3 py-2 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {docs.length ? docs.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="px-3 py-2">{d.title}</td>
                    <td className="px-3 py-2">{d.mime || '-'}</td>
                    <td className="px-3 py-2">{d.size ? `${(d.size / 1024).toFixed(1)} KB` : '-'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <a className="text-xs underline" href={d.download_url} target="_blank" rel="noreferrer">Download</a>
                        <Button size="sm" variant="destructive" onClick={() => remove(d.id)}>Hapus</Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td className="px-3 py-4 text-sm text-muted-foreground" colSpan={4}>Belum ada dokumen</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

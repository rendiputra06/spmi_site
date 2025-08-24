import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

interface DocItem {
  id: number;
  title: string;
  description?: string | null;
  size?: number | null;
  mime?: string | null;
  download_url: string;
}

interface DocResponse {
  data: DocItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Props {
  open: boolean;
  submissionId: number | null;
  onClose: () => void;
  onPicked: () => void; // called after successful attach
}

export default function DocumentPickerModal({ open, submissionId, onClose, onPicked }: Props) {
  const [list, setList] = useState<DocResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const fetchDocs = async (pageNum = 1, q = '') => {
    try {
      setLoading(true);
      const res = await fetch(`/documents.json?per_page=10&page=${pageNum}${q ? `&search=${encodeURIComponent(q)}` : ''}`);
      const data = await res.json();
      setList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPage(1);
      fetchDocs(1, '');
      // load already selected documents to disable reselect
      if (submissionId) {
        fetch(`/auditee-submissions/${submissionId}/documents`).then(r => r.json()).then((data) => {
          const ids = new Set<number>((data?.documents || []).map((d: DocItem) => d.id));
          setSelectedIds(ids);
        }).catch(() => {});
      }
    }
  }, [open]);

  const handleSearch = () => {
    setPage(1);
    fetchDocs(1, search);
  };

  const attach = async (docId: number) => {
    if (!submissionId) return;
    router.post(`/auditee-submissions/${submissionId}/attach-documents`, { document_ids: [docId] }, {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedIds(prev => new Set<number>([...Array.from(prev), docId]));
        onPicked();
      },
    });
  };

  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50`}>
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Pilih Dokumen</h3>
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        </div>
        <div className="mb-4 flex gap-2">
          <input className="h-9 flex-1 rounded border px-3 text-sm" placeholder="Cari dokumen..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <Button variant="outline" onClick={handleSearch}>Cari</Button>
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
                {list?.data?.length ? list.data.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="px-3 py-2">
                      <div className="font-medium">{d.title}</div>
                      {d.description ? <div className="text-xs text-muted-foreground">{d.description}</div> : null}
                    </td>
                    <td className="px-3 py-2">{d.mime || '-'}</td>
                    <td className="px-3 py-2">{d.size ? `${(d.size / 1024).toFixed(1)} KB` : '-'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <a className="text-xs underline" href={d.download_url} target="_blank" rel="noreferrer">Download</a>
                        {selectedIds.has(d.id) ? (
                          <Button size="sm" variant="secondary" disabled>Dipilih</Button>
                        ) : (
                          <Button size="sm" onClick={() => attach(d.id)}>Pilih</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td className="px-3 py-4 text-sm text-muted-foreground" colSpan={4}>Tidak ada data</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Halaman {list?.current_page || 1} dari {list?.last_page || 1}</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { const p = Math.max(1, (list?.current_page || 1) - 1); setPage(p); fetchDocs(p, search); }} disabled={(list?.current_page || 1) <= 1}>Sebelumnya</Button>
            <Button variant="outline" onClick={() => { const p = Math.min(list?.last_page || 1, (list?.current_page || 1) + 1); setPage(p); fetchDocs(p, search); }} disabled={(list?.current_page || 1) >= (list?.last_page || 1)}>Berikutnya</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

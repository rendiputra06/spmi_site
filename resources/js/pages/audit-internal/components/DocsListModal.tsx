import React from 'react';
import { Button } from '@/components/ui/button';

export interface DocItem { id: number; title: string; size?: number | null; mime?: string | null; download_url: string }

interface Props {
  open: boolean;
  docs: DocItem[];
  onClose: () => void;
  onPreview?: (doc: DocItem) => void;
}

export default function DocsListModal({ open, docs, onClose, onPreview }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-xl rounded-lg bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Daftar Dokumen</h3>
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        </div>
        <div className="max-h-[50vh] overflow-auto rounded border">
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
                      {onPreview && <Button size="sm" variant="outline" onClick={() => onPreview(d)}>Preview</Button>}
                      <a className="text-xs underline" href={d.download_url} target="_blank" rel="noreferrer">Download</a>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td className="px-3 py-4 text-sm text-muted-foreground" colSpan={4}>Belum ada dokumen</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

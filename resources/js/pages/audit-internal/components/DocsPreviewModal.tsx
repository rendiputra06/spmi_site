import React from 'react';

interface DocItem {
  id: number;
  title: string;
  mime?: string | null;
  size?: number | null;
  download_url: string;
}

interface DocsPreviewModalProps {
  open: boolean;
  onClose: () => void;
  doc?: DocItem | null;
}

export default function DocsPreviewModal({ open, onClose, doc }: DocsPreviewModalProps) {
  if (!open) return null;
  const inlineUrl = doc ? `${doc.download_url}${doc.download_url.includes('?') ? '&' : '?'}inline=1` : '';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="mx-4 flex w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-background shadow-lg">
        <div className="flex items-center justify-between border-b p-3">
          <div className="font-medium">Pratinjau Dokumen</div>
          <button className="text-sm text-muted-foreground hover:underline" onClick={onClose}>
            Tutup
          </button>
        </div>
        <div className="max-h-[80vh] overflow-auto p-3">
          {doc ? (
            <div className="space-y-3">
              <div className="text-sm"><span className="font-medium">Judul:</span> {doc.title}</div>
              <div className="text-xs text-muted-foreground">
                {doc.mime || 'unknown'} {doc.size ? `• ${Math.round(doc.size / 1024)} KB` : ''}
              </div>
              <div className="w-full overflow-hidden rounded border bg-muted" style={{ height: '70vh' }}>
                {doc.mime && doc.mime.startsWith('image/') ? (
                  <img src={inlineUrl} alt={doc.title} className="h-full w-full object-contain" />
                ) : doc.mime === 'application/pdf' ? (
                  <iframe title={doc.title} src={inlineUrl} className="h-full w-full" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-6 text-sm text-muted-foreground">
                    Preview tidak tersedia untuk tipe ini. Silakan unduh dokumen.
                  </div>
                )}
              </div>
              <div>
                <a href={inlineUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                  Buka di tab baru
                </a>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Tidak ada dokumen dipilih.</div>
          )}
        </div>
      </div>
    </div>
  );
}

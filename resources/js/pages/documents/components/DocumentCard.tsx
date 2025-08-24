import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { DocumentItem } from '../types';
import { router } from '@inertiajs/react';

export function DocumentCard({ item, onPreview }: { item: DocumentItem; onPreview?: () => void }) {
  const onDelete = () => {
    if (!confirm(`Hapus dokumen "${item.title}"?`)) return;
    router.delete(`/documents/${item.id}`, { preserveScroll: true });
  };

  return (
    <div className="rounded border bg-card p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium">{item.title}</h3>
          <div className="text-sm text-muted-foreground">
            Unit: {item.unit?.nama || '-'} • Kategori: {item.category || '-'} • Status: {item.status}
          </div>
          {item.description && <p className="text-sm mt-1">{item.description}</p>}
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {(item.size / 1024).toFixed(1)} KB
        </div>
      </div>
      <TooltipProvider>
        <div className="flex gap-2 justify-end">
          {onPreview && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="sm" onClick={onPreview} aria-label="Preview">
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="outline" size="sm" aria-label="Unduh">
                <a href={`/documents/${item.id}/download`}>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Unduh</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" size="sm" onClick={onDelete} aria-label="Hapus">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Hapus</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

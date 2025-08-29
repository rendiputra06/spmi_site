import React from 'react';
import { Button } from '@/components/ui/button';

export interface LinkItem {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  currentPage: number;
  lastPage: number;
  total: number;
  links?: LinkItem[];
  onClickLink?: (url: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function Pagination({ currentPage, lastPage, total, links, onClickLink, onPrev, onNext }: Props) {
  if (links && links.length && onClickLink) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {links.map((link, idx) => {
          const label = link.label.replace(/&laquo;|&raquo;/g, (m) => (m === '&laquo;' ? '«' : '»'));
          if (link.url === null) {
            return (
              <span key={idx} className="px-3 py-1.5 text-sm rounded border bg-muted text-muted-foreground" dangerouslySetInnerHTML={{ __html: label }} />
            );
          }
          return (
            <a
              key={idx}
              href={link.url!}
              className={`px-3 py-1.5 text-sm rounded border ${link.active ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
              onClick={(e) => {
                e.preventDefault();
                onClickLink(link.url!);
              }}
              dangerouslySetInnerHTML={{ __html: label }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-muted-foreground">
        Halaman {currentPage} / {lastPage} • Total {total}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPrev} disabled={currentPage <= 1}>
          Sebelumnya
        </Button>
        <Button variant="outline" onClick={onNext} disabled={currentPage >= lastPage}>
          Berikutnya
        </Button>
      </div>
    </div>
  );
}

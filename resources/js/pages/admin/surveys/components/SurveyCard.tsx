import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Link } from '@inertiajs/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

export interface SurveyListItem {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  questions_count?: number;
  assignments_count?: number;
}

interface SurveyCardProps {
  item: SurveyListItem;
  onEdit: (item: SurveyListItem) => void;
  onDelete: (id: number) => void;
}

export function SurveyCard({ item, onEdit, onDelete }: SurveyCardProps) {
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <div className="hover:bg-muted/50 rounded-lg border p-4 transition-colors">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold leading-6 truncate">{item.name}</h3>
            {item.description && (
              <p className="text-muted-foreground text-sm line-clamp-2">{item.description}</p>
            )}
          </div>
          <Badge variant={item.is_active ? 'default' : 'secondary'}>
            {item.is_active ? 'Aktif' : 'Nonaktif'}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="font-normal">
            {(item.questions_count ?? 0)} Pertanyaan
          </Badge>
          <Badge variant="outline" className="font-normal">
            {(item.assignments_count ?? 0)} Assignments
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/surveys/${item.id}/edit`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Detail</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Detail</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDelete(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Hapus</span>
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Hapus</TooltipContent>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Hapus Survey</DialogTitle>
                    <DialogDescription>
                      Yakin hapus survey <strong>{item.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenDelete(false)}>
                      Batal
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        onDelete(item.id);
                        setOpenDelete(false);
                      }}
                    >
                      Hapus
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

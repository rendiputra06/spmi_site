import React from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Flag } from 'lucide-react';

export interface Unit { id: number; nama: string }
export interface Course { id: number; nama: string; unit_id: number; kode?: string; sks?: number }
export interface Dosen { id: number; nama: string; nidn?: string; unit_id: number }
export interface Evaluation {
  id: number;
  area: string;
  unit: Unit;
  mata_kuliah?: Course;
  mataKuliah?: Course;
  dosen?: Dosen;
}

interface Props {
  evaluations: Evaluation[];
  onEdit: (ev: Evaluation) => void;
  onDelete: (id: number) => void;
  readonly?: boolean;
  buildStartEvaluatePath?: (ev: Evaluation) => string | null;
  sessionTemplateName?: string | null;
}

export default function EvaluationList({ evaluations, onEdit, onDelete, readonly = false, buildStartEvaluatePath, sessionTemplateName }: Props) {
  return (
    <div className="space-y-3">
      {evaluations.length === 0 && (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">Belum ada penugasan.</div>
      )}
      {evaluations.map((ev) => {
        const mk = ev.mata_kuliah || ev.mataKuliah;
        const templateName = (sessionTemplateName ?? ((ev as any).template?.nama || (ev as any).template?.name)) || '-';
        return (
          <div key={ev.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <div className="text-base md:text-lg font-semibold truncate">{mk?.nama || '-'} • {ev.unit?.nama || '-'}</div>
                <div className="text-sm text-muted-foreground truncate">Area: {ev.area} • Template: {templateName}</div>
                {ev.dosen && (
                  <div className="text-sm text-muted-foreground truncate">
                    Dosen: {ev.dosen.nama}{ev.dosen.nidn ? ` • NIDN ${ev.dosen.nidn}` : ''}
                  </div>
                )}
              </div>
              {!readonly && (
                <div className="shrink-0 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(ev)}>Edit</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">Hapus</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus penugasan ini?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => onDelete(ev.id)}>
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
              {!readonly && buildStartEvaluatePath && (
                <div className="shrink-0">
                  {(() => {
                    const href = buildStartEvaluatePath(ev);
                    return href ? (
                      <Button size="sm" onClick={() => window.location.assign(href)}>
                        <Flag className="h-4 w-4 mr-2" /> Mulai Evaluasi
                      </Button>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

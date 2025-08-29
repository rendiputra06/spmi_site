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
}

export default function EvaluationList({ evaluations, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-lg border">
      <div className="px-4 py-3 font-medium border-b">Daftar Penugasan</div>
      <div className="p-3 md:p-4">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium whitespace-nowrap">Area</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">Unit / Prodi</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">Mata Kuliah</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">Dosen</th>
                <th className="px-3 py-2 font-medium text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {evaluations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">Belum ada penugasan.</td>
                </tr>
              )}
              {evaluations.map((ev) => {
                const mk = ev.mata_kuliah || ev.mataKuliah;
                return (
                  <tr key={ev.id}>
                    <td className="px-3 py-2 align-top">
                      <div className="font-medium truncate max-w-[260px]">{ev.area}</div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="truncate max-w-[260px]">{ev.unit?.nama || '-'}</div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="truncate max-w-[360px] flex items-center gap-2">
                        <span className="truncate">{mk?.nama || '-'}</span>
                        {mk?.kode && (
                          <span className="whitespace-nowrap rounded border px-2 py-0.5 text-xs text-muted-foreground">{mk.kode}</span>
                        )}
                        {typeof mk?.sks === 'number' && (
                          <span className="whitespace-nowrap rounded border px-2 py-0.5 text-xs text-muted-foreground">{mk.sks} SKS</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      {ev.dosen ? (
                        <div className="truncate max-w-[260px]">
                          {ev.dosen.nama}
                          {ev.dosen.nidn ? (
                            <span className="text-xs text-muted-foreground">{' '}• NIDN {ev.dosen.nidn}</span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex justify-end gap-2">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

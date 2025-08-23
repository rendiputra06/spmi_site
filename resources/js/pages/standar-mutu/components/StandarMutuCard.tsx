import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Link } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { StandarMutu } from '../types';

interface StandarMutuCardProps {
    item: StandarMutu;
    onEdit: (item: StandarMutu) => void;
    onDelete: (id: number) => void;
    index: number;
    currentPage: number;
    perPage: number;
}

export function StandarMutuCard({ item, onEdit, onDelete, index, currentPage, perPage }: StandarMutuCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const totalQuestions = item.indikator?.reduce((sum, i) => sum + (i.pertanyaan?.length ?? 0), 0) ?? 0;

    return (
        <div className="hover:bg-muted/50 rounded-lg border p-4 transition-colors">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full font-semibold">
                            {item.kode}
                        </div>
                        <div>
                            <h3 className="font-medium">{item.nama}</h3>
                            {item.deskripsi && <p className="text-muted-foreground line-clamp-1 text-sm">{item.deskripsi}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="font-normal">
                            {item.jumlah_indikator} Indikator
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                            {totalQuestions} Pertanyaan
                        </Badge>
                        <Badge variant={item.status ? 'default' : 'secondary'}>{item.status ? 'Aktif' : 'Nonaktif'}</Badge>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/standar-mutu/${item.id}`}>
                            <span className="sr-only">Detail</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-eye"
                            >
                                <path d="M2 12s3-7.5 10-7.5 10 7.5 10 7.5-3 7.5-10 7.5-10-7.5-10-7.5Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </Link>
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>

                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDeleteDialogOpen(true);
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Hapus</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Hapus Standar Mutu</DialogTitle>
                                <DialogDescription>
                                    Apakah Anda yakin ingin menghapus standar mutu <strong>{item.nama}</strong>? 
                                    Aksi ini tidak dapat dibatalkan.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={() => {
                                        onDelete(item.id);
                                        setIsDeleteDialogOpen(false);
                                    }}
                                >
                                    Hapus
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}

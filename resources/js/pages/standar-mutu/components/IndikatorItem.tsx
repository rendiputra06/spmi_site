import { Button } from '@/components/ui/button';
import { Indikator, Pertanyaan } from '../types';
import { PertanyaanList } from './PertanyaanList';

interface IndikatorItemProps {
    indikator: Indikator;
    index: number;
    onEdit: (indikator: Indikator) => void;
    onDelete: (indikator: Indikator) => void;
    onAddPertanyaan: (indikator: Indikator) => void;
    onEditPertanyaan: (pertanyaan: Pertanyaan, indikator: Indikator) => void;
    onDeletePertanyaan: (pertanyaan: Pertanyaan, indikator: Indikator) => void;
}

export function IndikatorItem({
    indikator,
    index,
    onEdit,
    onDelete,
    onAddPertanyaan,
    onEditPertanyaan,
    onDeletePertanyaan,
}: IndikatorItemProps) {
    return (
        <li className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="font-medium">
                        {index + 1}. {indikator.nama}
                    </h3>
                    {indikator.deskripsi && (
                        <p className="text-sm text-muted-foreground">
                            {indikator.deskripsi}
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(indikator)}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(indikator)}
                    >
                        Hapus
                    </Button>
                </div>
            </div>

            <div className="mt-4 pl-4 border-l-2 border-muted">
                <PertanyaanList
                    indikator={indikator}
                    onAddPertanyaan={onAddPertanyaan}
                    onEditPertanyaan={onEditPertanyaan}
                    onDeletePertanyaan={onDeletePertanyaan}
                />
            </div>
        </li>
    );
}

import { Button } from '@/components/ui/button';
import { Indikator, Pertanyaan } from '../types';
import { PertanyaanList } from './PertanyaanList';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface IndikatorItemProps {
    indikator: Indikator;
    index: number;
    standarId: number;
    onEdit: (indikator: Indikator) => void;
    onDelete: (indikator: Indikator) => void;
    onAddPertanyaan: (indikator: Indikator) => void;
    onEditPertanyaan: (pertanyaan: Pertanyaan, indikator: Indikator) => void;
    onDeletePertanyaan: (pertanyaan: Pertanyaan, indikator: Indikator) => void;
}

export function IndikatorItem({
    indikator,
    index,
    standarId,
    onEdit,
    onDelete,
    onAddPertanyaan,
    onEditPertanyaan,
    onDeletePertanyaan,
}: IndikatorItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: indikator.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li 
            ref={setNodeRef} 
            style={style} 
            className={`rounded-lg border p-4 ${isDragging ? 'opacity-50' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                    >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-medium">
                            {index + 1}. {indikator.nama}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium capitalize">
                                {indikator.jenis_pengukuran}
                            </span>
                            {indikator.target_pencapaian && (
                                <span>Target: <b>{indikator.target_pencapaian}</b></span>
                            )}
                        </div>
                        {indikator.kriteria_penilaian && (
                            <p className="text-sm text-muted-foreground">
                                {indikator.kriteria_penilaian}
                            </p>
                        )}
                    </div>
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

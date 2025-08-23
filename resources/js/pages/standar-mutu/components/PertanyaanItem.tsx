import { Button } from '@/components/ui/button';
import { Pertanyaan } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface PertanyaanItemProps {
    pertanyaan: Pertanyaan;
    index: number;
    onEdit: (pertanyaan: Pertanyaan) => void;
    onDelete: (pertanyaan: Pertanyaan) => void;
}

export function PertanyaanItem({ pertanyaan, index, onEdit, onDelete }: PertanyaanItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: pertanyaan.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li 
            ref={setNodeRef} 
            style={style} 
            className={`flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 ${isDragging ? 'opacity-50' : ''}`}
        >
            <div className="flex items-center gap-2">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                >
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-sm">
                    {index + 1}. {pertanyaan.isi}
                </span>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => onEdit(pertanyaan)}
                >
                    Edit
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-destructive"
                    onClick={() => onDelete(pertanyaan)}
                >
                    Hapus
                </Button>
            </div>
        </li>
    );
}

import { Button } from '@/components/ui/button';
import { Pertanyaan } from '../types';

interface PertanyaanItemProps {
    pertanyaan: Pertanyaan;
    index: number;
    onEdit: (pertanyaan: Pertanyaan) => void;
    onDelete: (pertanyaan: Pertanyaan) => void;
}

export function PertanyaanItem({ pertanyaan, index, onEdit, onDelete }: PertanyaanItemProps) {
    return (
        <li className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50">
            <span className="text-sm">
                {index + 1}. {pertanyaan.isi}
            </span>
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

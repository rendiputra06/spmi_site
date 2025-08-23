import { Button } from '@/components/ui/button';
import { Indikator, Pertanyaan } from '../types';
import { PertanyaanItem } from './PertanyaanItem';

interface PertanyaanListProps {
    indikator: Indikator;
    onAddPertanyaan: (indikator: Indikator) => void;
    onEditPertanyaan: (pertanyaan: Pertanyaan, indikator: Indikator) => void;
    onDeletePertanyaan: (pertanyaan: Pertanyaan, indikator: Indikator) => void;
}

export function PertanyaanList({
    indikator,
    onAddPertanyaan,
    onEditPertanyaan,
    onDeletePertanyaan,
}: PertanyaanListProps) {
    const handleEdit = (pertanyaan: Pertanyaan) => {
        onEditPertanyaan(pertanyaan, indikator);
    };

    const handleDelete = (pertanyaan: Pertanyaan) => {
        onDeletePertanyaan(pertanyaan, indikator);
    };

    return (
        <div className="mt-4 pl-4 border-l-2 border-muted">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Pertanyaan:</h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddPertanyaan(indikator)}
                    className="h-8 text-xs"
                >
                    + Tambah Pertanyaan
                </Button>
            </div>

            {(indikator.pertanyaan?.length ?? 0) > 0 ? (
                <ol className="space-y-1">
                    {indikator.pertanyaan?.map((pertanyaan, idx) => (
                        <PertanyaanItem
                            key={pertanyaan.id}
                            pertanyaan={pertanyaan}
                            index={idx}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </ol>
            ) : (
                <p className="text-sm text-muted-foreground py-2">Belum ada pertanyaan</p>
            )}
        </div>
    );
}

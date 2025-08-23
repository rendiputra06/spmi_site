import { Indikator, Pertanyaan } from '../types';
import { IndikatorItem } from './IndikatorItem';

interface IndikatorListProps {
    indikators: Indikator[];
    onEditIndikator: (indikator: Indikator) => void;
    onDeleteIndikator: (indikator: Indikator) => void;
    onAddPertanyaan: (indikator: Indikator) => void;
    onEditPertanyaan: (pertanyaan: Pertanyaan, indikator: Indikator) => void;
    onDeletePertanyaan: (pertanyaan: Pertanyaan, indikator: Indikator) => void;
}

export function IndikatorList({
    indikators,
    onEditIndikator,
    onDeleteIndikator,
    onAddPertanyaan,
    onEditPertanyaan,
    onDeletePertanyaan,
}: IndikatorListProps) {
    if (indikators.length === 0) {
        return (
            <div className="rounded-lg border p-4 text-center text-muted-foreground">
                Belum ada indikator. Tambahkan indikator terlebih dahulu.
            </div>
        );
    }

    return (
        <ul className="space-y-4">
            {indikators.map((indikator, idx) => (
                <IndikatorItem
                    key={indikator.id}
                    indikator={indikator}
                    index={idx}
                    onEdit={onEditIndikator}
                    onDelete={onDeleteIndikator}
                    onAddPertanyaan={onAddPertanyaan}
                    onEditPertanyaan={onEditPertanyaan}
                    onDeletePertanyaan={onDeletePertanyaan}
                />
            ))}
        </ul>
    );
}

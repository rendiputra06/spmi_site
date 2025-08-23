import { Indikator, Pertanyaan } from '../types';
import { IndikatorItem } from './IndikatorItem';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

interface IndikatorListProps {
    indikators: Indikator[];
    standarId: number;
    onEditIndikator: (indikator: Indikator) => void;
    onDeleteIndikator: (indikator: Indikator) => void;
    onAddPertanyaan: (indikator: Indikator) => void;
    onEditPertanyaan: (pertanyaan: Pertanyaan, indikator: Indikator) => void;
    onDeletePertanyaan: (pertanyaan: Pertanyaan, indikator: Indikator) => void;
}

export function IndikatorList({
    indikators,
    standarId,
    onEditIndikator,
    onDeleteIndikator,
    onAddPertanyaan,
    onEditPertanyaan,
    onDeletePertanyaan,
}: IndikatorListProps) {
    const [items, setItems] = useState(indikators);
    // Keep local items in sync when props change (e.g., after CRUD)
    useEffect(() => {
        setItems(indikators);
    }, [indikators]);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        // Guard when drop target is undefined (drag canceled)
        if (!over) return;

        if (active.id !== over?.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over?.id);
            
            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);

            // Update order on server
            const urutan: Record<number, number> = {};
            newItems.forEach((item, index) => {
                urutan[item.id] = index + 1;
            });

            router.post(`/standar-mutu/${standarId}/indikator/urutan`, {
                urutan,
            }, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    }

    if (indikators.length === 0) {
        return (
            <div className="rounded-lg border p-4 text-center text-muted-foreground">
                Belum ada indikator. Tambahkan indikator terlebih dahulu.
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-4">
                    {items.map((indikator, idx) => (
                        <IndikatorItem
                            key={indikator.id}
                            indikator={indikator}
                            index={idx}
                            standarId={standarId}
                            onEdit={onEditIndikator}
                            onDelete={onDeleteIndikator}
                            onAddPertanyaan={onAddPertanyaan}
                            onEditPertanyaan={onEditPertanyaan}
                            onDeletePertanyaan={onDeletePertanyaan}
                        />
                    ))}
                </ul>
            </SortableContext>
        </DndContext>
    );
}


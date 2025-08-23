import { Button } from '@/components/ui/button';
import { Indikator, Pertanyaan } from '../types';
import { PertanyaanItem } from './PertanyaanItem';
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
    const [items, setItems] = useState(indikator.pertanyaan || []);
    // Sync local items with indikator prop updates (after CRUD or reorder)
    useEffect(() => {
        setItems(indikator.pertanyaan || []);
    }, [indikator.pertanyaan]);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleEdit = (pertanyaan: Pertanyaan) => {
        onEditPertanyaan(pertanyaan, indikator);
    };

    const handleDelete = (pertanyaan: Pertanyaan) => {
        onDeletePertanyaan(pertanyaan, indikator);
    };

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        // If drop target undefined (canceled), do nothing
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

            router.post(`/indikator/${indikator.id}/pertanyaan/urutan`, {
                urutan,
            }, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    }

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

            {(items?.length ?? 0) > 0 ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                        <ol className="space-y-1">
                            {items?.map((pertanyaan, idx) => (
                                <PertanyaanItem
                                    key={pertanyaan.id}
                                    pertanyaan={pertanyaan}
                                    index={idx}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </ol>
                    </SortableContext>
                </DndContext>
            ) : (
                <p className="text-sm text-muted-foreground py-2">Belum ada pertanyaan</p>
            )}
        </div>
    );
}

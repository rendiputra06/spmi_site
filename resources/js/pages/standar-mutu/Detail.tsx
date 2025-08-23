import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Indikator, Pertanyaan, StandarMutu } from '@/types';
import { router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import InputError from '@/components/input-error';
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
import { DraggableItem } from './DraggableItem';

interface Props {
    standar: StandarMutu;
    flash?: {
        success?: string;
    };
}

type ModalState =
    | { type: 'add_indikator' }
    | { type: 'edit_indikator'; indikator: Indikator }
    | { type: 'delete_indikator'; indikator: Indikator }
    | { type: 'add_pertanyaan'; forIndikator: Indikator }
    | { type: 'edit_pertanyaan'; pertanyaan: Pertanyaan }
    | { type: 'delete_pertanyaan'; pertanyaan: Pertanyaan }
    | null;

export default function StandarMutuDetail({ standar, flash }: Props) {
    const [modalState, setModalState] = useState<ModalState>(null);
    const [localIndikator, setLocalIndikator] = useState<Indikator[]>(standar.indikator || []);

    const indikatorForm = useForm({ nama: '' });
    const pertanyaanForm = useForm({ isi: '' });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        setLocalIndikator(standar.indikator || []);
    }, [standar.indikator]);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    useEffect(() => {
        if (indikatorForm.recentlySuccessful || pertanyaanForm.recentlySuccessful) {
            setModalState(null);
        }
    }, [indikatorForm.recentlySuccessful, pertanyaanForm.recentlySuccessful]);

    const openModal = (state: ModalState) => {
        indikatorForm.reset();
        pertanyaanForm.reset();
        if (state?.type === 'edit_indikator') {
            indikatorForm.setData('nama', state.indikator.nama);
        } else if (state?.type === 'edit_pertanyaan') {
            pertanyaanForm.setData('isi', state.pertanyaan.isi);
        }
        setModalState(state);
    };

    const handleIndikatorSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalState?.type === 'add_indikator') {
            indikatorForm.post(route('standar-mutu.indikator.store', standar.id));
        } else if (modalState?.type === 'edit_indikator') {
            indikatorForm.put(route('indikator.update', modalState.indikator.id));
        }
    };

    const handlePertanyaanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalState?.type === 'add_pertanyaan') {
            pertanyaanForm.post(route('indikator.pertanyaan.store', modalState.forIndikator.id));
        } else if (modalState?.type === 'edit_pertanyaan') {
            pertanyaanForm.put(route('pertanyaan.update', modalState.pertanyaan.id));
        }
    };

    const handleIndikatorDelete = () => {
        if (modalState?.type === 'delete_indikator') {
            indikatorForm.delete(route('indikator.destroy', modalState.indikator.id));
        }
    };

    const handlePertanyaanDelete = () => {
        if (modalState?.type === 'delete_pertanyaan') {
            pertanyaanForm.delete(route('pertanyaan.destroy', modalState.pertanyaan.id));
        }
    };

    const handleIndikatorDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = localIndikator.findIndex((i) => i.id === active.id);
            const newIndex = localIndikator.findIndex((i) => i.id === over.id);
            const reordered = arrayMove(localIndikator, oldIndex, newIndex);
            setLocalIndikator(reordered);

            const urutan = reordered.map((item, index) => ({ id: item.id, urutan: index + 1 }));
            router.post(route('standar-mutu.indikator.urutan', standar.id), { urutan }, { preserveScroll: true });
        }
    };

    const handlePertanyaanDragEnd = (indikatorId: number, event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLocalIndikator((prev) => {
                const newIndikatorList = [...prev];
                const indIndex = newIndikatorList.findIndex((i) => i.id === indikatorId);
                if (indIndex === -1) return prev;

                const ind = newIndikatorList[indIndex];
                const oldQIndex = ind.pertanyaan.findIndex((p) => p.id === active.id);
                const newQIndex = ind.pertanyaan.findIndex((p) => p.id === over.id);
                const reorderedPertanyaan = arrayMove(ind.pertanyaan, oldQIndex, newQIndex);

                newIndikatorList[indIndex] = { ...ind, pertanyaan: reorderedPertanyaan };

                const urutan = reorderedPertanyaan.map((item, index) => ({ id: item.id, urutan: index + 1 }));
                router.post(route('indikator.pertanyaan.urutan', indikatorId), { urutan }, { preserveScroll: true });

                return newIndikatorList;
            });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Standar Mutu', href: route('standar-mutu.index') },
                { title: standar.nama, href: route('standar-mutu.show', standar.id) },
            ]}
            title={`Detail Standar: ${standar.nama}`}
        >
            <Toaster richColors />
            <div className="space-y-6 p-6">
                <HeadingSmall title={standar.nama} description={standar.deskripsi || ''} />

                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Indikator</h2>
                    <Button variant="default" onClick={() => openModal({ type: 'add_indikator' })}>
                        Tambah Indikator
                    </Button>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleIndikatorDragEnd}>
                    <SortableContext items={localIndikator.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        <ul className="space-y-2">
                            {localIndikator.map((indikator, idx) => (
                                <DraggableItem key={indikator.id} id={indikator.id}>
                                    <div className="w-full rounded border bg-gray-50 p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">
                                                {idx + 1}. {indikator.nama}
                                            </span>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => openModal({ type: 'edit_indikator', indikator })}>
                                                    Edit
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => openModal({ type: 'delete_indikator', indikator })}>
                                                    Hapus
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-2 ml-6 space-y-1 border-l pl-4">
                                            <h4 className="font-medium">Pertanyaan:</h4>
                                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handlePertanyaanDragEnd(indikator.id, e)}>
                                                <SortableContext items={indikator.pertanyaan.map(q => q.id)} strategy={verticalListSortingStrategy}>
                                                    {indikator.pertanyaan.map((q, i) => (
                                                         <DraggableItem key={q.id} id={q.id}>
                                                            <div className="flex w-full items-center justify-between">
                                                                <span>{idx + 1}.{i + 1}. {q.isi}</span>
                                                                <div className="flex gap-1">
                                                                    <Button variant="outline" size="xs" onClick={() => openModal({ type: 'edit_pertanyaan', pertanyaan: q })}>Edit</Button>
                                                                    <Button variant="destructive" size="xs" onClick={() => openModal({ type: 'delete_pertanyaan', pertanyaan: q })}>Hapus</Button>
                                                                </div>
                                                            </div>
                                                        </DraggableItem>
                                                    ))}
                                                </SortableContext>
                                            </DndContext>
                                            {indikator.pertanyaan.length === 0 && <p className="text-xs text-gray-500">Belum ada pertanyaan.</p>}
                                            <Button className="mt-2" variant="secondary" size="sm" onClick={() => openModal({ type: 'add_pertanyaan', forIndikator: indikator })}>
                                                + Tambah Pertanyaan
                                            </Button>
                                        </div>
                                    </div>
                                </DraggableItem>
                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>
            </div>

            {/* All Modals are here */}
            <Dialog open={!!modalState} onOpenChange={(open) => !open && setModalState(null)}>
                <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
                    {(modalState?.type === 'add_indikator' || modalState?.type === 'edit_indikator') && (
                        <>
                            <DialogHeader><DialogTitle>{modalState.type === 'add_indikator' ? 'Tambah' : 'Edit'} Indikator</DialogTitle></DialogHeader>
                            <form onSubmit={handleIndikatorSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="indikator-nama">Nama Indikator</Label>
                                    <Input id="indikator-nama" value={indikatorForm.data.nama} onChange={(e) => indikatorForm.setData('nama', e.target.value)} required />
                                    <InputError message={indikatorForm.errors.nama} />
                                </div>
                                <Button type="submit" disabled={indikatorForm.processing}>Simpan</Button>
                            </form>
                        </>
                    )}
                    {modalState?.type === 'delete_indikator' && (
                        <>
                            <DialogHeader><DialogTitle>Hapus Indikator</DialogTitle></DialogHeader>
                            <p>Yakin ingin menghapus indikator <b>{modalState.indikator.nama}</b>? Semua pertanyaan di dalamnya juga akan terhapus.</p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setModalState(null)}>Batal</Button>
                                <Button variant="destructive" onClick={handleIndikatorDelete} disabled={indikatorForm.processing}>Konfirmasi Hapus</Button>
                            </div>
                        </>
                    )}
                    {(modalState?.type === 'add_pertanyaan' || modalState?.type === 'edit_pertanyaan') && (
                        <>
                            <DialogHeader><DialogTitle>{modalState.type === 'add_pertanyaan' ? 'Tambah' : 'Edit'} Pertanyaan</DialogTitle></DialogHeader>
                            <form onSubmit={handlePertanyaanSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="pertanyaan-isi">Isi Pertanyaan</Label>
                                    <Input id="pertanyaan-isi" value={pertanyaanForm.data.isi} onChange={(e) => pertanyaanForm.setData('isi', e.target.value)} required />
                                    <InputError message={pertanyaanForm.errors.isi} />
                                </div>
                                <Button type="submit" disabled={pertanyaanForm.processing}>Simpan</Button>
                            </form>
                        </>
                    )}
                    {modalState?.type === 'delete_pertanyaan' && (
                         <>
                         <DialogHeader><DialogTitle>Hapus Pertanyaan</DialogTitle></DialogHeader>
                         <p>Yakin ingin menghapus pertanyaan <b>{modalState.pertanyaan.isi}</b>?</p>
                         <div className="flex justify-end gap-2">
                             <Button variant="outline" onClick={() => setModalState(null)}>Batal</Button>
                             <Button variant="destructive" onClick={handlePertanyaanDelete} disabled={pertanyaanForm.processing}>Konfirmasi Hapus</Button>
                         </div>
                     </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

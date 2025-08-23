import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Indikator } from '../../types';

interface IndikatorFormProps {
    initialData?: {
        nama: string;
        deskripsi: string;
    };
    onSubmit: (data: { nama: string; deskripsi: string }) => void;
    onCancel: () => void;
    isProcessing: boolean;
}

export function IndikatorForm({ initialData, onSubmit, onCancel, isProcessing }: IndikatorFormProps) {
    const form = useForm({
        nama: initialData?.nama || '',
        deskripsi: initialData?.deskripsi || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form.data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="indikator-nama">Nama</Label>
                <Input
                    id="indikator-nama"
                    value={form.data.nama}
                    onChange={(e) => form.setData('nama', e.target.value)}
                    required
                    disabled={isProcessing}
                />
                <InputError message={form.errors.nama} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="indikator-deskripsi">Deskripsi</Label>
                <Input
                    id="indikator-deskripsi"
                    value={form.data.deskripsi}
                    onChange={(e) => form.setData('deskripsi', e.target.value)}
                    disabled={isProcessing}
                />
                <InputError message={form.errors.deskripsi} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
                    Batal
                </Button>
                <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? 'Menyimpan...' : 'Simpan'}
                </Button>
            </div>
        </form>
    );
}

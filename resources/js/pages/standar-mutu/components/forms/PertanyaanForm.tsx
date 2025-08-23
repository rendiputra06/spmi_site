import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Pertanyaan } from '../../types';

interface PertanyaanFormProps {
    initialData?: {
        isi: string;
    };
    onSubmit: (data: { isi: string }) => void;
    onCancel: () => void;
    isProcessing: boolean;
}

export function PertanyaanForm({ initialData, onSubmit, onCancel, isProcessing }: PertanyaanFormProps) {
    const form = useForm({
        isi: initialData?.isi || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Only submit if there's content in the field
        if (form.data.isi.trim() === '') {
            form.setError('isi', 'Isi pertanyaan tidak boleh kosong');
            return;
        }
        onSubmit(form.data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="pertanyaan-isi">Isi Pertanyaan</Label>
                <Input
                    id="pertanyaan-isi"
                    value={form.data.isi}
                    onChange={(e) => form.setData('isi', e.target.value)}
                    placeholder="Contoh: Apakah proses pembimbingan skripsi berjalan sesuai SOP?"
                    required
                    disabled={isProcessing}
                />
                <InputError message={form.errors.isi} />
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

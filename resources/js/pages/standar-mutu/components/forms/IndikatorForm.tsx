import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

interface IndikatorFormProps {
    initialData?: {
        nama: string;
        kriteria_penilaian?: string | null;
        jenis_pengukuran: 'kuantitatif' | 'kualitatif';
        target_pencapaian?: string | null;
    };
    onSubmit: (data: {
        nama: string;
        kriteria_penilaian?: string | null;
        jenis_pengukuran: 'kuantitatif' | 'kualitatif';
        target_pencapaian?: string | null;
    }) => void;
    onCancel: () => void;
    isProcessing: boolean;
}

export function IndikatorForm({ initialData, onSubmit, onCancel, isProcessing }: IndikatorFormProps) {
    const form = useForm({
        nama: initialData?.nama || '',
        kriteria_penilaian: initialData?.kriteria_penilaian || '',
        jenis_pengukuran: initialData?.jenis_pengukuran || 'kuantitatif',
        target_pencapaian: initialData?.target_pencapaian || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form.data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="indikator-nama">Pernyataan</Label>
                <textarea
                    id="indikator-nama"
                    value={form.data.nama}
                    onChange={(e) => form.setData('nama', e.target.value)}
                    placeholder="Tuliskan pernyataan indikator..."
                    required
                    disabled={isProcessing}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <InputError message={form.errors.nama} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="indikator-kriteria">Kriteria Penilaian</Label>
                <textarea
                    id="indikator-kriteria"
                    value={form.data.kriteria_penilaian}
                    onChange={(e) => form.setData('kriteria_penilaian', e.target.value)}
                    placeholder="Tuliskan kriteria penilaian..."
                    disabled={isProcessing}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <InputError message={form.errors.kriteria_penilaian as string} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="indikator-jenis">Jenis Pengukuran</Label>
                <select
                    id="indikator-jenis"
                    className="border rounded h-9 px-3"
                    value={form.data.jenis_pengukuran}
                    onChange={(e) => form.setData('jenis_pengukuran', e.target.value as 'kuantitatif' | 'kualitatif')}
                    disabled={isProcessing}
                >
                    <option value="kuantitatif">Kuantitatif</option>
                    <option value="kualitatif">Kualitatif</option>
                </select>
                <InputError message={form.errors.jenis_pengukuran as string} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="indikator-target">Target Pencapaian</Label>
                <Input
                    id="indikator-target"
                    value={form.data.target_pencapaian}
                    onChange={(e) => form.setData('target_pencapaian', e.target.value)}
                    placeholder="Contoh: 80% atau Grade B"
                    disabled={isProcessing}
                />
                <InputError message={form.errors.target_pencapaian as string} />
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

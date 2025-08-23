import React from 'react';
import { useForm } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';

interface StandarMutuFormProps {
    useForm: ReturnType<typeof useForm<{
        kode: string;
        nama: string;
        deskripsi: string;
        status: boolean;
    }>>;
    onSubmit: (e: React.FormEvent) => void;
    submitText?: string;
}

export default function StandarMutuForm({ useForm, onSubmit, submitText = 'Simpan' }: StandarMutuFormProps) {
    const { data, setData, errors, processing } = useForm;

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="kode">Kode</Label>
                <Input id="kode" value={data.kode} onChange={(e) => setData('kode', e.target.value)} required />
                <InputError message={errors.kode} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="nama">Nama</Label>
                <Input id="nama" value={data.nama} onChange={(e) => setData('nama', e.target.value)} required />
                <InputError message={errors.nama} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Input id="deskripsi" value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} />
                <InputError message={errors.deskripsi} />
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="status"
                    checked={data.status}
                    onChange={(e) => setData('status', e.target.checked)}
                />
                <Label htmlFor="status">Aktif</Label>
            </div>
            <Button type="submit" disabled={processing}>
                {submitText}
            </Button>
        </form>
    );
}

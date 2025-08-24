import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import type { UnitOption } from '../types';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  unitOptions: UnitOption[];
  canManageAll: boolean;
  defaultUnitId: string;
};

export function DocumentForm({ open, onOpenChange, unitOptions, canManageAll, defaultUnitId }: Props) {
  const { data, setData, post, processing, errors, reset, progress } = useForm({
    title: '',
    description: '',
    category: '',
    status: 'draft',
    unit_id: canManageAll ? defaultUnitId : '',
    file: null as File | null,
  });

  useEffect(() => {
    if (open) {
      setData('status', 'draft');
      if (canManageAll) setData('unit_id', defaultUnitId || '');
    }
  }, [open]);

  const setField = (key: keyof typeof data, value: any) => {
    setData(key, value);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/documents', {
      forceFormData: true,
      onSuccess: () => {
        onOpenChange(false);
        reset();
      },
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upload Dokumen</h2>
          <button onClick={() => onOpenChange(false)} className="text-sm text-muted-foreground">Tutup</button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="doc-title">Judul</label>
            <Input id="doc-title" value={data.title} onChange={(e) => setField('title', e.target.value)} placeholder="Judul dokumen" disabled={processing} />
            <InputError message={(errors as any).title} />
          </div>

          <div className="grid gap-2">
            <label htmlFor="doc-desc">Deskripsi</label>
            <Input id="doc-desc" value={data.description} onChange={(e) => setField('description', e.target.value)} placeholder="Deskripsi (opsional)" disabled={processing} />
            <InputError message={(errors as any).description} />
          </div>

          <div className="grid gap-2">
            <label htmlFor="doc-category">Kategori</label>
            <Input id="doc-category" value={data.category} onChange={(e) => setField('category', e.target.value)} placeholder="Kategori (opsional)" disabled={processing} />
            <InputError message={(errors as any).category} />
          </div>

          <div className="grid gap-2">
            <label htmlFor="doc-status">Status</label>
            <select id="doc-status" className="border rounded h-9 px-3" value={data.status} onChange={(e) => setField('status', e.target.value)} disabled={processing}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <InputError message={(errors as any).status} />
          </div>

          {canManageAll && (
            <div className="grid gap-2">
              <label htmlFor="doc-unit">Unit</label>
              <select id="doc-unit" className="border rounded h-9 px-3" value={data.unit_id as string} onChange={(e) => setField('unit_id', e.target.value)} disabled={processing}>
                <option value="">Pilih Unit</option>
                {unitOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama} {u.tipe ? `(${u.tipe})` : ''}
                  </option>
                ))}
              </select>
              <InputError message={(errors as any).unit_id} />
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="doc-file">File</label>
            <input id="doc-file" type="file" onChange={(e) => e.target.files && setField('file', e.target.files[0])} disabled={processing} />
            {progress && (
              <div className="h-2 w-full bg-muted rounded">
                <div className="h-2 bg-primary rounded" style={{ width: `${progress.percentage}%` }} />
              </div>
            )}
            <InputError message={(errors as any).file} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
              Batal
            </Button>
            <Button type="submit" disabled={processing}>Upload</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

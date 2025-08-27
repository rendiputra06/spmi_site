import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { UnitOption } from '../types';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  unitOptions: UnitOption[];
  canManageAll: boolean;
  defaultUnitId: string;
  mode?: 'create' | 'edit';
  initialData?: {
    id: number;
    title: string;
    description?: string | null;
    category?: string | null;
    status?: 'draft' | 'published' | 'archived' | '';
    unit_id?: number | '' | null;
    // optional current file info for edit mode display
    file_path?: string;
    mime?: string | null;
    size?: number;
  } | null;
  documentId?: number | null;
};

export function DocumentForm({ open, onOpenChange, unitOptions, canManageAll, defaultUnitId, mode = 'create', initialData = null, documentId = null }: Props) {
  const { data, setData, post, put, processing, errors, reset, progress, clearErrors } = useForm({
    title: '',
    description: '',
    category: '',
    status: 'draft',
    unit_id: canManageAll ? defaultUnitId : '',
    file: null as File | null,
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      clearErrors();
      if (mode === 'edit' && initialData) {
        setData('title', initialData.title || '');
        setData('description', initialData.description || '');
        setData('category', initialData.category || '');
        setData('status', (initialData.status as any) || 'draft');
        setData('unit_id', canManageAll ? String(initialData.unit_id ?? '') : '');
        setData('file', null);
      } else {
        setData('title', '');
        setData('description', '');
        setData('category', '');
        setData('status', 'draft');
        setData('unit_id', canManageAll ? (defaultUnitId || '') : '');
        setData('file', null);
      }
    }
  }, [open, mode, JSON.stringify(initialData)]);

  const setField = (key: keyof typeof data, value: any) => {
    setData(key, value);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'edit' && documentId) {
      if (data.file) {
        // When uploading a file on edit, build payload explicitly with _method override
        const payload: Record<string, any> = {
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status,
          unit_id: data.unit_id,
          file: data.file,
          _method: 'PUT',
        };
        router.post(`/documents/${documentId}`, payload, {
          forceFormData: true,
          onSuccess: () => {
            toast.success('Dokumen berhasil diperbarui.');
            onOpenChange(false);
            reset();
          },
          onError: (errs) => {
            const firstKey = Object.keys(errs || {})[0];
            const msg = (firstKey && (errs as any)[firstKey]) || 'Gagal memperbarui dokumen.';
            toast.error(msg);
          },
        });
      } else {
        // No file: send normal JSON PUT
        put(`/documents/${documentId}`, {
          onSuccess: () => {
            toast.success('Dokumen berhasil diperbarui.');
            onOpenChange(false);
            reset();
          },
          onError: (errs) => {
            const firstKey = Object.keys(errs || {})[0];
            const msg = (firstKey && (errs as any)[firstKey]) || 'Gagal memperbarui dokumen.';
            toast.error(msg);
          },
        });
      }
    } else {
      post('/documents', {
        forceFormData: true,
        onSuccess: () => {
          toast.success('Dokumen berhasil diunggah.');
          onOpenChange(false);
          reset();
        },
        onError: (errs) => {
          const firstKey = Object.keys(errs || {})[0];
          const msg = (firstKey && (errs as any)[firstKey]) || 'Gagal mengunggah dokumen.';
          toast.error(msg);
        },
      });
    }
  };

  const onDrop = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    setData('file', files[0]);
    toast.message(`File dipilih: ${files[0].name}`);
  }, []);

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDropZone: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      onDrop(e.dataTransfer.files);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{mode === 'edit' ? 'Edit Dokumen' : 'Upload Dokumen'}</h2>
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
            <Textarea id="doc-desc" value={data.description} onChange={(e) => setField('description', e.target.value)} placeholder="Deskripsi (opsional)" disabled={processing} rows={3} />
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
            <div
              className={`flex flex-col items-center justify-center rounded border-2 border-dashed p-6 text-center transition ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDropZone}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              {data.file ? (
                <div className="space-y-2">
                  <div className="text-sm">{data.file.name}</div>
                  <div className="text-xs text-muted-foreground">{(data.file.size / 1024).toFixed(1)} KB</div>
                  <div className="flex justify-center gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Ganti File</Button>
                    <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setField('file', null); }}>Hapus</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm">Tarik & letakkan file ke sini, atau klik untuk pilih</div>
                  <div className="text-xs text-muted-foreground">Maks 50MB. Format umum: PDF, DOCX, XLSX, PPTX, JPG/PNG</div>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="doc-file"
                type="file"
                className="hidden"
                onChange={(e) => onDrop(e.target.files)}
                disabled={processing}
              />
            </div>
            {mode === 'edit' && !data.file && initialData?.id && (
              <div className="mt-2 rounded border p-3 text-sm">
                <div className="mb-1 font-medium">File saat ini</div>
                <div className="text-muted-foreground">
                  {(initialData.mime || 'Unknown type')}
                  {typeof initialData.size === 'number' ? ` • ${(initialData.size / 1024).toFixed(1)} KB` : ''}
                </div>
                <div className="mt-2 flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a href={`/documents/${initialData.id}/download?inline=1`} target="_blank" rel="noreferrer">Preview</a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={`/documents/${initialData.id}/download`}>Unduh</a>
                  </Button>
                </div>
              </div>
            )}
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
            <Button type="submit" disabled={processing}>{mode === 'edit' ? 'Simpan Perubahan' : 'Upload'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCcw, Pencil, Copy, Trash2, Settings2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Template { id: number; nama: string; deskripsi?: string | null; questions: any[] }

interface Props { templates: Template[] }

export default function MonevTemplatesIndex({ templates }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const { data, setData, post, put, processing, reset, errors } = useForm({
    nama: '',
    deskripsi: '' as string | '',
  });

  const openAdd = () => {
    reset();
    setEditId(null);
    setIsOpen(true);
  };
  const openEdit = (t: Template) => {
    setEditId(t.id);
    setData('nama', t.nama);
    setData('deskripsi', t.deskripsi || '');
    setIsOpen(true);
  };

  const saveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      router.put(`/monev-templates/${editId}`, data as any, {
        preserveScroll: true,
        onSuccess: () => { toast.success('Template diperbarui'); setIsOpen(false); },
        onError: () => toast.error('Gagal memperbarui template'),
      });
    } else {
      router.post(`/monev-templates`, data as any, {
        preserveScroll: true,
        onSuccess: () => { toast.success('Template ditambahkan'); setIsOpen(false); },
        onError: () => toast.error('Gagal menambahkan template'),
      });
    }
  };

  const removeTemplate = (t: Template) => {
    router.delete(`/monev-templates/${t.id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success('Template dihapus'),
      onError: () => toast.error('Gagal menghapus template'),
    });
  };

  const goDetail = (t: Template) => router.get(`/monev-templates/${t.id}`);
  const duplicate = (t: Template) => {
    router.post(`/monev-templates/${t.id}/duplicate`, { stay: true }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Template diduplikasi');
        router.reload({ only: ['templates'] });
      },
      onError: () => toast.error('Gagal menduplikasi template'),
    });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Kegiatan', href: '#' }, { title: 'Template Monev', href: '/monev-templates' }]} title="Template Monev">
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Template Monev</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.get('/monev-templates')}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Muat Ulang
            </Button>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" /> Template Baru
            </Button>
          </div>
        </div>

        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2">Nama</th>
                <th className="text-left px-3 py-2">Deskripsi</th>
                <th className="text-left px-3 py-2">Jumlah Pertanyaan</th>
                <th className="text-right px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {templates.length === 0 && (
                <tr><td className="px-3 py-3 text-muted-foreground" colSpan={4}>Belum ada template.</td></tr>
              )}
              {templates.map((t) => (
                <tr key={t.id}>
                  <td className="px-3 py-2 align-top">{t.nama}</td>
                  <td className="px-3 py-2 align-top text-muted-foreground">{t.deskripsi}</td>
                  <td className="px-3 py-2 align-top">{t.questions?.length || 0}</td>
                  <td className="px-3 py-2 align-top">
                    <div className="flex gap-2 justify-end">
                      <Button variant="secondary" onClick={() => goDetail(t)}>
                        <Settings2 className="h-4 w-4 mr-2" /> Kelola Pertanyaan
                      </Button>
                      <Button variant="outline" onClick={() => openEdit(t)}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline"><Copy className="h-4 w-4 mr-2" /> Duplikasi</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Duplikasi template "{t.nama}"?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => duplicate(t)}>Duplikasi</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" /> Hapus</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus template "{t.nama}"?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => removeTemplate(t)}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Template' : 'Template Baru'}</DialogTitle>
            </DialogHeader>
            <form className="grid gap-3" onSubmit={saveTemplate}>
              <div>
                <label className="text-sm">Nama Template</label>
                <Input value={data.nama as any} onChange={e => setData('nama', e.target.value)} />
                {(errors as any).nama && <div className="text-xs text-red-500">{(errors as any).nama}</div>}
              </div>
              <div>
                <label className="text-sm">Deskripsi</label>
                <Input value={data.deskripsi as any} onChange={e => setData('deskripsi', e.target.value)} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" disabled={processing}>{editId ? 'Simpan' : (<span className="inline-flex items-center"><Plus className="h-4 w-4 mr-2" /> Tambah</span>)}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

import React, { useMemo, useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import AppLayout from '@/layouts/app-layout';
import { SurveyCard, type SurveyListItem } from './components/SurveyCard';

export default function AdminSurveysIndex() {
  const { props }: any = usePage();
  const { surveys } = props;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    is_active: true,
    starts_at: '',
    ends_at: '',
  });

  const isEdit = useMemo(() => !!editing, [editing]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', is_active: true, starts_at: '', ends_at: '' });
    setOpen(true);
  };
  const openEdit = (row: any) => {
    setEditing(row);
    setForm({
      name: row.name ?? '',
      description: row.description ?? '',
      is_active: !!row.is_active,
      starts_at: row.starts_at ? row.starts_at.substring(0, 16) : '',
      ends_at: row.ends_at ? row.ends_at.substring(0, 16) : '',
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    // HTML datetime-local returns local string; send as-is, backend expects date.
    if (!payload.starts_at) delete payload.starts_at;
    if (!payload.ends_at) delete payload.ends_at;

    const onFinish = () => setOpen(false);
    const onSuccess = () => toast.success(isEdit ? 'Survey diperbarui' : 'Survey dibuat');
    const onError = () => toast.error('Gagal menyimpan survey');

    if (isEdit) {
      router.put(`/admin/surveys/${editing.id}`,
        payload,
        { preserveScroll: true, onFinish, onSuccess, onError }
      );
    } else {
      router.post(`/admin/surveys`,
        payload,
        { preserveScroll: true, onFinish, onSuccess, onError }
      );
    }
  };

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '#' },
    { title: 'Surveys', href: '/admin/surveys' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs} title="Surveys">
      <Head title="Admin Surveys" />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Surveys</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>Buat Survey</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>{isEdit ? 'Edit Survey' : 'Buat Survey'}</DialogTitle>
                <DialogDescription>
                  {isEdit ? 'Perbarui informasi survey.' : 'Tambahkan survey baru.'}
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="is_active" checked={form.is_active} onCheckedChange={(v: any) => setForm({ ...form, is_active: !!v })} />
                  <Label htmlFor="is_active">Aktif</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="starts_at">Mulai</Label>
                    <Input id="starts_at" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ends_at">Selesai</Label>
                    <Input id="ends_at" type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                  <Button type="submit">{isEdit ? 'Simpan Perubahan' : 'Simpan'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(surveys?.data || []).map((s: SurveyListItem) => (
          <SurveyCard key={s.id} item={s} onEdit={openEdit} onDelete={(id) => {
            router.delete(`/admin/surveys/${id}`, { preserveScroll: true });
          }} />
        ))}
      </div>

      {/* Simple pagination */}
      {surveys?.links && (
        <div className="mt-4 flex gap-2">
          {surveys.links.map((l: any, idx: number) => (
            <Link
              key={idx}
              href={l.url || '#'}
              className={`px-2 py-1 border rounded ${l.active ? 'bg-gray-200' : ''} ${!l.url ? 'pointer-events-none opacity-50' : ''}`}
              dangerouslySetInnerHTML={{ __html: l.label }}
            />
          ))}
        </div>
      )}
      </div>
    </AppLayout>
  );
}

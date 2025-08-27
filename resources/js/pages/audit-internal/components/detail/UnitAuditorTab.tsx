import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { router, useForm } from '@inertiajs/react';
import { AuditorOption, UnitOption } from '../../types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type SessionUnit = {
  id: number;
  unit: UnitOption;
  auditors: Array<{ id: number; dosen: AuditorOption; role: 'auditor' | 'auditee' | 'ketua' | 'anggota' }>;
};

type Props = {
  sessionId: number;
  unitOptions: UnitOption[];
  auditorOptions: AuditorOption[];
  sessionUnits: SessionUnit[];
};

export default function UnitAuditorTab({ sessionId, unitOptions, auditorOptions, sessionUnits }: Props) {
  const [unitIdToAdd, setUnitIdToAdd] = useState<number | ''>('');
  const [unitSearch, setUnitSearch] = useState('');
  const [addingUnit, setAddingUnit] = useState(false);
  const [removingUnitId, setRemovingUnitId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const filteredUnitOptions = useMemo(() => {
    const q = unitSearch.toLowerCase();
    return unitOptions.filter((u) => `${u.nama} ${u.tipe}`.toLowerCase().includes(q));
  }, [unitOptions, unitSearch]);

  const addUnit = () => {
    if (!unitIdToAdd) return;
    setAddingUnit(true);
    router.post(`/audit-internal/${sessionId}/units`, { unit_id: unitIdToAdd }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Unit ditambahkan.');
        setUnitIdToAdd('');
      },
      onError: () => toast.error('Gagal menambahkan unit.'),
      onFinish: () => setAddingUnit(false),
    });
  };

  const removeUnit = (sessionUnitId: number) => {
    setRemovingUnitId(sessionUnitId);
    router.delete(`/audit-internal/${sessionId}/units/${sessionUnitId}`, {
      preserveScroll: true,
      onSuccess: () => toast.success('Unit dihapus.'),
      onError: () => toast.error('Gagal menghapus unit.'),
      onFinish: () => setRemovingUnitId(null),
    });
  };

  const [editingAuditorsFor, setEditingAuditorsFor] = useState<number | null>(null);
  const { data, setData, post, processing } = useForm<{ auditors: { dosen_id: number; role: 'ketua' | 'anggota' }[] }>({
    auditors: [],
  });

  const openAuditorsEditor = (sessionUnitId: number, current: Array<{ dosen: AuditorOption; role: 'auditor' | 'auditee' | 'ketua' | 'anggota' }>) => {
    setEditingAuditorsFor(sessionUnitId);
    setData('auditors', current.map((a) => ({
      dosen_id: a.dosen.id,
      role: (a.role === 'auditor' ? 'ketua' : a.role === 'auditee' ? 'anggota' : a.role) as 'ketua' | 'anggota',
    })));
  };
  const addAuditorRow = () => {
    if (!auditorOptions.length) return;
    const first = auditorOptions[0]!.id;
    setData('auditors', [...data.auditors, { dosen_id: first, role: 'anggota' }]);
  };
  const removeAuditorRow = (idx: number) => setData('auditors', data.auditors.filter((_, i) => i !== idx));
  const [auditorFilter, setAuditorFilter] = useState('');

  const saveAuditors = () => {
    if (!editingAuditorsFor) return;
    // front-end duplicate guard
    const ids = data.auditors.map((a) => a.dosen_id).filter(Boolean);
    const uniq = new Set(ids);
    if (uniq.size !== ids.length) {
      alert('Terdapat duplikasi dosen pada daftar. Mohon pastikan setiap dosen unik.');
      return;
    }
    post(`/audit-internal/${sessionId}/units/${editingAuditorsFor}/auditors`, {
      preserveScroll: true,
      onSuccess: () => {
        setEditingAuditorsFor(null);
        toast.success('Daftar auditor disimpan.');
      },
      onError: () => toast.error('Gagal menyimpan auditor/auditee.'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 text-lg font-semibold">Tambah Unit</h3>
        <div className="mb-2 max-w-sm">
          <input className="h-9 w-full rounded border px-3" placeholder="Cari unit..." value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 w-full max-w-sm rounded border px-3" value={unitIdToAdd || ''} onChange={(e) => setUnitIdToAdd(e.target.value ? Number(e.target.value) : '')} disabled={addingUnit}>
            <option value="">Pilih Unit</option>
            {filteredUnitOptions.map((u) => (
              <option key={u.id} value={u.id}>{u.nama} ({u.tipe})</option>
            ))}
          </select>
          <Button onClick={addUnit} disabled={!unitIdToAdd || addingUnit}>{addingUnit ? 'Menambah...' : 'Tambah'}</Button>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-4 text-lg font-semibold">Unit Terpilih</h3>
        {sessionUnits.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada unit ditambahkan</p>
        ) : (
          <div className="space-y-3">
            {sessionUnits.map((su) => (
              <div key={su.id} className="rounded border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{su.unit.nama}</div>
                    <div className="text-xs text-muted-foreground">Tipe: {su.unit.tipe}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openAuditorsEditor(su.id, su.auditors)}>Atur Auditor</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" onClick={() => setConfirmDeleteId(su.id)} disabled={removingUnitId === su.id}>
                          {removingUnitId === su.id ? 'Menghapus...' : 'Hapus'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Unit dari Sesi?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menghapus unit beserta pengaturan auditor/auditee terkait dari sesi ini. Tindakan tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => confirmDeleteId && removeUnit(confirmDeleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Ya, Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-muted-foreground">Auditor/Auditee:</div>
                  {su.auditors.length === 0 ? (
                    <div className="text-xs text-muted-foreground">Belum diatur</div>
                  ) : (
                    <ul className="mt-1 list-inside list-disc">
                      {su.auditors.map((a) => (
                        <li key={a.id}>
                          {a.dosen.nama} — <span>{a.role === 'ketua' ? 'Ketua' : (a.role === 'anggota' ? 'Anggota' : a.role)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auditors modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${editingAuditorsFor ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="mx-4 w-full max-w-2xl rounded-lg bg-background p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Atur Auditor/Auditee</h3>
            <Button variant="outline" onClick={() => setEditingAuditorsFor(null)} disabled={processing}>Tutup</Button>
          </div>

          <div className="space-y-3">
            {!auditorOptions.length && (
              <div className="rounded-md bg-yellow-50 p-2 text-sm text-yellow-800">Daftar dosen kosong. Tambahkan dosen terlebih dahulu.</div>
            )}
            <div>
              <input className="h-9 w-full rounded border px-3" placeholder="Cari dosen..." value={auditorFilter} onChange={(e) => setAuditorFilter(e.target.value)} disabled={processing} />
            </div>
            {data.auditors.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 items-center gap-2">
                <div className="col-span-7">
                  <label className="text-xs">Dosen</label>
                  <select className="h-9 w-full rounded border px-3" value={row.dosen_id} onChange={(e) => setData('auditors', data.auditors.map((r, i) => i === idx ? { ...r, dosen_id: Number(e.target.value) } : r))} disabled={processing || !auditorOptions.length}>
                    {auditorOptions.filter((d) => d.nama.toLowerCase().includes(auditorFilter.toLowerCase())).map((d) => {
                      const takenElsewhere = data.auditors.some((r, i) => i !== idx && r.dosen_id === d.id);
                      return (
                        <option key={d.id} value={d.id} disabled={takenElsewhere}>{d.nama}{takenElsewhere ? ' (sudah dipilih)' : ''}</option>
                      );
                    })}
                  </select>
                </div>
                <div className="col-span-4">
                  <label className="text-xs">Peran</label>
                  <select className="h-9 w-full rounded border px-3" value={row.role} onChange={(e) => setData('auditors', data.auditors.map((r, i) => i === idx ? { ...r, role: e.target.value as 'ketua' | 'anggota' } : r))} disabled={processing}>
                    <option value="ketua">Ketua</option>
                    <option value="anggota">Anggota</option>
                  </select>
                </div>
                <div className="col-span-1 flex items-end">
                  <Button variant="destructive" onClick={() => removeAuditorRow(idx)} disabled={processing}>x</Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addAuditorRow} disabled={processing || !auditorOptions.length}>+ Tambah</Button>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingAuditorsFor(null)} disabled={processing}>Batal</Button>
            <Button onClick={saveAuditors} disabled={processing || !data.auditors.length || !auditorOptions.length}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

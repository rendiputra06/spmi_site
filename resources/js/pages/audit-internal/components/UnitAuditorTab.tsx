import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { router, useForm } from '@inertiajs/react';
import { AuditorOption, UnitOption } from '../types';

type SessionUnit = {
  id: number;
  unit: UnitOption;
  auditors: Array<{ id: number; dosen: AuditorOption; role: 'auditor' | 'auditee' }>;
};

type Props = {
  sessionId: number;
  unitOptions: UnitOption[];
  auditorOptions: AuditorOption[];
  sessionUnits: SessionUnit[];
};

export default function UnitAuditorTab({ sessionId, unitOptions, auditorOptions, sessionUnits }: Props) {
  const [unitIdToAdd, setUnitIdToAdd] = useState<number | ''>('');

  const addUnit = () => {
    if (!unitIdToAdd) return;
    router.post(`/audit-internal/${sessionId}/units`, { unit_id: unitIdToAdd }, { preserveScroll: true });
  };

  const removeUnit = (sessionUnitId: number) => {
    router.delete(`/audit-internal/${sessionId}/units/${sessionUnitId}`, { preserveScroll: true });
  };

  const [editingAuditorsFor, setEditingAuditorsFor] = useState<number | null>(null);
  const { data, setData, post, processing } = useForm<{ auditors: { dosen_id: number; role: 'auditor' | 'auditee' }[] }>({
    auditors: [],
  });

  const openAuditorsEditor = (sessionUnitId: number, current: Array<{ dosen: AuditorOption; role: 'auditor' | 'auditee' }>) => {
    setEditingAuditorsFor(sessionUnitId);
    setData('auditors', current.map((a) => ({ dosen_id: a.dosen.id, role: a.role })));
  };
  const addAuditorRow = () => setData('auditors', [...data.auditors, { dosen_id: auditorOptions[0]?.id || 0, role: 'auditor' }]);
  const removeAuditorRow = (idx: number) => setData('auditors', data.auditors.filter((_, i) => i !== idx));
  const saveAuditors = () => {
    if (!editingAuditorsFor) return;
    post(`/audit-internal/${sessionId}/units/${editingAuditorsFor}/auditors`, {
      preserveScroll: true,
      onSuccess: () => setEditingAuditorsFor(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 text-lg font-semibold">Tambah Unit</h3>
        <div className="flex items-center gap-2">
          <select className="h-9 w-full max-w-sm rounded border px-3" value={unitIdToAdd || ''} onChange={(e) => setUnitIdToAdd(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Pilih Unit</option>
            {unitOptions.map((u) => (
              <option key={u.id} value={u.id}>{u.nama} ({u.tipe})</option>
            ))}
          </select>
          <Button onClick={addUnit} disabled={!unitIdToAdd}>Tambah</Button>
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
                    <Button size="sm" variant="destructive" onClick={() => removeUnit(su.id)}>Hapus</Button>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-muted-foreground">Auditor/Auditee:</div>
                  {su.auditors.length === 0 ? (
                    <div className="text-xs text-muted-foreground">Belum diatur</div>
                  ) : (
                    <ul className="mt-1 list-inside list-disc">
                      {su.auditors.map((a) => (
                        <li key={a.id}>{a.dosen.nama} — <span className="uppercase">{a.role}</span></li>
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
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${editingAuditorsFor ? 'block' : 'hidden'}`}>
        <div className="mx-4 w-full max-w-2xl rounded-lg bg-background p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Atur Auditor/Auditee</h3>
            <Button variant="outline" onClick={() => setEditingAuditorsFor(null)}>Tutup</Button>
          </div>

          <div className="space-y-3">
            {data.auditors.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 items-center gap-2">
                <div className="col-span-7">
                  <label className="text-xs">Dosen</label>
                  <select className="h-9 w-full rounded border px-3" value={row.dosen_id} onChange={(e) => setData('auditors', data.auditors.map((r, i) => i === idx ? { ...r, dosen_id: Number(e.target.value) } : r))}>
                    {auditorOptions.map((d) => (
                      <option key={d.id} value={d.id}>{d.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-4">
                  <label className="text-xs">Peran</label>
                  <select className="h-9 w-full rounded border px-3" value={row.role} onChange={(e) => setData('auditors', data.auditors.map((r, i) => i === idx ? { ...r, role: e.target.value as 'auditor' | 'auditee' } : r))}>
                    <option value="auditor">Auditor</option>
                    <option value="auditee">Auditee</option>
                  </select>
                </div>
                <div className="col-span-1 flex items-end">
                  <Button variant="destructive" onClick={() => removeAuditorRow(idx)}>x</Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addAuditorRow}>+ Tambah</Button>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingAuditorsFor(null)}>Batal</Button>
            <Button onClick={saveAuditors} disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

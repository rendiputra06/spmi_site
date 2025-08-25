import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import { StandarOption, StandarWithChildren } from '../types';
import { Eye } from 'lucide-react';

type Props = {
  sessionId: number;
  allStandars: StandarOption[];
  initialSelectedIds: number[];
};

export default function StandarTab({ sessionId, allStandars, initialSelectedIds }: Props) {
  const [filterLeft, setFilterLeft] = useState('');
  const [filterRight, setFilterRight] = useState('');
  const [selectedLeft, setSelectedLeft] = useState<number[]>([]);
  const [selectedRight, setSelectedRight] = useState<number[]>([]);
  const [rightIds, setRightIds] = useState<number[]>(initialSelectedIds);
  const [modalStandar, setModalStandar] = useState<StandarWithChildren | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setRightIds(initialSelectedIds);
  }, [initialSelectedIds]);

  const leftList = useMemo(() => {
    const ids = new Set(rightIds);
    return allStandars.filter((s) => !ids.has(s.id));
  }, [allStandars, rightIds]);

  const rightList = useMemo(() => {
    const ids = new Set(rightIds);
    return allStandars.filter((s) => ids.has(s.id));
  }, [allStandars, rightIds]);

  const filteredLeft = leftList.filter((s) => `${s.kode} ${s.nama}`.toLowerCase().includes(filterLeft.toLowerCase()));
  const filteredRight = rightList.filter((s) => `${s.kode} ${s.nama}`.toLowerCase().includes(filterRight.toLowerCase()));

  const moveRight = () => {
    if (selectedLeft.length === 0) return;
    const merged = Array.from(new Set([...rightIds, ...selectedLeft]));
    setRightIds(merged);
    setSelectedLeft([]);
  };
  const moveLeft = () => {
    if (selectedRight.length === 0) return;
    const toRemove = new Set(selectedRight);
    setRightIds(rightIds.filter((id) => !toRemove.has(id)));
    setSelectedRight([]);
  };

  const save = () => {
    setSaving(true);
    setSaveError(null);
    router.post(
      `/audit-internal/${sessionId}/standars`,
      { standar_ids: rightIds },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
        onError: (errors: any) => {
          setSaveError('Gagal menyimpan standar.');
        },
        onFinish: () => {
          setSaving(false);
        },
      }
    );
  };

  const openModal = async (standarId: number) => {
    try {
      setLoadingModal(true);
      const res = await fetch(`/standar-mutu/${standarId}.json`);
      const data: StandarWithChildren = await res.json();
      setModalStandar(data);
    } catch (e) {
      console.error(e);
      alert('Gagal memuat detail standar');
    } finally {
      setLoadingModal(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="mb-2 text-sm font-semibold">Belum Dipilih</div>
          <Input placeholder="Cari..." value={filterLeft} onChange={(e) => setFilterLeft(e.target.value)} className="mb-2" />
          <div className="max-h-80 overflow-auto rounded border">
            {filteredLeft.map((s) => (
              <label key={s.id} className="flex items-center justify-between gap-3 border-b p-2 last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-muted px-2 py-0.5 text-xs">{s.kode}</span>
                  <span className="text-sm">{s.nama}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" aria-label="Lihat detail" onClick={(e) => { e.preventDefault(); openModal(s.id); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selectedLeft.includes(s.id)}
                  onChange={(e) =>
                    setSelectedLeft((prev) => (e.target.checked ? [...prev, s.id] : prev.filter((x) => x !== s.id)))
                  }
                  />
                </div>
              </label>
            ))}
            {filteredLeft.length === 0 && <div className="p-3 text-sm text-muted-foreground">Tidak ada data</div>}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 md:col-span-2">
          <Button variant="outline" onClick={moveRight} disabled={selectedLeft.length === 0}>
            &gt;
          </Button>
          <Button variant="outline" onClick={moveLeft} disabled={selectedRight.length === 0}>
            &lt;
          </Button>
        </div>

        <div className="md:col-span-5">
          <div className="mb-2 text-sm font-semibold">Terpilih</div>
          <Input placeholder="Cari..." value={filterRight} onChange={(e) => setFilterRight(e.target.value)} className="mb-2" />
          <div className="max-h-80 overflow-auto rounded border">
            {filteredRight.map((s) => (
              <label key={s.id} className="flex items-center justify-between gap-3 border-b p-2 last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-muted px-2 py-0.5 text-xs">{s.kode}</span>
                  <span className="text-sm">{s.nama}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" aria-label="Lihat detail" onClick={(e) => { e.preventDefault(); openModal(s.id); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selectedRight.includes(s.id)}
                  onChange={(e) =>
                    setSelectedRight((prev) => (e.target.checked ? [...prev, s.id] : prev.filter((x) => x !== s.id)))
                  }
                  />
                </div>
              </label>
            ))}
            {filteredRight.length === 0 && <div className="p-3 text-sm text-muted-foreground">Tidak ada data</div>}
          </div>
        </div>
      </div>

      {saved && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">Standar berhasil disimpan.</div>
      )}
      {saveError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{saveError}</div>
      )}
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
      </div>

      {/* Modal detail standar */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${modalStandar ? 'block' : 'hidden'}`}>
        <div className="mx-4 w-full max-w-3xl rounded-lg bg-background p-6 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-semibold">
              {loadingModal ? 'Memuat...' : modalStandar ? `${modalStandar.kode} — ${modalStandar.nama}` : ''}
            </div>
            <Button variant="outline" onClick={() => setModalStandar(null)}>Tutup</Button>
          </div>
          {!loadingModal && modalStandar && (
            <div className="max-h-[60vh] overflow-auto">
              {modalStandar.indikator.length === 0 ? (
                <div className="text-sm text-muted-foreground">Belum ada indikator</div>
              ) : (
                <div className="space-y-4">
                  {modalStandar.indikator.map((ind) => (
                    <div key={ind.id} className="rounded border p-3">
                      <div className="mb-2 font-medium">{ind.urutan}. {ind.nama}</div>
                      <ul className="list-inside list-decimal pl-4 text-sm">
                        {ind.pertanyaan.map((q) => (
                          <li key={q.id}>{q.urutan}. {q.isi}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

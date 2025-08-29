import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PeriodeOpt = { id: number; kode: string; nama: string };

interface Props {
  periodes: PeriodeOpt[];
  search: string;
  setSearch: (v: string) => void;
  filterPeriode: number | '';
  onChangePeriode: (v: number | '') => void; // triggers fetch immediately
  filterTahun: number | '';
  setFilterTahun: (v: number | '') => void;
  perPage: string;
  onChangePerPage: (v: string) => void; // triggers fetch immediately
  onApply: () => void;
  onReset: () => void;
}

export default function IndexFilterBar({
  periodes,
  search,
  setSearch,
  filterPeriode,
  onChangePeriode,
  filterTahun,
  setFilterTahun,
  perPage,
  onChangePerPage,
  onApply,
  onReset,
}: Props) {
  const PER_PAGE_OPTIONS = ['10', '25', '50', '100'] as const;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onApply();
    if (e.key === 'Escape') onReset();
  };

  const handlePeriodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangePeriode(e.target.value ? Number(e.target.value) : '');
  };

  const handleTahunChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterTahun(e.target.value ? Number(e.target.value) : '');
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangePerPage(e.target.value);
  };

  return (
    <div className="rounded-lg border p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
      <div>
        <label className="text-sm" htmlFor="monev-search">Pencarian</label>
        <Input
          id="monev-search"
          placeholder="Cari nama/periode"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
      </div>
      <div>
        <label className="text-sm" htmlFor="monev-periode">Periode</label>
        <select
          id="monev-periode"
          className="w-full border rounded-md h-9 px-3"
          value={filterPeriode}
          onChange={handlePeriodeChange}
        >
          <option value="">Semua Periode</option>
          {periodes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.kode || p.nama}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm" htmlFor="monev-tahun">Tahun</label>
        <Input
          id="monev-tahun"
          type="number"
          placeholder="Contoh: 2025"
          value={filterTahun as any}
          onChange={handleTahunChange}
        />
      </div>
      <div>
        <label className="text-sm" htmlFor="monev-per-page">Per Halaman</label>
        <select
          id="monev-per-page"
          className="w-full border rounded-md h-9 px-3"
          value={perPage}
          onChange={handlePerPageChange}
        >
          {PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} / halaman
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 md:justify-end md:col-span-4">
        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
        <Button onClick={onApply}>Terapkan</Button>
      </div>
    </div>
  );
}

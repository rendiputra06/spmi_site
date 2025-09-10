import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCcw, Eye, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import IndexFilterBar from './components/IndexFilterBar';
import Pagination from './components/Pagination';
import SessionModal from './components/SessionModal';
import { router, useForm } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

type PeriodeOpt = { id: number; kode: string; nama: string };
type UnitOpt = { id: number; nama: string };
type DosenOpt = { id: number; nidn?: string; nama: string };

type ProdiRow = { unit_id: number | ''; gjm_dosen_id: number | '' };

type SessionItem = {
  id: number;
  nama: string;
  periode_id: number;
  tahun: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  periode?: PeriodeOpt;
  prodis?: Array<{ id: number; unit: UnitOpt; gjm: DosenOpt }>;
  template?: { id: number; nama: string } | null;
};

interface Props {
  sessions: { data: SessionItem[]; current_page: number; last_page: number; total: number; per_page: number; links?: { url: string | null; label: string; active: boolean }[] };
  periodes: PeriodeOpt[];
  templates: { id: number; nama: string }[];
  units: UnitOpt[];
  dosens: DosenOpt[];
  search?: string;
  filters?: { periode_id?: number | null; tahun?: number | null; per_page?: number; active_only?: boolean };
  isGjm?: boolean;
}

export default function MonevIndex({ sessions, periodes, templates, units, dosens, search: initialSearch = '', filters, isGjm = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState(initialSearch || '');
  const [filterPeriode, setFilterPeriode] = useState<number | ''>(filters?.periode_id ?? '');
  const [filterTahun, setFilterTahun] = useState<number | ''>(filters?.tahun ?? '');
  const [perPage, setPerPage] = useState<string>(String(filters?.per_page ?? sessions.per_page ?? 10));
  const [activeOnly, setActiveOnly] = useState<boolean>(!!filters?.active_only);

  const { data, setData, post, put, processing, reset, errors } = useForm({
    nama: '',
    periode_id: '' as number | '' ,
    tahun: new Date().getFullYear(),
    tanggal_mulai: '',
    tanggal_selesai: '',
    prodis: [] as ProdiRow[],
    template_id: '' as number | '',
  });

  const unitsById = useMemo(() => new Map(units.map(u => [u.id, u.nama])), [units]);

  const openAdd = () => {
    reset();
    setData('tahun', new Date().getFullYear());
    setData('prodis', []);
    setData('template_id', '');
    setEditId(null);
    setIsOpen(true);
  };

  const openEdit = (row: SessionItem) => {
    setEditId(row.id);
    setData('nama', row.nama);
    setData('periode_id', row.periode_id);
    setData('tahun', row.tahun);
    setData('tanggal_mulai', toYMD(row.tanggal_mulai));
    setData('tanggal_selesai', toYMD(row.tanggal_selesai));
    setData('prodis', (row.prodis || []).map(p => ({ unit_id: p.unit.id, gjm_dosen_id: p.gjm.id })));
    setData('template_id', (row as any).template_id ?? '');
    setIsOpen(true);
  };

  const toYMD = (value?: string) => (value ? value.split('T')[0] : '');

  const addProdiRow = () => {
    setData('prodis', [...data.prodis, { unit_id: '', gjm_dosen_id: '' }]);
  };

  const updateProdiRow = (idx: number, key: keyof ProdiRow, value: string) => {
    const next = data.prodis.slice();
    if (key === 'unit_id' || key === 'gjm_dosen_id') {
      next[idx][key] = value ? Number(value) : '';
    }
    setData('prodis', next);
  };

  const removeProdiRow = (idx: number) => {
    const next = data.prodis.slice();
    next.splice(idx, 1);
    setData('prodis', next);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      put(`/monev/${editId}`, {
        preserveScroll: true,
        onSuccess: () => {
          setIsOpen(false);
          toast.success('Sesi Monev diperbarui');
        },
        onError: () => toast.error('Gagal memperbarui sesi Monev'),
      });
    } else {
      post('/monev', {
        preserveScroll: true,
        onSuccess: () => {
          setIsOpen(false);
          toast.success('Sesi Monev ditambahkan');
        },
        onError: () => toast.error('Gagal menambahkan sesi Monev'),
      });
    }
  };

  const deleteSession = (row: SessionItem) => {
    router.delete(`/monev/${row.id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success('Sesi Monev dihapus'),
      onError: () => toast.error('Gagal menghapus sesi Monev'),
    });
  };

  const buildParams = (overrides: Record<string, any> = {}) => {
    const params: Record<string, any> = {};
    const s = overrides.search !== undefined ? overrides.search : search;
    const p = overrides.periode_id !== undefined ? overrides.periode_id : filterPeriode;
    const t = overrides.tahun !== undefined ? overrides.tahun : filterTahun;
    const pp = overrides.per_page !== undefined ? overrides.per_page : perPage;
    const ao = overrides.active_only !== undefined ? overrides.active_only : activeOnly;
    if (s) params.search = s;
    if (p) params.periode_id = p;
    if (t) params.tahun = t;
    if (pp) params.per_page = pp;
    if (ao) params.active_only = 1;
    return params;
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > sessions.last_page || page === sessions.current_page) return;
    router.get('/monev', { page, ...buildParams() }, { preserveScroll: true, preserveState: true, replace: true });
  };

  const applyFilters = () => {
    router.get('/monev', buildParams(), { preserveScroll: true, preserveState: true, replace: true });
  };

  const resetFilters = () => {
    setSearch('');
    setFilterPeriode('');
    setFilterTahun('');
    setPerPage('10');
    setActiveOnly(false);
    router.get('/monev', { per_page: 10 }, { preserveScroll: true, preserveState: true, replace: true });
  };

  // Debounce search like Mata Kuliah page
  React.useEffect(() => {
    const t = setTimeout(() => {
      router.get('/monev', buildParams(), { preserveState: true, replace: true, preserveScroll: true });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <AppLayout breadcrumbs={[{ title: 'Kegiatan', href: '#' }, { title: 'Monev', href: '/monev' }]} title="Monev">
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Monev</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.get('/monev', buildParams(), { preserveScroll: true, preserveState: true, replace: true })}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Muat Ulang
            </Button>
            {!isGjm && (
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" /> Tambah Sesi
              </Button>
            )}
          </div>
        </div>

        {/* Search & Filters */}
        <IndexFilterBar
          periodes={periodes}
          search={search}
          setSearch={setSearch}
          filterPeriode={filterPeriode}
          onChangePeriode={(val) => { setFilterPeriode(val); router.get('/monev', buildParams({ periode_id: val }), { preserveState: true, replace: true, preserveScroll: true }); }}
          filterTahun={filterTahun}
          setFilterTahun={setFilterTahun}
          perPage={perPage}
          onChangePerPage={(val) => { setPerPage(val); router.get('/monev', buildParams({ per_page: val }), { preserveState: true, replace: true, preserveScroll: true }); }}
          onApply={applyFilters}
          onReset={resetFilters}
          activeOnly={activeOnly}
          setActiveOnly={(v) => setActiveOnly(v)}
        />

        {/* List */}
        <div className="rounded-lg border divide-y">
          {sessions.data.length === 0 && (
            <div className="p-4 text-muted-foreground">Belum ada sesi.</div>
          )}
          {sessions.data.map((s) => (
            <div key={s.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-base md:text-lg font-semibold truncate">{s.nama}</div>
                <div className="text-sm text-muted-foreground truncate">
                  Periode: {s.periode?.kode || s.periode?.nama || s.periode_id} • Tahun: {s.tahun}
                  {' '}• {toYMD(s.tanggal_mulai)} s/d {toYMD(s.tanggal_selesai)}
                </div>
                {s.template && (
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Template: {s.template.nama}</span>
                  </div>
                )}
                {s.prodis && s.prodis.length > 0 && (
                  <div className="text-sm text-muted-foreground mt-1 truncate">
                    Prodi ({s.prodis.length}): {s.prodis.map(p => unitsById.get(p.unit.id)).filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
              <div className="shrink-0 flex gap-2">
                <Button variant="secondary" onClick={() => router.get(`/monev/${s.id}/detail`)}>
                  <Eye className="h-4 w-4 mr-2" /> Detail
                </Button>
                {!isGjm && (
                  <>
                    <Button variant="outline" onClick={() => openEdit(s)}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" /> Hapus</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus sesi Monev "{s.nama}"?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteSession(s)}>
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={sessions.current_page}
          lastPage={sessions.last_page}
          total={sessions.total}
          links={sessions.links as any}
          onClickLink={(url: string) => {
            const parsed = new URL(url);
            const page = parsed.searchParams.get('page');
            router.get('/monev', { ...buildParams(), page: page || undefined }, { preserveScroll: true, preserveState: true, replace: true });
          }}
          onPrev={() => goToPage(sessions.current_page - 1)}
          onNext={() => goToPage(sessions.current_page + 1)}
        />

        {/* Modal Add/Edit */}
        <SessionModal
          open={isOpen}
          onOpenChange={setIsOpen}
          isEditing={!!editId}
          data={data as any}
          errors={errors as any}
          processing={processing}
          periodes={periodes}
          templates={templates}
          units={units}
          dosens={dosens}
          onSubmit={onSubmit}
          onChangeField={(key, value) => setData(key as any, value)}
          onAddProdi={addProdiRow}
          onChangeProdiUnit={(idx, value) => updateProdiRow(idx, 'unit_id', value)}
          onChangeProdiGjm={(idx, value) => updateProdiRow(idx, 'gjm_dosen_id', value)}
          onRemoveProdi={removeProdiRow}
        />
      </div>
    </AppLayout>
  );
}

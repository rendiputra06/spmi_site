import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import React from 'react';
import { DosenFormData } from '../types';

type Props = {
  data: DosenFormData;
  setData: <K extends keyof DosenFormData>(key: K, value: DosenFormData[K]) => void;
  errors: Partial<Record<keyof DosenFormData, string>> & Record<string, string>;
  processing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEdit?: boolean;
  roles?: string[]; // available roles from backend
  isLinked?: boolean; // whether dosen already linked to a user
};

export function DosenForm({ data, setData, errors, processing, onSubmit, onCancel, isEdit, roles = [], isLinked = false }: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="dosen-nidn">NIDN</Label>
        <Input
          id="dosen-nidn"
          value={data.nidn}
          onChange={(e) => setData('nidn', e.target.value)}
          placeholder="Contoh: 0011223344"
          required
          disabled={processing || isEdit}
        />
        <InputError message={errors.nidn} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dosen-nama">Nama</Label>
        <Input
          id="dosen-nama"
          value={data.nama}
          onChange={(e) => setData('nama', e.target.value)}
          placeholder="Contoh: Dr. Andi Saputra, M.Kom."
          required
          disabled={processing}
        />
        <InputError message={errors.nama} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dosen-email">Email</Label>
        <Input
          id="dosen-email"
          type="email"
          value={data.email}
          onChange={(e) => setData('email', e.target.value)}
          placeholder="nama.dosen@example.com"
          required
          disabled={processing}
        />
        <InputError message={errors.email} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dosen-prodi">Program Studi</Label>
        <Input
          id="dosen-prodi"
          value={data.prodi || ''}
          onChange={(e) => setData('prodi', e.target.value)}
          placeholder="Contoh: Informatika"
          disabled={processing}
        />
        <InputError message={errors.prodi} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dosen-jabatan">Jabatan Fungsional</Label>
        <Input
          id="dosen-jabatan"
          value={data.jabatan || ''}
          onChange={(e) => setData('jabatan', e.target.value)}
          placeholder="Contoh: Lektor, Lektor Kepala"
          disabled={processing}
        />
        <InputError message={errors.jabatan} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dosen-pangkat">Pangkat/Golongan</Label>
        <Input
          id="dosen-pangkat"
          value={data.pangkat_golongan || ''}
          onChange={(e) => setData('pangkat_golongan', e.target.value)}
          placeholder="Contoh: III/c, IV/a"
          disabled={processing}
        />
        <InputError message={errors.pangkat_golongan} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dosen-pendidikan">Pendidikan Terakhir</Label>
        <Input
          id="dosen-pendidikan"
          value={data.pendidikan_terakhir || ''}
          onChange={(e) => setData('pendidikan_terakhir', e.target.value)}
          placeholder="Contoh: S2, S3"
          disabled={processing}
        />
        <InputError message={errors.pendidikan_terakhir} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dosen-status">Status</Label>
        <select
          id="dosen-status"
          className="border rounded h-9 px-3"
          value={data.status ? '1' : '0'}
          onChange={(e) => setData('status', e.target.value === '1')}
          disabled={processing}
        >
          <option value="1">Aktif</option>
          <option value="0">Non-aktif</option>
        </select>
        <InputError message={errors.status as unknown as string} />
      </div>

      {/* Opsi Akun Pengguna */}
      <div className="space-y-2 rounded-md border p-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!data.create_user}
            onChange={(e) => setData('create_user', e.target.checked)}
            disabled={processing || isLinked}
          />
          <span>Buat akun pengguna untuk dosen ini</span>
        </label>
        {data.create_user && !isLinked ? (
          <div className="ml-6 space-y-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={!!data.send_invite}
                onChange={(e) => setData('send_invite', e.target.checked)}
                disabled={processing}
              />
              <span>Kirim email undangan (reset password)</span>
            </label>
            <div className="grid gap-2">
              <Label htmlFor="user-roles" className="text-xs">Role User (boleh lebih dari satu)</Label>
              <select
                id="user-roles"
                multiple
                className="border rounded px-3 py-2 text-sm h-28"
                value={data.user_roles || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                  setData('user_roles', selected);
                }}
                disabled={processing}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <InputError message={errors.user_roles as unknown as string} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-password" className="text-xs">Password (opsional)</Label>
              <input
                id="user-password"
                type="text"
                className="border rounded h-9 px-3 text-sm"
                value={data.password || ''}
                onChange={(e) => setData('password', e.target.value)}
                placeholder="Kosongkan untuk password acak"
                disabled={processing}
              />
            </div>
          </div>
        ) : null}
        {isLinked && (
          <p className="ml-1 text-xs text-muted-foreground">Akun pengguna sudah terhubung. Pengaturan akun tidak dapat diubah dari sini.</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
          Batal
        </Button>
        <Button type="submit" disabled={processing}>
          {processing ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}

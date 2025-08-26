import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { StandarMutu } from '../types';
import { ChangeEvent } from 'react';

interface FormData {
  kode: string;
  nama: string;
  deskripsi: string;
  status: boolean;
}

interface StandarMutuFormProps {
  data: FormData;
  setData: (key: keyof FormData, value: any) => void;
  errors: Partial<Record<keyof FormData, string>>;
  processing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function StandarMutuForm({
  data,
  setData,
  errors,
  processing,
  onSubmit,
  onCancel,
  isEdit = false
}: StandarMutuFormProps) {
  const handleChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e as React.ChangeEvent<HTMLInputElement>).target.checked 
      : e.target.value;
    setData(field, value);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="kode">Kode</Label>
        <Input 
          id="kode" 
          value={data.kode}
          onChange={(e) => setData('kode', e.target.value.toUpperCase())}
          required 
          disabled={isEdit}
          className="font-mono uppercase tracking-wider"
          placeholder="Contoh: STD-01"
          aria-describedby="kode-help"
        />
        <span id="kode-help" className="text-[11px] text-muted-foreground">Gunakan format kode konsisten, misal: STD-01</span>
        <InputError message={errors.kode} />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="nama">Nama</Label>
        <Input 
          id="nama" 
          value={data.nama} 
          onChange={handleChange('nama')} 
          required 
        />
        <InputError message={errors.nama} />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="deskripsi">Deskripsi</Label>
        <textarea
          id="deskripsi"
          value={data.deskripsi}
          onChange={handleChange('deskripsi')}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <InputError message={errors.deskripsi} />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="status"
          checked={data.status}
          onChange={handleChange('status')}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="status" className="text-sm font-medium leading-none">
          Aktif
        </Label>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={processing}
        >
          Batal
        </Button>
        <Button 
          type="submit" 
          disabled={processing}
        >
          {processing ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}

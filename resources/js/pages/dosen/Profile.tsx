import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head } from '@inertiajs/react';

interface Unit {
  id: number;
  nama: string;
}

interface DosenProps {
  dosen: {
    id: number;
    nidn: string | null;
    nama: string;
    email: string | null;
    jabatan?: string | null;
    pangkat_golongan?: string | null;
    pendidikan_terakhir?: string | null;
    status: boolean;
    unit?: Unit | null;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Profil Dosen', href: '/my/dosen' },
];

export default function DosenProfile({ dosen }: DosenProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs} title="Profil Dosen">
      <Head title="Profil Dosen" />
      <div className="p-4 md:p-6">
        <Card className="p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{dosen.nama}</h1>
            <p className="text-sm text-muted-foreground">{dosen.email || '-'}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">NIDN</div>
              <div className="font-medium">{dosen.nidn || '-'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Unit</div>
              <div className="font-medium">{dosen.unit?.nama || '-'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Jabatan</div>
              <div className="font-medium">{dosen.jabatan || '-'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Pangkat/Golongan</div>
              <div className="font-medium">{dosen.pangkat_golongan || '-'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Pendidikan Terakhir</div>
              <div className="font-medium">{dosen.pendidikan_terakhir || '-'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="font-medium">
                {dosen.status ? (
                  <Badge variant="secondary">Aktif</Badge>
                ) : (
                  <Badge variant="outline">Non-aktif</Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

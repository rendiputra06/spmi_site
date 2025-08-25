import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Profil Dosen', href: '/my/dosen' },
];

export default function ProfileMissing() {
  return (
    <AppLayout breadcrumbs={breadcrumbs} title="Profil Dosen">
      <Head title="Profil Dosen" />
      <div className="p-4 md:p-6">
        <Card className="p-6 space-y-3">
          <h1 className="text-xl font-semibold">Data Dosen Tidak Ditemukan</h1>
          <p className="text-sm text-muted-foreground">
            Akun Anda belum terhubung dengan data dosen. Silakan hubungi admin untuk mengaitkan akun dengan data dosen Anda.
          </p>
          <div>
            <Button asChild variant="outline" size="sm">
              <a href="/dashboard">Kembali ke Dashboard</a>
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';

interface Assignment {
  id: number;
  status: 'draft' | 'submitted';
  submitted_at?: string | null;
  survey: {
    id: number;
    name: string;
    description?: string | null;
  };
}

interface PageProps {
  assignments: Assignment[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Monev Dosen', href: '/monev-dosen' },
];

export default function MonevDosenIndex({ assignments }: PageProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs} title="Monev Dosen">
      <Head title="Monev Dosen" />

      <div className="p-4 md:p-6 space-y-4">
        {assignments.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Belum ada survei yang ditugaskan.
          </Card>
        ) : (
          <div className="grid gap-4">
            {assignments.map((a) => (
              <Card key={a.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">{a.survey.name}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">{a.survey.description}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={a.status === 'submitted' ? 'secondary' : 'outline'}>
                    {a.status}
                  </Badge>
                  <Button asChild size="sm">
                    <Link href={`/monev-dosen/assignments/${a.id}`}>
                      {a.status === 'submitted' ? 'Lihat' : 'Isi'}
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

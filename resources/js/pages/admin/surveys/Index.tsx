import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
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
import AppLayout from '@/layouts/app-layout';

export default function AdminSurveysIndex() {
  const { props }: any = usePage();
  const { surveys } = props;
  const [deleteRow, setDeleteRow] = useState<any | null>(null);

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '#' },
    { title: 'Surveys', href: '/admin/surveys' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs} title="Surveys">
      <Head title="Admin Surveys" />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Surveys</h1>
          <Link href="/admin/surveys/create">
            <Button>Buat Survey</Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Active</th>
              <th className="px-3 py-2 text-left">Questions</th>
              <th className="px-3 py-2 text-left">Assignments</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(surveys?.data || []).map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2">{s.is_active ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2">{s.questions_count}</td>
                <td className="px-3 py-2">{s.assignments_count}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/surveys/${s.id}/edit`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteRow(s)}>Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus survey ini?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menghapus survey "{deleteRow?.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              if (!deleteRow) return;
                              router.delete(`/admin/surveys/${deleteRow.id}`, {
                                preserveScroll: true,
                                onFinish: () => setDeleteRow(null),
                              });
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Simple pagination */}
      {surveys?.links && (
        <div className="mt-4 flex gap-2">
          {surveys.links.map((l: any, idx: number) => (
            <Link
              key={idx}
              href={l.url || '#'}
              className={`px-2 py-1 border rounded ${l.active ? 'bg-gray-200' : ''} ${!l.url ? 'pointer-events-none opacity-50' : ''}`}
              dangerouslySetInnerHTML={{ __html: l.label }}
            />
          ))}
        </div>
      )}
      </div>
    </AppLayout>
  );
}

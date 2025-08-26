import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function AdminSurveysIndex() {
  const { props }: any = usePage();
  const { surveys } = props;

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '#' },
    { title: 'Surveys', href: '/admin/surveys' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs} title="Surveys">
      <Head title="Admin Surveys" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Surveys</h1>
        <Link href="/admin/surveys/create" className="btn btn-primary">New Survey</Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
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
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/surveys/${s.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={() => {
                        if (confirm(`Hapus survey \"${s.name}\"?`)) {
                          router.delete(`/admin/surveys/${s.id}`, { preserveScroll: true });
                        }
                      }}
                    >
                      Delete
                    </button>
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
            <Link key={idx} href={l.url || '#'} className={`px-2 py-1 border rounded ${l.active ? 'bg-gray-200' : ''}`} dangerouslySetInnerHTML={{ __html: l.label }} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

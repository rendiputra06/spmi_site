import React from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, UserRound, RefreshCw, Trash2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

dayjs.extend(relativeTime);
dayjs.locale('id');

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'User Management',
    href: '/users',
  },
];

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  roles: {
    id: number;
    name: string;
  }[];
}

interface Props {
  users: {
    data: User[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function UserIndex({ users }: Props) {
  const { delete: destroy, processing } = useForm();
  const page = usePage();
  const isImpersonating = (page.props as any)?.auth?.isImpersonating as boolean;
  const canImpersonate = (page.props as any)?.auth?.canImpersonate as boolean;

  const handleDelete = (id: number) => {
    destroy(`/users/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        // Data akan otomatis terupdate karena Inertia.js
      },
      onError: (errors) => {
        console.error('Delete failed:', errors);
      }
    });
  };

  const handleResetPassword = (id: number) => {
    router.put(`/users/${id}/reset-password`, {}, { preserveScroll: true });
  };

  const handleImpersonate = (id: number) => {
    router.post(`/users/${id}/impersonate`, {}, { preserveScroll: true });
  };

  const handleStopImpersonate = () => {
    router.delete(`/impersonate/stop`, { preserveScroll: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="User Management" />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage user data and their roles within the system.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/users/create">
              <Button className="w-full md:w-auto" size="sm">+ Add User</Button>
            </Link>
            {isImpersonating && (
              <Button size="sm" variant="secondary" onClick={handleStopImpersonate}>Stop Impersonate</Button>
            )}
          </div>
        </div>

        <div className="space-y-2 divide-y rounded-md border bg-background">
          {users.data.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No user data available.</div>
          ) : (
            users.data.map((user) => (
              <div
                key={user.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-5 hover:bg-muted/50 transition"
              >
                {/* Avatar dan Informasi */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-semibold text-primary">
                    {getInitials(user.name)}
                  </div>
                  <div className="space-y-1">
                    <div className="text-base font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground italic">
                      Registered {dayjs(user.created_at).fromNow()}
                    </div>
                    {user.roles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role.id} variant="secondary" className="text-xs font-normal">
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Aksi */}
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Link href={`/users/${user.id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>

                  {canImpersonate && !isImpersonating && (
                    <Button size="sm" variant="secondary" onClick={() => handleImpersonate(user.id)}>
                      <UserRound className="mr-2 h-4 w-4" />
                      Impersonate
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="secondary">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Password?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Password for <strong>{user.name}</strong> will be reset to:
                          <br />
                          <code className="bg-muted rounded px-2 py-1 text-sm">ResetPasswordNya</code>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleResetPassword(user.id)}
                          disabled={processing}
                        >
                          Yes, Reset
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User?</AlertDialogTitle>
                        <AlertDialogDescription>
                          User <strong>{user.name}</strong> will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(user.id)}
                          disabled={processing}
                        >
                          Yes, Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

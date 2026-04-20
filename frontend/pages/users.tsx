'use client';

import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/AuthContext';
import { api, UserSummary } from '@/lib/api';
import { toast } from 'sonner';
import { FiAlertCircle, FiCalendar, FiCheckCircle, FiMail, FiRefreshCw, FiSearch, FiShield, FiUser, FiUsers } from 'react-icons/fi';

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'n/a' : date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UsersPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.auth.getUsers();
      setUsers(data);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load users';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user?.role]);

  const filteredUsers = users.filter((entry) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [entry.email, entry.firstName, entry.lastName, entry.role].some((field) => field?.toLowerCase().includes(query));
  });

  const activeCount = users.filter((entry) => entry.isActive).length;
  const adminCount = users.filter((entry) => entry.role === 'admin').length;
  const inactiveCount = users.length - activeCount;

  if (user?.role !== 'admin') {
    return (
      <ProtectedRoute>
        <Layout>
          <main className="flex min-h-screen items-center justify-center px-4 py-8">
            <Card className="max-w-lg border-0 bg-white/85 shadow-2xl backdrop-blur-xl">
              <CardContent className="space-y-4 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
                  <FiShield className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">Admin access required</h1>
                  <p className="mt-2 text-sm text-slate-600">
                    Your account can sign in, but it does not have permission to manage users.
                  </p>
                </div>
                <Button onClick={() => window.location.assign('/dashboard')} className="w-full rounded-2xl">
                  Back to dashboard
                </Button>
              </CardContent>
            </Card>
          </main>
        </Layout>
      </ProtectedRoute>
    );
  }

  const handleToggleStatus = async (entry: UserSummary) => {
    try {
      setSavingId(entry.id);
      const updatedUser = await api.auth.updateUserStatus(entry.id, !entry.isActive);
      setUsers((currentUsers) =>
        currentUsers.map((current) => (current.id === updatedUser.id ? updatedUser : current)),
      );
      toast.success(`${updatedUser.email} updated`);
    } catch (toggleError) {
      const message = toggleError instanceof Error ? toggleError.message : 'Unable to update user status';
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <main className="relative min-h-screen px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-2xl">
                <CardContent className="relative space-y-5 p-6 sm:p-8 md:p-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.32),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(34,211,238,0.28),_transparent_32%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(8,47,73,0.92))]" />
                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-cyan-200/80">
                      <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Admin workspace</span>
                      <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Account control</span>
                    </div>

                    <div className="mt-5 max-w-3xl space-y-3">
                      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                        User management.
                      </h1>
                      <p className="max-w-2xl text-sm leading-6 text-slate-200/85 sm:text-base">
                        Review active accounts, inspect access levels, and quickly enable or disable operators from one place.
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Total users</p>
                        <p className="mt-2 text-3xl font-semibold">{users.length}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Active</p>
                        <p className="mt-2 text-3xl font-semibold text-emerald-300">{activeCount}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Admins</p>
                        <p className="mt-2 text-3xl font-semibold text-cyan-300">{adminCount}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Inactive</p>
                        <p className="mt-2 text-3xl font-semibold text-amber-300">{inactiveCount}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl">
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                        <FiShield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Signed in as</p>
                        <h2 className="text-lg font-semibold text-slate-900">{user?.email}</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <p className="text-xs font-medium text-slate-500">Role</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900 capitalize">{user?.role ?? 'user'}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <p className="text-xs font-medium text-slate-500">Visibility</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">Full access</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl">
                  <CardContent className="space-y-3 p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Search</p>
                        <h2 className="mt-1 text-lg font-semibold text-slate-900">Filter accounts</h2>
                      </div>
                      <FiUsers className="h-5 w-5 text-cyan-500" />
                    </div>
                    <div className="relative">
                      <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by email, name, or role"
                        className="h-11 rounded-2xl border-slate-200 bg-white/80 pl-11"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="grid gap-4">
              <Card className="border-0 bg-white/85 shadow-xl backdrop-blur-xl">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Account list</p>
                      <CardTitle className="mt-1 text-xl text-slate-900">Registered operators</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading} className="gap-2">
                      <FiRefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                      Reload
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {error && (
                    <div className="m-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                      <FiAlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {loading ? (
                    <div className="space-y-3 p-4 sm:p-6">
                      {[1, 2, 3].map((index) => (
                        <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                      ))}
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                      No users match the current filter.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {filteredUsers.map((entry) => {
                        const name = [entry.firstName, entry.lastName].filter(Boolean).join(' ') || entry.email;

                        return (
                          <div key={entry.id} className="grid gap-4 p-4 sm:grid-cols-[1.3fr_1fr_auto] sm:items-center sm:p-5">
                            <div className="flex items-start gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                <FiUser className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold text-slate-900">{name}</h3>
                                  <Badge variant={entry.isActive ? 'success' : 'warning'}>{entry.isActive ? 'active' : 'inactive'}</Badge>
                                </div>
                                <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                                  <FiMail className="h-4 w-4" />
                                  <span className="truncate">{entry.email}</span>
                                </p>
                                <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                  <FiCalendar className="h-3.5 w-3.5" />
                                  Joined {formatDate(entry.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <Badge variant="default" className="capitalize">
                                {entry.role}
                              </Badge>
                              {entry.role === 'admin' && <Badge variant="secondary">privileged</Badge>}
                            </div>

                            <div className="flex justify-start sm:justify-end">
                              <Button
                                variant={entry.isActive ? 'outline' : 'default'}
                                onClick={() => handleToggleStatus(entry)}
                                disabled={savingId === entry.id}
                                className="min-w-[124px] gap-2"
                              >
                                {savingId === entry.id ? (
                                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                                ) : entry.isActive ? (
                                  <FiAlertCircle className="h-4 w-4" />
                                ) : (
                                  <FiCheckCircle className="h-4 w-4" />
                                )}
                                {entry.isActive ? 'Disable' : 'Enable'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </Layout>
    </ProtectedRoute>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, HealthResponse, WelcomeResponse } from '@/lib/api';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/lib/LanguageContext';
import { FiActivity, FiAlertCircle, FiArrowRight, FiCheckCircle, FiDroplet, FiLoader, FiShield, FiTrendingUp, FiUsers } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-100">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-200/80">{detail}</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { language } = useLanguage();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [message, setMessage] = useState<WelcomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [healthData, messageData] = await Promise.all([api.health(), api.welcome()]);
        setHealth(healthData);
        setMessage(messageData);
      } catch (fetchError) {
        const errorMessage = fetchError instanceof Error ? fetchError.message : t('common.error', language as 'en' | 'mg');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [language]);

  const isHealthy = health?.status?.toLowerCase() === 'ok';
  const statusLabel = isHealthy ? t('common.ok', language as 'en' | 'mg') : health?.status ?? 'offline';
  const statusMessage = isHealthy ? t('common.serverRunning', language as 'en' | 'mg') : health?.message ?? 'Waiting for connection';
  const welcomeMessage = message?.message?.toLowerCase() === 'welcome to arorano api!' ? t('api.welcome', language as 'en' | 'mg') : message?.message ?? 'Connected';

  return (
    <Layout showSidebar={false}>
      <main className="relative overflow-hidden px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(15,118,110,0.12),_transparent_24%)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 lg:gap-8">
          <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-2xl">
              <div className="relative p-6 sm:p-8 md:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.28),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.25),_transparent_32%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(8,47,73,0.92))]" />
                <div className="relative grid gap-8 xl:grid-cols-[1fr_320px] xl:items-center">
                  <div className="space-y-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                      <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-[2rem] border border-white/20 bg-cyan-500/10 p-4 shadow-2xl">
                        <Image src="/images/logo.PNG" alt="AroRano logo" width={128} height={128} className="h-full w-full rounded-[1.5rem] object-contain" unoptimized />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.32em] text-cyan-200/70">AroRano</p>
                        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Water monitoring, simplified.</h1>
                      </div>
                    </div>

                    <p className="max-w-2xl text-base leading-8 text-slate-200/90 sm:text-lg">
                      Real-time reservoir monitoring, operator accounts, and IoT telemetry in one polished control surface.
                      Built for Malagasy operators who need signal, not noise.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400">
                        Open dashboard <FiArrowRight size={16} />
                      </Link>
                      <Link href="/register" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                        Create account
                      </Link>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <StatCard label="Telemetry" value={isHealthy ? 'Online' : 'Standby'} detail={statusMessage} icon={FiActivity} />
                    <StatCard label="Security" value="Protected" detail="JWT-based access and user roles" icon={FiUsers} />
                    <StatCard label="Status" value={statusLabel} detail={welcomeMessage} icon={FiCheckCircle} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Platform overview</p>
                  <CardTitle className="text-xl text-slate-900">Control, monitor, and respond faster.</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl bg-cyan-50 p-4">
                    <FiDroplet className="h-5 w-5 text-cyan-600" />
                    <p className="mt-3 text-sm font-semibold text-slate-900">Reservoir status</p>
                    <p className="mt-1 text-sm text-slate-600">Live water level and pump visibility.</p>
                  </div>
                  <div className="rounded-2xl bg-violet-50 p-4">
                    <FiTrendingUp className="h-5 w-5 text-violet-600" />
                    <p className="mt-3 text-sm font-semibold text-slate-900">Trend analysis</p>
                    <p className="mt-1 text-sm text-slate-600">Track changes and spot anomalies quickly.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl">
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">API status</p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-900">Backend connectivity</h2>
                    </div>
                    <FiAlertCircle className={loading ? 'h-5 w-5 animate-pulse text-slate-400' : isHealthy ? 'h-5 w-5 text-emerald-500' : 'h-5 w-5 text-red-500'} />
                  </div>

                  {loading ? (
                    <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
                      <FiLoader className="h-4 w-4 animate-spin" />
                      Checking live service health...
                    </div>
                  ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {error}
                    </div>
                  ) : (
                    <>
                      <div className={`rounded-2xl border p-4 ${isHealthy ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Health</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{statusLabel}</p>
                        <p className="mt-1 text-sm text-slate-600">{statusMessage}</p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                        The dashboard and user management flows are protected by JWT auth and role-aware navigation.
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/lib/LanguageContext';
import { translations } from '@/lib/i18n';
import { FiArrowRight } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <Layout showSidebar={false}>
      <main className="relative overflow-hidden px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(15,118,110,0.12),_transparent_24%)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 lg:gap-8">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-2xl">
            <div className="relative flex min-h-[72vh] items-center justify-center p-6 sm:p-8 md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.28),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.25),_transparent_32%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(8,47,73,0.94))]" />
              <div className="relative flex flex-col items-center justify-center gap-8 text-center">
                <div className="relative h-56 w-56 sm:h-72 sm:w-72 rounded-[3rem] border border-white/10 bg-cyan-500/10 p-6 shadow-[0_40px_120px_rgba(34,211,238,0.22)]">
                  <Image src="/images/logo.PNG" alt={t.common.logoAlt} width={288} height={288} className="h-full w-full rounded-[2.5rem] object-contain" unoptimized />
                </div>
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.32em] text-cyan-200/70">AroRano</p>
                  <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">{t.home.landingTitle}</h1>
                  <p className="mx-auto max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                    {t.home.landingDescription}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/dashboard" className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400">
                    {t.home.openDashboard} <FiArrowRight size={16} />
                  </Link>
                  <Link href="/register" className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                    {t.home.createAccount}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}

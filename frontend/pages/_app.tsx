import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/lib/LanguageContext';
import { AuthProvider } from '@/lib/AuthContext';
import { getCanonicalUrl } from '@/lib/site-config';

// Dynamically import AppHeader as a client component to prevent SSG issues
const AppHeader = dynamic(() => import('@/components/AppHeader'), {
  ssr: false,
  loading: () => <div className="h-16 bg-gradient-to-r from-cyan-700 via-cyan-600 to-teal-600" />,
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const canonicalUrl = getCanonicalUrl(router.asPath.split('?')[0] || '/');

  return (
    <LanguageProvider>
      <AuthProvider>
        <Head>
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:site_name" content="AroRano" />
        </Head>
        <div className="flex flex-col h-screen bg-slate-50">
          <AppHeader />
          <div className="flex-1 overflow-y-auto">
            <Component {...pageProps} />
          </div>
        </div>
        <Toaster />
      </AuthProvider>
    </LanguageProvider>
  );
}

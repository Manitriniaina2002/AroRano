import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import React from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/lib/LanguageContext';
import { AuthProvider } from '@/lib/AuthContext';

// Dynamically import AppHeader as a client component to prevent SSG issues
const AppHeader = dynamic(() => import('@/components/AppHeader'), {
  ssr: false,
  loading: () => <div className="h-16 bg-gradient-to-r from-cyan-700 via-cyan-600 to-teal-600" />,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="flex flex-col h-screen bg-slate-50">
          <AppHeader />
          <div className="flex-1 overflow-hidden">
            <Component {...pageProps} />
          </div>
        </div>
        <Toaster />
      </AuthProvider>
    </LanguageProvider>
  );
}

'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      expand={true}
      closeButton
      theme="light"
      toastOptions={{
        className: 'text-sm p-3 rounded-lg shadow-lg flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-800',
      }}
    />
  );
}

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ToastProvider } from './ToastProvider';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      <ToastProvider />
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.28),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.94))]" />
        <div
          className="absolute inset-0 opacity-12 mix-blend-screen"
          style={{
            backgroundImage: 'url(/images/Impluvium.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'saturate(0.95) contrast(0.95)',
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(15,118,110,0.12))]" />

        <div className="relative z-10 flex min-h-screen">
          {showSidebar && <Sidebar isOpen={!sidebarCollapsed} onToggle={setSidebarCollapsed} />}

          <main className="relative flex-1 overflow-y-auto pt-14 md:pt-16">
            <div className="min-h-full rounded-tl-[2rem] bg-slate-50/90 shadow-[0_-20px_60px_rgba(15,23,42,0.22)] backdrop-blur-sm md:rounded-tl-[2.5rem]">
              <div className="min-h-full">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

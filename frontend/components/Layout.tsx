import React, { useState } from 'react';
import { AppHeader } from './AppHeader';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showSidebar?: boolean;
}

export function Layout({ children, title, showSidebar = true }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      {showSidebar && <Sidebar isOpen={!sidebarCollapsed} onToggle={setSidebarCollapsed} />}

      <div className="flex-1 flex flex-col overflow-hidden">
        {title && <AppHeader title={title} />}

        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

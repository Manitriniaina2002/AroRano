import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-full bg-slate-50">
      {showSidebar && <Sidebar isOpen={!sidebarCollapsed} onToggle={setSidebarCollapsed} />}

      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}

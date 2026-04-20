import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiChevronLeft, FiChevronRight, FiHome, FiShield, FiUser, FiUsers, FiActivity, FiX } from 'react-icons/fi';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

interface NavItem {
  key: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  adminOnly?: boolean;
}

export function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(!isOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    onToggle?.(nextState);
  };

  const isActive = (path: string) => router.pathname === path;

  const navItems: NavItem[] = [
    { key: 'home', href: '/', icon: FiHome },
    { key: 'dashboard', href: '/dashboard', icon: FiActivity },
    { key: 'profile', href: '/profile', icon: FiUser },
    { key: 'users', href: '/users', icon: FiUsers, adminOnly: true },
  ];

  const visibleItems = navItems.filter((item) => !item.adminOnly || user?.role === 'admin');

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />}

      <aside
        className={`fixed left-0 top-14 bottom-0 z-40 flex flex-col border-r border-white/10 bg-slate-950/90 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              {!collapsed ? (
                <>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">AroRano</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">Control Panel</h2>
                </>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold">AR</div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleToggle}
                className="hidden rounded-xl border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10 md:inline-flex"
                aria-label={collapsed ? t('common.expandSidebar', language as 'en' | 'mg') : t('common.collapseSidebar', language as 'en' | 'mg')}
              >
                {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10 md:hidden"
                aria-label="Close sidebar"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-4">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const label = t(`nav.${item.key}`, language as 'en' | 'mg');

            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setMobileOpen(false)}
                  className={`group relative flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all ${
                    active
                      ? 'bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-300/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? 'bg-cyan-400/20 text-cyan-200' : 'bg-white/5 text-slate-300'}`}>
                    <Icon size={18} />
                  </span>
                  {!collapsed && <span className="truncate">{label}</span>}
                  {collapsed && (
                    <div className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                      {label}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                <FiShield size={18} />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in</p>
                  <p className="truncate text-sm font-semibold text-white">{user?.email ?? 'guest'}</p>
                  <p className="text-xs text-cyan-200/75 capitalize">{user?.role ?? 'user'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

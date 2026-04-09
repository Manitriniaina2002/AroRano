import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FiHome, FiActivity, FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi';
import { t } from '@/lib/i18n';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(!isOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onToggle?.(newState);
  };

  const isActive = (path: string) => router.pathname === path;

  const navItems = [
    {
      label: 'Home',
      icon: FiHome,
      href: '/',
      translationKey: 'home.title',
    },
    {
      label: 'Dashboard',
      icon: FiActivity,
      href: '/dashboard',
      translationKey: 'dashboard.title',
    },
  ];

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-gradient-to-b from-primary-600 to-primary-700 text-white transition-all duration-300 flex flex-col h-screen shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-500">
        <div className="flex justify-center flex-1">
          <Image
            src="/images/logo.png"
            alt="AroRano Logo"
            width={collapsed ? 28 : 40}
            height={collapsed ? 28 : 40}
            className={`object-contain ${collapsed ? 'w-7 h-7' : 'w-10 h-10'}`}
            unoptimized
          />
        </div>
        <button
          onClick={handleToggle}
          className="p-2 hover:bg-primary-500 rounded-lg transition-colors flex-shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const label = mounted ? t(item.translationKey) : item.label;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`sidebar-link ${
                  active ? 'sidebar-link-active bg-primary-500' : 'sidebar-link-inactive hover:bg-primary-500/20'
                } flex items-center gap-3`}
              >
                <Icon size={20} />
                {!collapsed && <span className="font-medium text-sm">{label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {label}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-primary-500">
        <button
          className="sidebar-link sidebar-link-inactive hover:bg-red-500 hover:text-white w-full flex items-center gap-3"
          onClick={() => {
            // Logout logic can be added here
          }}
        >
          <FiLogOut size={20} />
          {!collapsed && <span className="font-medium text-sm">{mounted ? t('common.close') : 'Close'}</span>}
        </button>
      </div>
    </aside>
  );
}

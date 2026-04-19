import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FiHome, FiActivity, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/lib/LanguageContext';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(!isOpen);
  const { language } = useLanguage();

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onToggle?.(newState);
  };

  const isActive = (path: string) => router.pathname === path;

  const navItems = [
    {
      key: 'home',
      icon: FiHome,
      href: '/',
    },
    {
      key: 'dashboard',
      icon: FiActivity,
      href: '/dashboard',
    },
  ];

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-white text-gray-800 transition-all duration-300 flex flex-col h-screen shadow-lg border-r border-gray-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex justify-center flex-1">
          <Image
            src="/images/logo.PNG"
            alt={t('common.logoAlt', language as 'en' | 'mg')}
            width={collapsed ? 36 : 72}
            height={collapsed ? 36 : 72}
            className={`object-contain ${collapsed ? 'w-9 h-9' : 'w-20 h-20'}`}
            unoptimized
          />
        </div>
        <button
          onClick={handleToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 text-gray-600"
          aria-label={collapsed ? t('common.expandSidebar', language as 'en' | 'mg') : t('common.collapseSidebar', language as 'en' | 'mg')}
        >
          {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const label = t(`nav.${item.key}`, language as 'en' | 'mg');
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`sidebar-link ${
                  active ? 'sidebar-link-active bg-blue-100 text-blue-700' : 'sidebar-link-inactive hover:bg-gray-100 text-gray-700'
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
    </aside>
  );
}

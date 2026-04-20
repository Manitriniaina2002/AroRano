'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiGlobe, FiChevronDown, FiUser, FiLogOut } from 'react-icons/fi';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { getAvailableLanguages, t } from '@/lib/i18n';
import { toast } from 'sonner';

interface AppHeaderProps {
  title?: string;
}

// Wrapper component to handle hydration safely
export default function AppHeader({ title: _title = 'AroRano' }: AppHeaderProps) {
  const { language: contextLanguage, setLanguage } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setAvailableLanguages(getAvailableLanguages());
  }, []);

  const handleLanguageChange = (newLang: 'en' | 'mg' | 'tdx') => {
    setLanguage(newLang);
    setShowLanguageMenu(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const currentLangLabel = availableLanguages.find((l) => l.code === contextLanguage)?.nativeName || contextLanguage.toUpperCase();

  return (
    <header className="w-full fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white shadow-md z-50 flex-shrink-0 relative">
      <div className="w-full max-w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 flex justify-between items-center min-h-12 sm:min-h-14 relative z-10 gap-2 sm:gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Image
            src="/images/logo.PNG"
            alt={t('common.logoAlt', contextLanguage as 'en' | 'mg' | 'tdx')}
            width={50}
            height={50}
            className="w-[40px] sm:w-[50px] h-[40px] sm:h-[50px] object-contain drop-shadow-lg"
            unoptimized
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        <div className="flex items-center gap-2 sm:gap-3 relative">
          {/* User Menu */}
          {mounted && isAuthenticated && user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors duration-200 text-xs sm:text-sm"
              >
                <FiUser size={16} />
                <span className="hidden sm:inline truncate max-w-[100px]">{user.firstName || user.email.split('@')[0]}</span>
                <FiChevronDown
                  size={14}
                  style={{
                    transform: showUserMenu ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg min-w-[180px] sm:min-w-[220px] z-50 overflow-hidden">
                  <Link href="/profile">
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
                    >
                      <FiUser size={16} />
                      {t('common.profile', contextLanguage as 'en' | 'mg') || 'Profile'}
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-red-600 hover:bg-red-50 transition-colors text-sm flex items-center gap-2 border-t border-gray-200"
                  >
                    <FiLogOut size={16} />
                    {t('common.logout', contextLanguage as 'en' | 'mg') || 'Logout'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Login/Register Links */}
          {mounted && !isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <button className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors text-xs sm:text-sm">
                  {t('common.login', contextLanguage as 'en' | 'mg') || 'Login'}
                </button>
              </Link>
            </div>
          )}

          {/* Language Selector */}
          {mounted && (
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors duration-200 text-xs sm:text-sm"
              >
                <FiGlobe size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">{currentLangLabel}</span>
                <FiChevronDown
                  size={14}
                  style={{
                    transform: showLanguageMenu ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {/* Language Dropdown Menu */}
              {showLanguageMenu && (
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg min-w-[180px] sm:min-w-[220px] z-50 overflow-hidden">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as 'en' | 'mg' | 'tdx')}
                      className={`block w-full text-left px-3 sm:px-4 py-2 sm:py-3 transition-colors duration-200 text-sm ${
                        contextLanguage === lang.code
                          ? 'bg-blue-100 text-blue-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold">{lang.name}</div>
                      <div className="text-xs text-gray-600">({lang.nativeName})</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
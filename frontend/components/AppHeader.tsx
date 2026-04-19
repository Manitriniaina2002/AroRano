'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';
import { useLanguage } from '@/lib/LanguageContext';
import { getAvailableLanguages, t } from '@/lib/i18n';

interface AppHeaderProps {
  title?: string;
}

// Wrapper component to handle hydration safely
function AppHeaderContent({ title: _title = 'AroRano' }: AppHeaderProps) {
  const { language: contextLanguage, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setAvailableLanguages(getAvailableLanguages());
  }, []);

  const handleLanguageChange = (newLang: 'en' | 'mg' | 'tdx') => {
    setLanguage(newLang);
    setShowLanguageMenu(false);
  };

  const currentLangLabel = availableLanguages.find((l) => l.code === contextLanguage)?.nativeName || contextLanguage.toUpperCase();

  return (
    <header className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white shadow-md sticky top-0 z-50 flex-shrink-0">
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center min-h-16">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.PNG"
            alt={t('common.logoAlt', contextLanguage as 'en' | 'mg' | 'tdx')}
            width={36}
            height={36}
            className="w-9 h-9 object-contain"
            unoptimized
          />
        </div>

        <div className="flex gap-4 items-center relative">
          {mounted && (
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <FiGlobe size={18} />
                <span>{currentLangLabel}</span>
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
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg min-w-[220px] z-50 overflow-hidden">
                  {availableLanguages
                    .map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code as 'en' | 'mg' | 'tdx')}
                        className={`block w-full text-left px-4 py-3 transition-colors duration-200 ${
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

// Export wrapper that ensures AppHeader only renders on client after hydration
export function AppHeader(props: AppHeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-16 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600" />;
  }

  return <AppHeaderContent {...props} />;
}

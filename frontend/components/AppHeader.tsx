import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';
import {
  setLanguage as setI18nLanguage,
  getLanguage,
  getAvailableLanguages,
  type Language,
} from '@/lib/i18n';

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title: _title = 'AroRano' }: AppHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setLanguage(getLanguage());
    setAvailableLanguages(getAvailableLanguages());
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setI18nLanguage(newLang);
    setShowLanguageMenu(false);
    window.location.reload();
  };

  const currentLangLabel = availableLanguages.find((l) => l.code === language)?.nativeName || language.toUpperCase();

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.PNG"
            alt="AroRano Logo"
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
                  {availableLanguages.map((lang, idx) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`block w-full text-left px-4 py-3 transition-colors duration-200 ${
                        language === lang.code
                          ? 'bg-blue-100 text-blue-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${idx !== availableLanguages.length - 1 ? 'border-b border-gray-200' : ''}`}
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

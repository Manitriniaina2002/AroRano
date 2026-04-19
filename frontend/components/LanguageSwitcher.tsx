'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { FiGlobe } from 'react-icons/fi';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'mg', name: 'Malagasy', flag: '🇲🇬' },
    { code: 'tdx', name: 'Tandroy', flag: '🏜️' },
  ] as const;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        title="Change language"
        aria-label="Language selector"
      >
        <FiGlobe size={18} />
        <span className="text-sm font-medium">
          {languages.find(l => l.code === language)?.flag}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <p className="text-xs font-semibold text-gray-500 px-3 py-2">
              Select Language
            </p>
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as 'en' | 'mg' | 'tdx');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  language === lang.code
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

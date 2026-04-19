'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserLanguage, saveLanguage } from './ai-translate';

interface LanguageContextType {
  language: 'en' | 'mg';
  setLanguage: (lang: 'en' | 'mg') => void;
  isAutoDetect: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<'en' | 'mg'>('mg');
  const [isAutoDetect, setIsAutoDetect] = useState(true);

  useEffect(() => {
    // Get user's language preference on mount (client-side only)
    const userLang = getUserLanguage();
    setLanguageState(userLang);
    setIsAutoDetect(!localStorage.getItem('arorano_language'));
  }, []);

  const setLanguage = (lang: 'en' | 'mg') => {
    setLanguageState(lang);
    saveLanguage(lang);
    setIsAutoDetect(false);
  };

  // Always render provider to maintain consistent tree, even during hydration
  // The context will have the default value until useEffect runs
  return (
    <LanguageContext.Provider value={{ language, setLanguage, isAutoDetect }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

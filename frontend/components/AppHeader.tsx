import React, { useState, useEffect } from 'react';
import { colors, spacing, styles } from '@/lib/theme';
import { FiGlobe, FiMenu, FiX } from 'react-icons/fi';
import { t, setLanguage as setI18nLanguage, getLanguage } from '@/lib/i18n';

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title = 'AroRano' }: AppHeaderProps) {
  const [language, setLanguage] = useState<'en' | 'mg'>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setLanguage(getLanguage());
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'mg' : 'en';
    setLanguage(newLang);
    setI18nLanguage(newLang);
    window.location.reload();
  };

  return (
    <header
      style={{
        backgroundColor: colors.primary,
        color: '#ffffff',
        padding: `${spacing.md}`,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>{title}</h1>
        </div>

        <div
          style={{
            display: 'flex',
            gap: `${spacing.md}`,
            alignItems: 'center',
          }}
        >
          <button
            onClick={toggleLanguage}
            style={{
              ...styles.button,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              border: 'none',
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: `${spacing.sm}`,
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <FiGlobe size={18} />
            <span style={{ display: 'none', '@media (min-width: 768px)': { display: 'inline' } }}>
              {language.toUpperCase()}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

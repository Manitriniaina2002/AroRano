'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, HealthResponse, WelcomeResponse } from '@/lib/api';
import { colors, spacing, styles } from '@/lib/theme';
import { t, getLanguage } from '@/lib/i18n';
import { AppHeader } from '@/components/AppHeader';
import { FiArrowRight, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [message, setMessage] = useState<WelcomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    setLanguage(getLanguage());
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [healthData, messageData] = await Promise.all([
          api.health(),
          api.welcome(),
        ]);

        setHealth(healthData);
        setMessage(messageData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('common.error', language as 'en' | 'mg');
        setError(errorMessage);
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [language]);

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <AppHeader title={t('home.title')} />

      <main>
        {/* Hero Section */}
        <section
          style={{
            backgroundColor: colors.primary,
            color: '#ffffff',
            padding: `${spacing.xxl} ${spacing.md}`,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            <h2
              style={{
                fontSize: '36px',
                fontWeight: '700',
                marginBottom: `${spacing.md}`,
              }}
            >
              {t('home.title')}
            </h2>
            <p
              style={{
                fontSize: '18px',
                marginBottom: `${spacing.lg}`,
                opacity: 0.95,
              }}
            >
              {t('home.subtitle')}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div style={{ ...styles.container, paddingTop: `${spacing.xl}`, paddingBottom: `${spacing.xl}` }}>
          {/* Status Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: `${spacing.lg}`,
              marginBottom: `${spacing.xl}`,
            }}
          >
            {loading && (
              <div
                style={{
                  ...styles.card,
                  backgroundColor: colors.primaryLight,
                  borderLeft: `4px solid ${colors.primary}`,
                  display: 'flex',
                  gap: `${spacing.md}`,
                  alignItems: 'flex-start',
                }}
              >
                <FiLoader
                  size={24}
                  style={{
                    color: colors.primary,
                    flexShrink: 0,
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <div>
                  <h3 style={{ margin: `0 0 ${spacing.sm} 0`, fontSize: '16px' }}>
                    {t('common.loading')}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                    {t('home.subtitle')}
                  </p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div
                style={{
                  ...styles.card,
                  backgroundColor: colors.dangerLight,
                  borderLeft: `4px solid ${colors.danger}`,
                  display: 'flex',
                  gap: `${spacing.md}`,
                  alignItems: 'flex-start',
                }}
              >
                <FiAlertCircle
                  size={24}
                  style={{
                    color: colors.danger,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <h3 style={{ margin: `0 0 ${spacing.sm} 0`, fontSize: '16px', color: colors.danger }}>
                    {t('common.error')}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: colors.danger }}>{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && message && (
              <div
                style={{
                  ...styles.card,
                  backgroundColor: colors.primaryLight,
                  borderLeft: `4px solid ${colors.primary}`,
                }}
              >
                <h3 style={{ margin: `0 0 ${spacing.md} 0`, color: colors.primary }}>
                  {t('home.welcome')}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    color: colors.primary,
                    fontWeight: '500',
                  }}
                >
                  {message.message}
                </p>
              </div>
            )}

            {!loading && !error && health && (
              <div
                style={{
                  ...styles.card,
                  backgroundColor: colors.successLight,
                  borderLeft: `4px solid ${colors.success}`,
                }}
              >
                <div style={{ display: 'flex', gap: `${spacing.md}`, alignItems: 'flex-start' }}>
                  <FiCheckCircle size={24} style={{ color: colors.success, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: `0 0 ${spacing.md} 0`, color: colors.success }}>
                      {t('home.serverStatus')}
                    </h3>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: `${spacing.md}`,
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: colors.gray500, marginBottom: '4px' }}>
                          {t('common.status')}
                        </p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: colors.text }}>
                          {health.status}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: colors.gray500, marginBottom: '4px' }}>
                          {t('common.value')}
                        </p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: colors.text }}>
                          {health.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dashboard CTA */}
          <div
            style={{
              ...styles.card,
              backgroundColor: colors.primaryLight,
              border: `2px solid ${colors.primary}`,
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                margin: `0 0 ${spacing.md} 0`,
                fontSize: '28px',
                fontWeight: '600',
                color: colors.primary,
              }}
            >
              {t('home.dashboard')}
            </h2>
            <p
              style={{
                margin: `0 0 ${spacing.lg} 0`,
                fontSize: '16px',
                color: colors.gray700,
                lineHeight: '1.6',
              }}
            >
              {t('home.dashboardDescription')}
            </p>
            <Link href="/dashboard">
              <button
                style={{
                  ...styles.buttonPrimary,
                  display: 'inline-flex',
                  gap: `${spacing.sm}`,
                  fontSize: '16px',
                  padding: `${spacing.md} ${spacing.lg}`,
                }}
              >
                {t('home.goToDashboard')}
                <FiArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        button:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

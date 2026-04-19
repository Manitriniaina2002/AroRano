'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, HealthResponse, WelcomeResponse } from '@/lib/api';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/lib/LanguageContext';
import { Layout } from '@/components/Layout';
import { WaveAnimation } from '@/components/WaveAnimation';
import { FiArrowRight, FiCheckCircle, FiAlertCircle, FiLoader, FiDroplet, FiActivity, FiTrendingUp } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default function Home() {
  const { language } = useLanguage();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [message, setMessage] = useState<WelcomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const translatedHealthStatus =
    health?.status?.toLowerCase() === 'ok'
      ? t('common.ok', language as 'en' | 'mg')
      : health?.status;

  const translatedHealthMessage =
    health?.message?.toLowerCase() === 'server is running'
      ? t('common.serverRunning', language as 'en' | 'mg')
      : health?.message;

  const translatedWelcomeMessage =
    message?.message?.toLowerCase() === 'welcome to arorano api!'
      ? t('api.welcome', language as 'en' | 'mg')
      : message?.message;

  useEffect(() => {
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
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 text-white py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <WaveAnimation />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 flex justify-center items-center">
          <Image
            src="/images/logo.PNG"
            alt="AroRano Logo"
            width={120}
            height={120}
            className="w-32 h-32 object-contain"
            unoptimized
          />
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{t('home.smartWaterMonitoring', language as 'en' | 'mg')}</h1>
          <p className="text-lg text-gray-600">{t('home.realtimeMonitoringDesc', language as 'en' | 'mg')}</p>
        </div>

        {/* Key Features - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-blue-100 p-6">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
              <FiDroplet size={20} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{t('home.realtimeMonitoring', language as 'en' | 'mg')}</h3>
            <p className="text-sm text-gray-600">{t('home.realtimeMonitoringDetail', language as 'en' | 'mg')}</p>
          </div>

          <div className="bg-white rounded-lg border border-cyan-100 p-6">
            <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center mb-3">
              <FiActivity size={20} className="text-cyan-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{t('home.multiSensorSupport', language as 'en' | 'mg')}</h3>
            <p className="text-sm text-gray-600">{t('home.multiSensorDetail', language as 'en' | 'mg')}</p>
          </div>

          <div className="bg-white rounded-lg border border-teal-100 p-6">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-3">
              <FiTrendingUp size={20} className="text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{t('home.smartAlerts', language as 'en' | 'mg')}</h3>
            <p className="text-sm text-gray-600">{t('home.smartAlertsDetail', language as 'en' | 'mg')}</p>
          </div>
        </div>

        {/* System Status Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* System Status */}
          {!loading && !error && health && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle size={20} className="text-green-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">{t('home.systemStatus', language as 'en' | 'mg')}</h3>
                  <p className="text-sm text-green-800">{translatedHealthStatus} • {translatedHealthMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Message */}
          {!loading && !error && message && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiDroplet size={20} className="text-blue-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">{t('home.welcome', language as 'en' | 'mg')}</h3>
                  <p className="text-sm text-blue-800">{translatedWelcomeMessage}</p>
                </div>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 rounded-lg border border-red-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiAlertCircle size={20} className="text-red-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">{t('home.connectionIssue', language as 'en' | 'mg')}</h3>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 animate-spin">
                  <FiLoader size={20} className="text-gray-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{t('home.initializing', language as 'en' | 'mg')}</h3>
                  <p className="text-sm text-gray-700">{t('home.loadingSystemData', language as 'en' | 'mg')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">{t('home.startMonitoring', language as 'en' | 'mg')}</h2>
          <p className="text-sm opacity-90 mb-5">{t('home.accessData', language as 'en' | 'mg')}</p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
          >
            {t('home.goToDashboard', language as 'en' | 'mg')}
            <FiArrowRight size={16} />
          </Link>
        </div>
      </main>
    </Layout>
  );
}

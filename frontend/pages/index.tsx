'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, HealthResponse, WelcomeResponse } from '@/lib/api';
import { t, getLanguage } from '@/lib/i18n';
import { Layout } from '@/components/Layout';
import { FiArrowRight, FiCheckCircle, FiAlertCircle, FiLoader, FiServer } from 'react-icons/fi';

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
    <Layout title={t('home.title')} showSidebar>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('home.title')}</h2>
          <p className="text-lg md:text-xl opacity-90">{t('home.subtitle')}</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loading && (
            <div className="card card-hover border-l-4 border-primary-500 flex items-start gap-4">
              <FiLoader size={28} className="text-primary-500 flex-shrink-0 animate-spin" />
              <div>
                <h3 className="text-lg font-semibold mb-2 text-primary-600">{t('common.loading')}</h3>
                <p className="text-sm text-gray-600">{t('home.subtitle')}</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="card card-hover border-l-4 border-red-500 flex items-start gap-4">
              <FiAlertCircle size={28} className="text-red-500 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-2 text-red-600">{t('common.error')}</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && message && (
            <div className="card card-hover border-l-4 border-primary-500 bg-primary-50">
              <h3 className="text-lg font-semibold mb-3 text-primary-600">{t('home.welcome')}</h3>
              <p className="text-primary-700 font-medium">{message.message}</p>
            </div>
          )}

          {!loading && !error && health && (
            <div className="card card-hover border-l-4 border-green-500 bg-green-50 flex gap-4">
              <FiCheckCircle size={28} className="text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-4 text-green-600">{t('home.serverStatus')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{t('common.status')}</p>
                    <p className="text-sm font-bold text-gray-900">{health.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{t('common.value')}</p>
                    <p className="text-sm font-bold text-gray-900">{health.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard CTA Card */}
        <div className="card card-hover bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-500 text-center">
          <div className="inline-flex justify-center mb-4">
            <FiServer size={48} className="text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-primary-600">{t('home.dashboard')}</h2>
          <p className="text-gray-700 mb-6 text-lg leading-relaxed max-w-2xl mx-auto">
            {t('home.dashboardDescription')}
          </p>
          <Link href="/dashboard">
            <button className="btn-primary inline-flex items-center gap-2 text-lg">
              {t('home.goToDashboard')}
              <FiArrowRight size={20} />
            </button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="card card-hover text-center">
            <div className="inline-flex justify-center p-3 bg-blue-100 rounded-lg mb-4">
              <FiServer size={32} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Real-time Monitoring</h3>
            <p className="text-gray-600 text-sm">
              Monitor your IoT devices in real-time with instant updates and notifications.
            </p>
          </div>

          <div className="card card-hover text-center">
            <div className="inline-flex justify-center p-3 bg-green-100 rounded-lg mb-4">
              <FiCheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Easy Management</h3>
            <p className="text-gray-600 text-sm">
              Easily add, configure, and manage your connected devices from one dashboard.
            </p>
          </div>

          <div className="card card-hover text-center">
            <div className="inline-flex justify-center p-3 bg-purple-100 rounded-lg mb-4">
              <FiArrowRight size={32} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Advanced Analytics</h3>
            <p className="text-gray-600 text-sm">
              Analyze device data with comprehensive statistics and performance metrics.
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}

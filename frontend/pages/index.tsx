'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, HealthResponse, WelcomeResponse } from '@/lib/api';
import { t, getLanguage } from '@/lib/i18n';
import { Layout } from '@/components/Layout';
import { FiArrowRight, FiCheckCircle, FiAlertCircle, FiLoader, FiDroplet, FiActivity, FiTrendingUp, FiShield } from 'react-icons/fi';

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
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 flex justify-center items-center">
          <Image
            src="/images/logo.png"
            alt="AroRano Logo"
            width={200}
            height={200}
            className="w-48 h-48 object-contain"
            unoptimized
          />
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl border border-blue-100 p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <FiDroplet size={24} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Water Monitoring</h3>
            <p className="text-sm text-gray-600">Real-time water level tracking across multiple reservoirs</p>
          </div>

          <div className="bg-white rounded-xl border border-cyan-100 p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center mb-4">
              <FiActivity size={24} className="text-cyan-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Sensor</h3>
            <p className="text-sm text-gray-600">Temperature, pH, turbidity, and flow rate monitoring</p>
          </div>

          <div className="bg-white rounded-xl border border-teal-100 p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
              <FiTrendingUp size={24} className="text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600">Trends, statistics, and historical data analysis</p>
          </div>

          <div className="bg-white rounded-xl border border-blue-100 p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <FiShield size={24} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Alerts</h3>
            <p className="text-sm text-gray-600">Instant notifications for critical thresholds</p>
          </div>
        </div>

        {/* Status Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Status */}
          {!loading && !error && health && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle size={24} className="text-green-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">System Status</h3>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="text-sm font-bold text-green-700">{health.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Message:</span>
                      <span className="text-sm font-bold text-gray-900">{health.message}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Message */}
          {!loading && !error && message && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl border-2 border-blue-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiDroplet size={24} className="text-blue-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Welcome</h3>
                  <p className="text-blue-800 font-medium text-sm">{message.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiAlertCircle size={24} className="text-red-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 animate-spin">
                  <FiLoader size={24} className="text-gray-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading</h3>
                  <p className="text-gray-700 text-sm">Initializing system...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to Monitor?</h2>
          <p className="text-lg opacity-90 mb-6">Start managing your water reservoirs with real-time insights</p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Go to Dashboard
            <FiArrowRight size={20} />
          </Link>
        </div>
      </main>
    </Layout>
  );
}

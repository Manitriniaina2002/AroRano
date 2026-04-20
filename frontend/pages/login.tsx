'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { translations } from '@/lib/i18n';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FiMail, FiLock, FiLoader, FiAlertCircle } from 'react-icons/fi';

export default function LoginPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="min-h-screen flex items-center justify-center px-2 sm:px-4 md:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {t.common.login || 'Welcome Back'}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {t.common.signIn || 'Sign in to your AroRano account'}
            </p>
          </div>

          {/* Login Form Card */}
          <Card className="border-2 border-blue-100">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">{t.common.login || 'Login'}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t.common.enterCredentials || 'Enter your credentials to continue'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    {t.common.email || 'Email'}
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-2.5 sm:top-3 text-gray-400" size={18} />
                    <Input
                      type="email"
                      placeholder={t.common.enterEmail || 'your@email.com'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    {t.common.password || 'Password'}
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-2.5 sm:top-3 text-gray-400" size={18} />
                    <Input
                      type="password"
                      placeholder={t.common.enterPassword || 'Enter your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                    <FiAlertCircle className="text-red-600 flex-shrink-0" size={18} />
                    <p className="text-red-700 text-xs sm:text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-2.5 text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" size={18} />
                      {t.common.loading || 'Logging in...'}
                    </>
                  ) : (
                    t.common.login || 'Login'
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-4 sm:my-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-2 bg-white text-gray-500">{t.common.or || 'Or'}</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-xs sm:text-sm text-gray-600">
                {t.common.noAccount || "Don't have an account?"}{' '}
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  {t.common.signUp || 'Sign up'}
                </Link>
              </p>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <div className="mt-6 sm:mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs sm:text-sm text-blue-900 font-semibold mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-800">Email: demo@example.com</p>
            <p className="text-xs text-blue-800">Password: demo123456</p>
          </div>
        </div>
      </main>
    </Layout>
  );
}

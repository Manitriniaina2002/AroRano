'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { translations } from '@/lib/i18n';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FiUser, FiMail, FiCalendar, FiShield, FiLogOut, FiLoader } from 'react-icons/fi';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  const { user, logout, getProfile, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      await getProfile();
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FiLoader className="w-12 h-12 animate-spin mx-auto text-cyan-600 mb-4" />
            <p className="text-gray-600">{t.common.loading || 'Loading...'}</p>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <main className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {t.common.profile || 'Profile'}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {t.common.manageAccount || 'Manage your account information'}
            </p>
          </div>

          {/* User Info Card */}
          <Card className="mb-6 border-2 border-cyan-100">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <FiUser size={24} className="text-cyan-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">User Account</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Account Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Email Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiMail size={20} className="text-cyan-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">
                      {t.common.email || 'Email'}
                    </p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 break-all">{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiShield size={20} className="text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">
                      {t.common.role || 'Role'}
                    </p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 capitalize">
                      {user?.role || 'User'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* First Name Card */}
            {user?.firstName && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiUser size={20} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">
                        {t.common.firstName || 'First Name'}
                      </p>
                      <p className="text-sm sm:text-base font-medium text-gray-900">{user.firstName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Last Name Card */}
            {user?.lastName && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiUser size={20} className="text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">
                        {t.common.lastName || 'Last Name'}
                      </p>
                      <p className="text-sm sm:text-base font-medium text-gray-900">{user.lastName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Logout Button */}
          <Card className="bg-red-50 border-2 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {t.common.logout || 'Sign Out'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {t.common.logoutDesc || 'Sign out from this account'}
                  </p>
                </div>
                <Button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 sm:py-2.5 px-4 sm:px-6 flex items-center gap-2 flex-shrink-0 text-sm sm:text-base"
                >
                  <FiLogOut size={18} />
                  {t.common.logout || 'Logout'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </Layout>
    </ProtectedRoute>
  );
}

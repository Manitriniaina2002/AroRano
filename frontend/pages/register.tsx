'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { translations } from '@/lib/i18n';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FiMail, FiLock, FiUser, FiLoader, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function RegisterPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validations, setValidations] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    match: false,
  });

  const isFormValid =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.password.length >= 6 &&
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const newValidations = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      password: formData.password.length >= 6,
      confirmPassword: formData.confirmPassword.length > 0,
      match: formData.password === formData.confirmPassword,
    };
    setValidations(newValidations);
    return Object.values(newValidations).every(Boolean);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setError('Please fill in all fields correctly');
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showSidebar={false}>
      <main className="min-h-screen flex items-center justify-center px-2 sm:px-4 md:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {t.common.createAccount || 'Create Account'}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {t.common.joinArorano || 'Join AroRano to manage your water system'}
            </p>
          </div>

          {/* Registration Form Card */}
          <Card className="border-2 border-cyan-100">
            <CardHeader className="pb-3 sm:pb-4 flex flex-col items-center text-center">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-[1.75rem] border border-cyan-100 bg-cyan-50 p-3 shadow-[0_18px_50px_rgba(34,211,238,0.16)] mb-3">
                <Image
                  src="/images/logo.PNG"
                  alt={t.common.logoAlt || 'AroRano logo'}
                  width={96}
                  height={96}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-700/70 mb-2">AroRano</p>
              <CardTitle className="text-lg sm:text-xl">{t.common.signUp || 'Sign Up'}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t.common.fillInDetails || 'Fill in your details to get started'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      {t.common.firstName || 'First Name'}
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-2.5 text-gray-400" size={16} />
                      <Input
                        type="text"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="pl-9 text-sm"
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      {t.common.lastName || 'Last Name'}
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-2.5 text-gray-400" size={16} />
                      <Input
                        type="text"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="pl-9 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    {t.common.email || 'Email'}
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <Input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-9 text-sm"
                      required
                    />
                    {validations.email && (
                      <FiCheckCircle className="absolute right-3 top-2.5 text-green-600" size={18} />
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    {t.common.password || 'Password'}
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <Input
                      type="password"
                      name="password"
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-9 text-sm"
                      required
                    />
                    {validations.password && (
                      <FiCheckCircle className="absolute right-3 top-2.5 text-green-600" size={18} />
                    )}
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    {t.common.confirmPassword || 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-9 text-sm"
                      required
                    />
                    {validations.match && (
                      <FiCheckCircle className="absolute right-3 top-2.5 text-green-600" size={18} />
                    )}
                  </div>
                </div>

                {/* Password Match Error */}
                {formData.confirmPassword && !validations.match && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex gap-2">
                    <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-red-700 text-xs">{t.common.passwordMismatch || 'Passwords do not match'}</p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                    <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-red-700 text-xs sm:text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 sm:py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" size={16} />
                      {t.common.creating || 'Creating account...'}
                    </>
                  ) : (
                    t.common.signUp || 'Create Account'
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-4 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">{t.common.or || 'Or'}</span>
                </div>
              </div>

              {/* Login Link */}
              <p className="text-center text-xs sm:text-sm text-gray-600">
                {t.common.haveAccount || 'Already have an account?'}{' '}
                <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">
                  {t.common.login || 'Login'}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
}

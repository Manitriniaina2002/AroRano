'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FiAlertCircle, FiLoader } from 'react-icons/fi';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const isAuthorized = !requiredRole || user?.role === requiredRole;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isLoading && isAuthenticated && requiredRole && !isAuthorized) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, requiredRole, isAuthorized, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyan-50/60">
        <div className="text-center">
          <FiLoader className="mx-auto mb-4 h-12 w-12 animate-spin text-cyan-600" />
          <p className="text-slate-600">Loading secure session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyan-50/60 px-4">
        <div className="max-w-md rounded-2xl border border-cyan-100 bg-white p-6 text-center shadow-lg">
          <FiAlertCircle className="mx-auto h-8 w-8 text-amber-500" />
          <h2 className="mt-3 text-lg font-semibold text-slate-900">Restricted area</h2>
          <p className="mt-2 text-sm text-slate-600">You do not have permission to open this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

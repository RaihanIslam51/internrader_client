'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import AuthShell from '../../components/auth/AuthShell';
import { Loader2, AlertCircle, Clock, Ban, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const inputCls =
  'w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-10 pr-3.5 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition-all';

/** Banner styles per failure type */
const BANNERS = {
  ACCOUNT_PENDING: {
    icon: Clock,
    title: 'Awaiting approval',
    cls: 'bg-amber-50 border-amber-200 text-amber-800',
    iconCls: 'text-amber-500',
  },
  ACCOUNT_REJECTED: {
    icon: Ban,
    title: 'Request declined',
    cls: 'bg-rose-50 border-rose-200 text-rose-800',
    iconCls: 'text-rose-500',
  },
  ACCOUNT_SUSPENDED: {
    icon: Ban,
    title: 'Account suspended',
    cls: 'bg-rose-50 border-rose-200 text-rose-800',
    iconCls: 'text-rose-500',
  },
  DEFAULT: {
    icon: AlertCircle,
    title: 'Sign in failed',
    cls: 'bg-rose-50 border-rose-200 text-rose-800',
    iconCls: 'text-rose-500',
  },
};

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFailure(null);

    const result = await login(email.trim(), password);
    if (!result.success) {
      setFailure(result);
      setSubmitting(false);
    }
    // On success useAuth redirects to /dashboard
  };

  const banner = failure ? BANNERS[failure.code] || BANNERS.DEFAULT : null;
  const BannerIcon = banner?.icon;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your jobs workspace."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
            Request access
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {failure && (
          <div className={`p-3.5 border rounded-xl text-xs flex items-start gap-3 ${banner.cls}`} role="alert">
            <BannerIcon className={`w-4 h-4 shrink-0 mt-0.5 ${banner.iconCls}`} />
            <div className="space-y-0.5">
              <p className="font-extrabold">{banner.title}</p>
              <p className="font-medium leading-relaxed">{failure.error}</p>
              {failure.reason && (
                <p className="font-medium opacity-80">Reason: {failure.reason}</p>
              )}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`${inputCls} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          id="login-submit"
          type="submit"
          disabled={submitting || !email || !password}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] hover:from-[#5B21B6] hover:to-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-extrabold rounded-xl transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign in <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}

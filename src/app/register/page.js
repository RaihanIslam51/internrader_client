'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import AuthShell from '../../components/auth/AuthShell';
import {
  Loader2, AlertCircle, Mail, Lock, Eye, EyeOff, User, Phone, Building2,
  CheckCircle2, Hourglass, ArrowRight,
} from 'lucide-react';

const inputCls =
  'w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-10 pr-3.5 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition-all';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Mirrors the server-side password policy and returns a 0–4 strength score. */
function evaluatePassword(pw) {
  const checks = {
    length: pw.length >= 8,
    letter: /[A-Za-z]/.test(pw),
    number: /\d/.test(pw),
    extra: pw.length >= 12 || /[^A-Za-z0-9]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score, valid: checks.length && checks.letter && checks.number };
}

const STRENGTH = [
  { label: 'Too weak', cls: 'bg-slate-200', text: 'text-slate-400' },
  { label: 'Weak', cls: 'bg-rose-500', text: 'text-rose-600' },
  { label: 'Fair', cls: 'bg-amber-500', text: 'text-amber-600' },
  { label: 'Good', cls: 'bg-lime-500', text: 'text-lime-600' },
  { label: 'Strong', cls: 'bg-emerald-500', text: 'text-emerald-600' },
];

function Field({ id, label, optional, icon: Icon, children }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
        <span>{label}</span>
        {optional && <span className="text-[10px] font-semibold text-slate-400">Optional</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        {children}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', password: '', confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const pw = useMemo(() => evaluatePassword(form.password), [form.password]);
  const strength = STRENGTH[form.password ? pw.score : 0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (form.name.trim().length < 2) return setErrorMsg('Please enter your full name.');
    if (!EMAIL_REGEX.test(form.email.trim())) return setErrorMsg('Please enter a valid email address.');
    if (!pw.valid) return setErrorMsg('Password must be at least 8 characters and include a letter and a number.');
    if (form.password !== form.confirm) return setErrorMsg('Passwords do not match.');

    setSubmitting(true);
    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim(),
      password: form.password,
    });
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg(result.message);
    } else {
      setErrorMsg(result.error);
    }
  };

  // ── Success: pending approval screen ────────────────────────────────────
  if (successMsg) {
    return (
      <AuthShell
        title="Request submitted"
        subtitle="Thanks for signing up — one last step before you get in."
        footer={
          <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
            Go to sign in
          </Link>
        }
      >
        <div className="text-center space-y-5 py-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <Hourglass className="w-7 h-7 text-amber-500" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-extrabold text-slate-900">Awaiting super admin approval</p>
            <p className="text-sm text-slate-500 leading-relaxed">{successMsg}</p>
          </div>
          <ol className="text-left text-xs text-slate-600 space-y-2.5 bg-slate-50 border border-slate-100 rounded-2xl p-4">
            {[
              'Your details were saved securely.',
              'The super admin reviews your request.',
              'Once approved, sign in with your email and password.',
            ].map((step, i) => (
              <li key={step} className="flex items-start gap-2.5">
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-px ${i === 0 ? 'text-emerald-500' : 'text-slate-300'}`} />
                <span className="font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Request access"
      subtitle="Create your account. A super admin will review and approve it."
      footer={
        <>
          Already approved?{' '}
          <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2.5 font-medium" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Field id="reg-name" label="Full name" icon={User}>
          <input id="reg-name" type="text" required autoComplete="name" value={form.name}
            onChange={set('name')} placeholder="John Doe" className={inputCls} />
        </Field>

        <Field id="reg-email" label="Email address" icon={Mail}>
          <input id="reg-email" type="email" required autoComplete="email" value={form.email}
            onChange={set('email')} placeholder="you@company.com" className={inputCls} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="reg-phone" label="Phone" optional icon={Phone}>
            <input id="reg-phone" type="tel" autoComplete="tel" value={form.phone}
              onChange={set('phone')} placeholder="01XXXXXXXXX" className={inputCls} />
          </Field>
          <Field id="reg-company" label="Company" optional icon={Building2}>
            <input id="reg-company" type="text" autoComplete="organization" value={form.company}
              onChange={set('company')} placeholder="Acme Ltd." className={inputCls} />
          </Field>
        </div>

        <div>
          <Field id="reg-password" label="Password" icon={Lock}>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
              placeholder="At least 8 characters"
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
          </Field>

          {/* Strength meter */}
          <div className="mt-2.5 space-y-1.5">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    form.password && pw.score >= i ? strength.cls : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-slate-400">8+ characters, a letter and a number</span>
              <span className={strength.text}>{form.password ? strength.label : ''}</span>
            </div>
          </div>
        </div>

        <Field id="reg-confirm" label="Confirm password" icon={Lock}>
          <input
            id="reg-confirm"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={form.confirm}
            onChange={set('confirm')}
            placeholder="Re-enter your password"
            className={inputCls}
          />
        </Field>

        <button
          id="register-submit"
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] hover:from-[#5B21B6] hover:to-[#4338CA] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-extrabold rounded-xl transition-all shadow-lg shadow-indigo-500/25 cursor-pointer mt-2"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Submit for approval <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}

'use client';

import Link from 'next/link';
import { Briefcase, ShieldCheck, UserCheck, Lock, ArrowLeft } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: UserCheck,
    title: 'Approval-based access',
    desc: 'Every new account is reviewed and approved by the super admin before it can enter the platform.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by design',
    desc: 'Encrypted passwords, signed sessions and instant access revocation keep your data protected.',
  },
  {
    icon: Lock,
    title: 'Private jobs workspace',
    desc: 'Your tracked companies, scraped jobs and scraping reports stay behind authenticated access only.',
  },
];

/**
 * Split-screen shell shared by the Sign In & Sign Up pages.
 */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex bg-white text-slate-800">
      {/* ── Brand panel (desktop) ───────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-[46%] xl:w-[44%] relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] text-white p-12 flex-col justify-between">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-indigo-400/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <Link href="/" className="relative flex items-center gap-3 w-fit">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight leading-none">CareerPulse</p>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-200 mt-1">
              Job Scraping Engine
            </p>
          </div>
        </Link>

        <div className="relative space-y-8 max-w-md">
          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-[1.15]">
              Turn company career pages into a private jobs database.
            </h2>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              Collect, organize and review jobs & internships from the companies you track — in a workspace that only approved members can access.
            </p>
          </div>

          <ul className="space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title: t, desc }) => (
              <li key={t} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-indigo-100" />
                </div>
                <div>
                  <p className="text-sm font-bold">{t}</p>
                  <p className="text-xs text-indigo-100/70 leading-relaxed mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[11px] text-indigo-200/70 font-medium">
          © {new Date().getFullYear()} CareerPulse. All rights reserved.
        </p>
      </aside>

      {/* ── Form panel ──────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col px-5 sm:px-10 py-8 bg-[#F8FAFC]">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black text-slate-900">CareerPulse</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-md">
            <div className="mb-7">
              <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight">{title}</h1>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{subtitle}</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 sm:p-8">
              {children}
            </div>

            {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}

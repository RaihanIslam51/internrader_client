'use client';

import Link from 'next/link';
import { Sparkles, ShieldCheck, Zap, MessageSquare, ArrowLeft } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: 'Real-Time Meta Ads Scraping',
    desc: 'Extract active advertiser data directly from Meta Ad Library across 10+ countries with zero dummy records.',
  },
  {
    icon: Zap,
    title: 'Verified Contact Enrichment',
    desc: 'Automated email discovery, Cloudflare deobfuscation, and WhatsApp phone number extraction.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Messenger Outreach',
    desc: 'Launch 1-to-1 conversations instantly on Facebook Messenger (m.me) and WhatsApp (wa.me) to pitch clients.',
  },
];

/**
 * Split-screen shell shared by the Sign In & Sign Up pages.
 */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex bg-white text-slate-800">
      {/* ── Brand panel (desktop) ───────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-[46%] xl:w-[44%] relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white p-12 flex-col justify-between">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-violet-500/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <Link href="/" className="relative flex items-center gap-3 w-fit">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 backdrop-blur border border-indigo-400/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight leading-none text-white">Meta Lead Engine</p>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-300 mt-1">
              Ad Intelligence & Leads
            </p>
          </div>
        </Link>

        <div className="relative space-y-8 max-w-md">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-xs font-bold text-indigo-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SaaS B2B Lead Platform
            </span>
            <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-[1.15] text-white">
              Turn active Meta Ads into high-value verified business leads.
            </h2>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              Discover real brands spending ad budget right now, enrich their decision-maker emails & phones, and start outreach in seconds.
            </p>
          </div>

          <ul className="space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title: t, desc }) => (
              <li key={t} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-indigo-200" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t}</p>
                  <p className="text-xs text-indigo-100/70 leading-relaxed mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[11px] text-indigo-200/70 font-medium">
          © {new Date().getFullYear()} Meta Lead Engine. All rights reserved.
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
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black text-slate-900">Meta Lead Engine</span>
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

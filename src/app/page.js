'use client';

import Link from 'next/link';
import {
  Briefcase, ArrowRight, Check, Globe, Search, Layers, ListChecks,
  Download, ShieldCheck, Zap, ChevronRight, Bug
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import JobFeed from '../components/jobs/JobFeed';

const PREVIEW_JOBS = [
  { title: 'Frontend Engineer', company: 'Acme Ltd.', type: 'Full-time', mode: 'Remote', location: 'Dhaka' },
  { title: 'Data Science Intern', company: 'Beta Corp', type: 'Internship', mode: 'Hybrid', location: 'Gulshan' },
  { title: 'Backend Developer', company: 'Gamma Tech', type: 'Full-time', mode: 'On-site', location: 'Uttara' },
  { title: 'UI/UX Design Intern', company: 'Delta Studio', type: 'Internship', mode: 'Remote', location: 'Remote' },
];

const FEATURES = [
  {
    icon: Search,
    title: 'Career page crawling',
    desc: 'Point the scraper at any company career page and it finds the listings automatically.',
  },
  {
    icon: Layers,
    title: 'Smart extraction',
    desc: 'JSON-LD first, then static HTML, then a real browser — plus native Greenhouse & Lever support.',
  },
  {
    icon: ListChecks,
    title: 'Review workflow',
    desc: 'New jobs arrive as “Pending Review” so you approve exactly what you publish.',
  },
  {
    icon: Globe,
    title: 'Any company, anywhere',
    desc: 'Track companies by country and category and filter the whole pipeline instantly.',
  },
  {
    icon: Bug,
    title: 'Run reports',
    desc: 'Every scrape run is logged with jobs found, new jobs and any errors — no guesswork.',
  },
  {
    icon: Download,
    title: 'Dedupe built in',
    desc: 'Job identity hashing prevents duplicates across runs while keeping genuinely new listings.',
  },
];

const STEPS = [
  { n: '01', title: 'Add companies', desc: 'Register the companies and career pages you want to monitor.' },
  { n: '02', title: 'Run the scraper', desc: 'Start the local scraper on your computer to collect fresh listings.' },
  { n: '03', title: 'Review & publish', desc: 'Approve the jobs you want, edit details, and keep your database clean.' },
];

function Logo({ className = '' }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`} aria-label="CareerPulse home">
      <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-600/30">
        <Briefcase className="w-4 h-4 text-white" />
      </span>
      <span className="text-[15px] font-bold text-slate-900 tracking-tight">CareerPulse</span>
    </Link>
  );
}

export default function HomePage() {
  const { token } = useAuth();
  const primaryHref = token ? '/dashboard' : '/register';
  const primaryLabel = token ? 'Open dashboard' : 'Get started';

  return (
    <div className="min-h-screen bg-white text-slate-700 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="mx-auto w-full max-w-6xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500" aria-label="Primary">
            <a href="#jobs" className="hover:text-slate-900 transition-colors">Jobs</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            {!token && (
              <Link href="/login" className="hidden sm:inline-flex px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                Sign in
              </Link>
            )}
            <Link href={primaryHref} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors">
              {primaryLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.14),transparent_70%)]" />
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-24 pb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-100 bg-white text-[11px] sm:text-xs font-semibold text-indigo-700 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Job & internship scraping from career pages
            </div>

            <h1 className="mt-6 text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] sm:leading-[1.08] max-w-3xl mx-auto">
              Collect every job on a career page,{' '}
              <span className="text-indigo-600">without the busywork</span>
            </h1>

            <p className="mt-5 text-[15px] sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              CareerPulse tracks the companies you care about, scrapes their career pages from your own
              machine, and keeps a clean, deduplicated database of jobs and internships.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={primaryHref} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5">
                {primaryLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
              {!token && (
                <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold transition-colors">
                  Sign in
                </Link>
              )}
            </div>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              {['Approval-based secure access', 'Runs locally — no cloud', 'Deduped jobs database'].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Product preview */}
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                <span className="ml-3 text-[11px] font-medium text-slate-400">Jobs & Internships</span>
              </div>
              <div className="p-3 sm:p-6">
                {/* Mobile: compact list (no horizontal overflow) */}
                <div className="sm:hidden rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                  {PREVIEW_JOBS.map((j) => (
                    <div key={j.title} className="flex items-center gap-3 px-3.5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{j.title}</p>
                        <p className="text-xs text-slate-500 truncate">{j.company} · {j.location}</p>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-md font-semibold text-[10px] ${j.type === 'Internship' ? 'bg-violet-50 text-violet-700' : 'bg-indigo-50 text-indigo-700'}`}>{j.type}</span>
                    </div>
                  ))}
                </div>

                {/* Desktop: full table */}
                <div className="hidden sm:block rounded-xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider">
                        <th className="px-4 py-2.5 font-bold">Job</th>
                        <th className="px-4 py-2.5 font-bold">Company</th>
                        <th className="px-4 py-2.5 font-bold">Type</th>
                        <th className="px-4 py-2.5 font-bold">Mode</th>
                        <th className="px-4 py-2.5 font-bold">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {PREVIEW_JOBS.map((j) => (
                        <tr key={j.title} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900">{j.title}</td>
                          <td className="px-4 py-3 text-slate-600">{j.company}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${j.type === 'Internship' ? 'bg-violet-50 text-violet-700' : 'bg-indigo-50 text-indigo-700'}`}>{j.type}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{j.mode}</td>
                          <td className="px-4 py-3 text-slate-500">{j.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live jobs feed (public, Active listings) */}
        <JobFeed />

        {/* Stats strip */}
        <section aria-label="Highlights" className="border-y border-slate-100 bg-slate-50/60">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Briefcase, v: 'Any company', l: 'Career pages tracked' },
              { icon: Layers, v: 'JSON-LD + HTML', l: 'Extraction strategies' },
              { icon: Globe, v: 'Greenhouse / Lever', l: 'Native ATS support' },
              { icon: ShieldCheck, v: 'Admin approved', l: 'Secure team access' },
            ].map(({ icon: Icon, v, l }) => (
              <div key={l} className="flex flex-col items-center gap-1.5">
                <Icon className="w-5 h-5 text-indigo-500" />
                <p className="text-lg font-bold text-slate-900">{v}</p>
                <p className="text-xs font-medium text-slate-500">{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-28 scroll-mt-16">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-indigo-600">Features</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything you need to keep a fresh jobs pipeline
            </h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                <span className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-slate-50/70 border-y border-slate-100 scroll-mt-16">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-28">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-sm font-bold text-indigo-600">How it works</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                From career page to clean database in three steps
              </h2>
            </div>
            <div className="mt-12 grid md:grid-cols-3 gap-5">
              {STEPS.map((s, i) => (
                <div key={s.n} className="relative rounded-2xl bg-white border border-slate-200 p-6">
                  <span className="text-sm font-bold text-indigo-600">{s.n}</span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 w-6 h-6 text-slate-300 bg-slate-50 rounded-full z-10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-28">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-5 py-12 sm:px-6 sm:py-16 text-center">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(99,102,241,0.45),transparent_70%)]" />
            <div className="relative">
              <Zap className="w-6 h-6 text-indigo-300 mx-auto" />
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-xl mx-auto">
                Ready to build your jobs database?
              </h2>
              <p className="mt-3 text-slate-300 max-w-md mx-auto">
                Request access today. Once a super admin approves your account, you&apos;re ready to start tracking companies.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href={primaryHref} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold transition-colors">
                  {primaryLabel}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {!token && (
                  <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-white text-sm font-semibold transition-colors">
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <Logo />
          <p>© {new Date().getFullYear()} CareerPulse. All rights reserved.</p>
          <div className="flex items-center gap-5 font-medium">
            <Link href="/login" className="hover:text-slate-900 transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-slate-900 transition-colors">Request access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

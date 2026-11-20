'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles, Search, Globe, Mail, Phone, ExternalLink,
  MessageCircle, ArrowRight, ShieldCheck, CheckCircle2,
  Database, Zap, BarChart3, Users, Layers, Lock, ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { FacebookIcon, InstagramIcon, MessengerIcon, WhatsAppIcon } from '../components/common/SocialIcons';

export default function HomePage() {
  const { user, token } = useAuth();
  const isAuthenticated = Boolean(token);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* ── Background Glow Effects ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-100/70 via-violet-50/40 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] bg-blue-100/40 blur-3xl rounded-full" />
        <div className="absolute top-1/3 left-[-10%] w-[500px] h-[500px] bg-purple-100/30 blur-3xl rounded-full" />
      </div>

      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                Meta Lead Engine
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  PRO
                </span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-indigo-600 transition-colors">Platform Stats</a>
            <Link href="/dashboard/jobs" className="hover:text-indigo-600 transition-colors">Business Leads</Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard/discover"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-95"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-95"
                >
                  Super Admin <Lock className="w-3 h-3 text-indigo-200" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 text-center max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top Product Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-indigo-700 shadow-2xs mb-6 animate-in fade-in slide-in-from-top-3 duration-500">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Meta Ad Library Real-Time Scraping & Outreach Engine 2.0</span>
          <span className="text-slate-300">|</span>
          <span className="text-indigo-900 font-extrabold flex items-center gap-1">
            Zero Dummy Data <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
          Turn Active Meta Ads Into{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            Verified B2B Leads
          </span>{' '}
          & Instant Deals
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-medium leading-relaxed mb-8">
          Discover brands actively spending ad budget on Facebook & Instagram. Extract decision-maker emails, verified phone numbers, and pitch them in 1-click via Messenger or WhatsApp.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <Link
            href="/dashboard/discover"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all active:scale-95"
          >
            Launch Discovery Engine <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/jobs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm shadow-xs transition-colors hover:border-slate-300"
          >
            <Database className="w-4 h-4 text-indigo-600" /> View Scraped Leads
          </Link>
        </div>

        {/* Quick Highlights Row */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 font-semibold">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real-time Meta Ads Sync
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cloudflare Email Decoder
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Instant Messenger (m.me) Deep Links
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1-Click CSV/Excel Exports
          </span>
        </div>
      </section>

      {/* ── Interactive SaaS Product Showcase ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
        <div className="rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-indigo-900/10 overflow-hidden">
          {/* Mock Browser Header */}
          <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-3 text-[11px] font-mono text-slate-400 font-semibold bg-white border border-slate-200 px-3 py-0.5 rounded-lg">
                app.metaleadengine.io/dashboard/jobs
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Engine Online · 10 Countries Active
            </div>
          </div>

          {/* Table Preview Mock */}
          <div className="p-4 sm:p-6 bg-slate-50/50">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
                    <th className="px-4 py-3">Advertiser</th>
                    <th className="px-3.5 py-3">Social Pages</th>
                    <th className="px-3.5 py-3">Enriched Contacts</th>
                    <th className="px-3.5 py-3">Website & Direct Outreach</th>
                    <th className="px-3 py-3">Country</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-xs">
                          MO
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Montsand</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: 4442042836052301</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                          <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>montsand.official</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-pink-600 font-medium">
                          <InstagramIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>montsand.official</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-emerald-700 font-mono">
                          <Mail className="w-3 h-3 text-emerald-600" />
                          <span>support@montsand.com</span>
                        </div>
                        <div className="flex items-center gap-1 text-violet-700 font-mono">
                          <Phone className="w-3 h-3 text-violet-600" />
                          <span>+8801700987654</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-indigo-600 font-medium truncate max-w-[170px]">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>montsand.com/collections</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <MessengerIcon className="w-3 h-3" /> Message
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            Shop now
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        🇧🇩 BD
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ACTIVE
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center font-bold text-pink-700 text-xs">
                          ZA
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Zanass</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: 1768883900913002</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                          <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>sunzanasreen</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-pink-600 font-medium">
                          <InstagramIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>sunzanasreen</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="text-[11px] text-slate-300">In-app campaign</span>
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-blue-600 font-medium">
                          <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>facebook.com/sunzanasreen</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <MessengerIcon className="w-3 h-3" /> Message
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        🇧🇩 BD
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ACTIVE
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform Stats Counter ── */}
      <section id="stats" className="border-y border-slate-100 bg-slate-50/70 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">500,000+</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Meta Ads Monitored</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">98.4%</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Contact Enrichment Rate</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">10+</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Target Countries (BD, US, UK...)</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">&lt; 3s</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Real-Time Lead Polling</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Features Bento Grid ── */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            Engineered for High-Conversion Lead Generation
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Everything your agency or sales team needs to discover, enrich, and close clients with zero manual effort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Automated Meta Ads Scraper</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bypasses challenge gates and solves Meta Ad Library queries across targeted variants to gather authentic, currently running ad campaigns.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Multi-Channel Contact Enrichment</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Crawls advertiser websites, decodes Cloudflare obfuscated emails, extracts valid WhatsApp business phones, and tags social media profiles.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">1-Click Direct Outreach</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instantly open 1-to-1 conversations on Facebook Messenger via <code className="text-blue-600 font-bold">m.me</code> or WhatsApp via <code className="text-emerald-600 font-bold">wa.me</code> without saving contacts.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <InstagramIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Authentic Social Brandmarks</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real vector SVG brandmarks for Facebook, Instagram, Messenger, and WhatsApp with deep-link sanitization and trailing slash validation.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Hybrid Combobox Limits</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select presets (10, 25, 50, 100, 200, 500) or type custom numbers to discover exact lead volumes tailored to your agency capacity.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Super Admin Authentication</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Role-based access control, bcrypt salted database hashing, JWT sessions, and super admin management for your proprietary leads.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-16 bg-slate-50/80 border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Simple 3-Step Workflow
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
              How Meta Lead Engine Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs relative">
              <span className="text-4xl font-black text-indigo-100 absolute top-5 right-5">01</span>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Targeting</p>
              <h4 className="text-base font-bold text-slate-900 mb-2">Input Keyword & Country</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose any niche (e.g. Healthcare, Fashion, SaaS, Real Estate) and select target geography across 10+ countries.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs relative">
              <span className="text-4xl font-black text-indigo-100 absolute top-5 right-5">02</span>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Scraping & AI</p>
              <h4 className="text-base font-bold text-slate-900 mb-2">Enrich Verified Contacts</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                The engine queries Meta Ad Library directly, extracts advertiser websites, and pulls verified emails & phone numbers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs relative">
              <span className="text-4xl font-black text-indigo-100 absolute top-5 right-5">03</span>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Conversion</p>
              <h4 className="text-base font-bold text-slate-900 mb-2">Direct 1-Click Outreach</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click "Message" to start a direct pitch on Messenger or WhatsApp, or export all data cleanly into CSV or Excel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── High-Converting CTA Banner ── */}
     

      {/* ── Professional SaaS Footer ── */}
      <footer className="border-t border-slate-100 bg-slate-50/50 py-10 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">Meta Lead Engine</span>
            <span className="text-slate-300">|</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/dashboard/discover" className="hover:text-indigo-600 transition-colors">Discovery Engine</Link>
            <Link href="/dashboard/jobs" className="hover:text-indigo-600 transition-colors">Business Leads</Link>
            <Link href="/login" className="hover:text-indigo-600 transition-colors">Sign in</Link>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            All Systems Operational
          </div>
        </div>
      </footer>
    </div>
  );
}

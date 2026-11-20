'use client';

import React, { useEffect, useState } from 'react';
import {
  Compass,
  Download,
  KeyRound,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from 'lucide-react';
import API from '../../lib/api';

export default function Navbar({ onOpenSettings, onOpenRun, totalLeads = 0 }) {
  const [serverHealthy, setServerHealthy] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const res = await API.get('/health', { timeout: 4000 });
      setServerHealthy(res.data?.success === true);
    } catch {
      setServerHealthy(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  MetaAd LeadScraper
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  MERN Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Ad Library Intelligence & Cheerio Enrichment
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-3">
            {/* Server Status Pill */}
            <button
              onClick={checkHealth}
              title="Click to re-check API connection"
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition text-xs text-slate-300"
            >
              <span className="relative flex h-2 w-2">
                {serverHealthy === true && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    serverHealthy === true
                      ? 'bg-emerald-500'
                      : serverHealthy === false
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                ></span>
              </span>
              <span className="font-mono text-[11px]">
                {serverHealthy === true
                  ? 'API Live'
                  : serverHealthy === false
                  ? 'API Offline'
                  : 'Checking...'}
              </span>
              <RefreshCw
                className={`h-3 w-3 text-slate-500 ${
                  isChecking ? 'animate-spin' : ''
                }`}
              />
            </button>

            {/* Total Leads Tag */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Database:</span>
              <span className="font-semibold text-slate-200">{totalLeads} Leads</span>
            </div>

            {/* Launch Scraper Button */}
            <button
              onClick={onOpenRun}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition active:scale-[0.98]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Start Scraper</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition"
              title="Meta Graph API Token & Settings"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

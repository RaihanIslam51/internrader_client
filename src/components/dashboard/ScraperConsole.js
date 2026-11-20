'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  Pause,
  RotateCcw,
  Terminal,
  Sparkles,
  Layers,
  Globe2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { collectionApi } from '../../lib/api/leads';

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'AE', name: 'UAE (Dubai)', flag: '🇦🇪' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ALL', name: 'Worldwide / All', flag: '🌐' },
];

export default function ScraperConsole({ onJobFinished, activeJobId, setActiveJobId }) {
  const [keyword, setKeyword] = useState('Dental Clinic');
  const [country, setCountry] = useState('US');
  const [adStatus, setAdStatus] = useState('ACTIVE');
  const [limit, setLimit] = useState(15);
  const [accessToken, setAccessToken] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isStarting, setIsStarting] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  const terminalEndRef = useRef(null);

  // Poll active job status
  useEffect(() => {
    let timer;
    if (activeJobId) {
      setIsPolling(true);
      const poll = async () => {
        try {
          const res = await collectionApi.getStatus(activeJobId);
          if (res.success && res.data) {
            setJobData(res.data);
            if (['completed', 'stopped', 'failed'].includes(res.data.status)) {
              setIsPolling(false);
              if (onJobFinished) onJobFinished();
              return;
            }
          }
        } catch {
          setIsPolling(false);
        }
        timer = setTimeout(poll, 1600);
      };
      poll();
    }
    return () => clearTimeout(timer);
  }, [activeJobId, onJobFinished]);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [jobData?.logs]);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsStarting(true);
    try {
      const savedToken =
        accessToken.trim() ||
        (typeof window !== 'undefined' ? localStorage.getItem('meta_access_token') || '' : '');

      const res = await collectionApi.start({
        keyword: keyword.trim(),
        country,
        adStatus,
        limit: Number(limit),
        accessToken: savedToken || undefined,
      });

      if (res.success && res.data?.jobId) {
        setActiveJobId(res.data.jobId);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    if (!activeJobId) return;
    try {
      await collectionApi.stop(activeJobId);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePause = async () => {
    if (!activeJobId) return;
    try {
      await collectionApi.pause(activeJobId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResume = async () => {
    if (!activeJobId) return;
    try {
      await collectionApi.resume(activeJobId);
    } catch (err) {
      console.error(err);
    }
  };

  const total = jobData?.totalFound || 0;
  const processed = jobData?.processedCount || 0;
  const progressPercent = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl shadow-black/30 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Form: Configuration */}
        <div className="lg:w-5/12 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-white text-base">
                  Meta Ad Library Scraper Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Target active advertisers and enrich public business contacts
                </p>
              </div>
            </div>

            <form onSubmit={handleStart} className="space-y-4 mt-4">
              {/* Search Keyword */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Search Keyword / Business Niche
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. Dental Clinic, Fitness Gym, SaaS AI, Fashion Brand"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Country & Ad Status Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Country */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1">
                    <Globe2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>Target Country</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-slate-900">
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ad Status */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <span>Ad Status</span>
                  </label>
                  <select
                    value={adStatus}
                    onChange={(e) => setAdStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="ACTIVE" className="bg-slate-900">Active Ads Only</option>
                    <option value="ALL" className="bg-slate-900">All (Active & Inactive)</option>
                    <option value="INACTIVE" className="bg-slate-900">Inactive Only</option>
                  </select>
                </div>
              </div>

              {/* Target Limit */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Batch Lead Count Target</span>
                  <span className="text-indigo-400 font-mono font-semibold">{limit} leads</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setLimit(num)}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                        limit === num
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Meta API Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 transition"
                >
                  <KeyRound className="h-3 w-3" />
                  <span>{showAdvanced ? 'Hide API Token Field' : 'Override Meta API Token'}</span>
                </button>
                {showAdvanced && (
                  <div className="mt-2">
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="Paste EAAB... Meta Graph API user token (optional)"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Leave empty to use permitted directory fallback mode with live business websites.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isStarting || (jobData && jobData.status === 'running')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs tracking-wide uppercase shadow-lg shadow-indigo-600/20 transition active:scale-[0.99] flex items-center justify-center space-x-2"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Initializing Scraper...</span>
                  </>
                ) : jobData && jobData.status === 'running' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Scraper In Progress...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Launch Lead Collection & Enrichment</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Normalized Emails & Phones</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Cheerio Homepage & Footer Extraction</span>
            </span>
          </div>
        </div>

        {/* Right Console: Live Job Progress & Terminal Feed */}
        <div className="lg:w-7/12 flex flex-col rounded-xl bg-slate-950 border border-slate-800/90 overflow-hidden shadow-inner">
          {/* Terminal Window Header */}
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs font-mono font-medium text-slate-400 ml-2 flex items-center space-x-1.5">
                <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                <span>Collection Console</span>
                {jobData && (
                  <span className="text-[10px] text-slate-500">
                    [Job: {jobData._id.slice(-6)}]
                  </span>
                )}
              </span>
            </div>

            {/* Status & Controls */}
            {jobData && (
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${
                    jobData.status === 'running'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse'
                      : jobData.status === 'paused'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : jobData.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {jobData.status}
                </span>

                {jobData.status === 'running' && (
                  <button
                    onClick={handlePause}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                    title="Pause Job"
                  >
                    <Pause className="h-3 w-3" />
                  </button>
                )}
                {jobData.status === 'paused' && (
                  <button
                    onClick={handleResume}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 transition"
                    title="Resume Job"
                  >
                    <Play className="h-3 w-3" />
                  </button>
                )}
                {['running', 'paused'].includes(jobData.status) && (
                  <button
                    onClick={handleStop}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 transition"
                    title="Stop Job"
                  >
                    <Square className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar & Counters */}
          {jobData && (
            <div className="px-4 py-3 bg-slate-900/40 border-b border-slate-800/60">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-mono">
                  Enrichment Progress ({processed} / {total})
                </span>
                <span className="font-mono font-semibold text-indigo-400">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Counters */}
              <div className="grid grid-cols-4 gap-2 mt-2.5 text-center text-[11px]">
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Found</div>
                  <div className="font-mono font-bold text-slate-200">{jobData.totalFound}</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Processed</div>
                  <div className="font-mono font-bold text-blue-400">{jobData.processedCount}</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Enriched</div>
                  <div className="font-mono font-bold text-emerald-400">{jobData.enrichedCount}</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Duplicates</div>
                  <div className="font-mono font-bold text-amber-400">{jobData.duplicateCount}</div>
                </div>
              </div>
            </div>
          )}

          {/* Terminal Monospace Logs Feed */}
          <div className="flex-1 p-3.5 font-mono text-xs overflow-y-auto max-h-72 min-h-[220px] space-y-1.5 select-text">
            {!jobData || !jobData.logs || jobData.logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center py-10">
                <Terminal className="h-8 w-8 mb-2 opacity-30" />
                <p>Console idle. Configure parameters and click "Launch" above.</p>
              </div>
            ) : (
              jobData.logs.map((log, index) => {
                const time = log.timestamp
                  ? new Date(log.timestamp).toLocaleTimeString()
                  : '';
                return (
                  <div key={index} className="flex items-start space-x-2 leading-relaxed">
                    <span className="text-slate-600 text-[10px] select-none pt-0.5">
                      {time}
                    </span>
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded font-semibold select-none ${
                        log.level === 'success'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : log.level === 'warn'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : log.level === 'error'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}
                    >
                      {log.level.toUpperCase()}
                    </span>
                    <span
                      className={`break-all ${
                        log.level === 'success'
                          ? 'text-emerald-300'
                          : log.level === 'warn'
                          ? 'text-amber-300'
                          : log.level === 'error'
                          ? 'text-rose-300'
                          : 'text-slate-300'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

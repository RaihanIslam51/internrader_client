'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Radar, Search, Play, Loader2, SlidersHorizontal, Terminal,
  Sparkles, Building2, CheckCircle2, XCircle, AlertTriangle, Zap, MinusCircle
} from 'lucide-react';
import Link from 'next/link';
import { companiesApi } from '../../../lib/api/companies';
import { useEngineRun } from '../../../hooks/useEngineRun';

const LEVEL_STYLE = {
  info: 'text-slate-300',
  success: 'text-emerald-400',
  warn: 'text-amber-400',
  error: 'text-rose-400',
  plain: 'text-slate-200',
};

const SCOPES = [
  { value: 'all', label: 'All active' },
  { value: 'selected', label: 'Selected' },
  { value: 'requested', label: 'Requested' },
];

function StatusPill({ status }) {
  const running = status === 'running';
  if (!status) return null;
  const tone = running
    ? 'bg-sky-50 text-sky-700 border-sky-200'
    : status === 'completed'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full border capitalize ${tone}`}>
      {running && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />}
      {status}
    </span>
  );
}

export default function DiscoverPage() {
  const [scope, setScope] = useState('all');
  const [search, setSearch] = useState('');
  const [max, setMax] = useState(0);
  const [honorRobots, setHonorRobots] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [notice, setNotice] = useState('');

  const { running, run, logs, error, start } = useEngineRun();

  const { data: companiesData, isLoading } = useQuery({
    queryKey: ['discover-companies'],
    queryFn: () => companiesApi.getAll({ limit: 1000, sort: 'name' }),
    staleTime: 15000,
  });

  const companies = useMemo(() => companiesData?.data || [], [companiesData]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        (c.companyName || '').toLowerCase().includes(q) ||
        (c.careerPageUrl || '').toLowerCase().includes(q)
    );
  }, [companies, search]);

  const logBoxRef = useRef(null);
  useEffect(() => {
    if (logBoxRef.current) logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
  }, [logs]);

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectAllFiltered = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((c) => next.add(c._id));
      return next;
    });

  const handleStart = () => {
    setNotice('');
    if (running) return;
    if (scope === 'selected' && selected.size === 0) {
      setNotice('Select at least one company to scan.');
      return;
    }
    start({
      onlyRequested: scope === 'requested',
      companyIds: scope === 'selected' ? Array.from(selected) : [],
      max: Number(max) || 0,
      honorRobots,
    });
  };

  const totals = run?.totals;

  return (
    <div className="space-y-5 container mx-auto text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Radar className="w-6 h-6 text-indigo-600" /> Discovery Engine
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Run the career-page scraping engine from here. It executes on the server and collects verified job leads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={run?.status} />
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={'Search companies, e.g. "Brain Station" or "Dhaka"'}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center h-11 rounded-xl border border-slate-200 bg-white px-3 gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <input
                type="number"
                min={0}
                value={max}
                onChange={(e) => setMax(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-12 text-sm font-semibold text-slate-800 focus:outline-none tabular-nums"
                aria-label="Max companies"
              />
              <span className="text-xs text-slate-400">max</span>
            </div>

            <button
              onClick={handleStart}
              disabled={running}
              className={`inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-bold text-white transition-colors ${
                running ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {running ? 'Scanning…' : 'Start engine'}
            </button>
          </div>
        </div>

        {/* Scope chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-slate-400 mr-1">Scope</span>
          {SCOPES.map((s) => (
            <button
              key={s.value}
              onClick={() => setScope(s.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                scope === s.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {s.label}
              {s.value === 'selected' && selected.size > 0 && (
                <span className="ml-1.5 opacity-80">{selected.size}</span>
              )}
            </button>
          ))}

          <button
            onClick={() => setShowFilters((v) => !v)}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Advanced filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                checked={honorRobots}
                onChange={(e) => setHonorRobots(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Honour robots.txt
            </label>
            <span className="text-xs text-slate-400">
              Politeness delay, retries and concurrency are configured on the server.
            </span>
          </div>
        )}

        {(notice || error) && (
          <p className="mt-3 text-xs font-semibold text-rose-600 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> {notice || error}
          </p>
        )}
      </div>

      {/* Results summary */}
      {totals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Companies', value: totals.companies },
            { label: 'Jobs found', value: totals.jobsFound },
            { label: 'New jobs', value: totals.newJobs, tone: 'text-emerald-600' },
            { label: 'Updated', value: totals.updatedJobs },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{s.label}</p>
              <p className={`text-xl font-bold tabular-nums ${s.tone || 'text-slate-900'}`}>{s.value ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Body: companies + live logs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Companies */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-800">Companies</h2>
              <span className="text-xs text-slate-400">({filtered.length})</span>
            </div>
            {scope === 'selected' && (
              <div className="flex items-center gap-2 text-xs font-semibold">
                <button onClick={selectAllFiltered} className="text-indigo-600 hover:text-indigo-700">Select all</button>
                <span className="text-slate-200">|</span>
                <button onClick={() => setSelected(new Set())} className="text-slate-500 hover:text-slate-700">Clear</button>
              </div>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
            {isLoading && (
              <div className="px-4 py-10 text-center text-slate-400 text-sm">Loading companies…</div>
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="px-4 py-10 text-center text-slate-400 text-sm">No companies match your search.</div>
            )}
            {filtered.map((c) => {
              const isSelected = selected.has(c._id);
              return (
                <div
                  key={c._id}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                    scope === 'selected' ? 'cursor-pointer hover:bg-slate-50' : ''
                  }`}
                  onClick={scope === 'selected' ? () => toggle(c._id) : undefined}
                >
                  {scope === 'selected' && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(c._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/companies/${c._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm font-semibold text-slate-800 hover:text-indigo-600 truncate block"
                    >
                      {c.companyName}
                    </Link>
                    <p className="text-xs text-slate-400 truncate">{c.careerPageUrl}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                      c.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {c.scrapingStrategy || 'auto'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live logs */}
        <div className="bg-slate-900 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-100">Live logs</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
              <span className={`w-2 h-2 rounded-full ${running ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {running ? 'Running' : run ? 'Idle' : 'Ready'}
            </span>
          </div>

          <div
            ref={logBoxRef}
            className="flex-1 min-h-[360px] max-h-[420px] overflow-y-auto px-4 py-3 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap"
          >
            {logs.length === 0 && (
              <p className="text-slate-500">
                {running
                  ? 'Starting the engine…'
                  : 'Idle. Choose a scope and press “Start engine” to begin. Logs stream here in real time.'}
              </p>
            )}
            {logs.map((line, i) => (
              <div key={i} className={LEVEL_STYLE[line.level] || 'text-slate-200'}>
                {line.message}
              </div>
            ))}
          </div>

          {run?.results?.length > 0 && (
            <div className="border-t border-slate-800 px-4 py-2 text-[11px] text-slate-400 flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> {run.totals?.success || 0}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <MinusCircle className="w-3.5 h-3.5" /> {run.totals?.empty || 0}
              </span>
              <span className="inline-flex items-center gap-1 text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" /> {run.totals?.partial || 0}
              </span>
              <span className="inline-flex items-center gap-1 text-rose-400">
                <XCircle className="w-3.5 h-3.5" /> {run.totals?.failed || 0}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

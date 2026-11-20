'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Radar, Search, Play, Loader2, SlidersHorizontal, Terminal,
  Sparkles, Landmark, CheckCircle2, AlertTriangle, Zap,
  Globe, Mail, Phone, ExternalLink, ArrowRight, Building2, Check, Layers,
  Square, Cpu, ChevronDown, ChevronUp, X, Tag,
} from 'lucide-react';
import Link from 'next/link';
import { organizationsApi } from '../../../lib/api/organizations';
import { useEngineRun } from '../../../hooks/useEngineRun';
import {
  AD_CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_DEFAULT_KEYWORDS,
  ALL_NICHES,
} from '../../../constants/nicheCatalog';

const LEVEL_STYLE = {
  info: 'text-slate-400',
  success: 'text-emerald-400 font-medium',
  warn: 'text-amber-400',
  error: 'text-rose-400 font-semibold',
  plain: 'text-slate-300',
};

const COUNTRIES = [
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ALL', name: 'Worldwide', flag: '🌐' },
];

const LIMIT_PRESETS = [
  { value: 10, label: '10', hint: 'Quick test' },
  { value: 100, label: '100', hint: 'Fast scan' },
  { value: 500, label: '500', hint: 'Standard' },
  { value: 1000, label: '1,000', hint: 'Deep scan' },
  { value: 5000, label: '5,000', hint: 'High volume' },
  { value: 10000, label: '10,000', hint: 'Maximum' },
];

const AD_STATUSES = [
  { value: 'ACTIVE', label: 'Active only' },
  { value: 'ALL', label: 'All ads' },
  { value: 'INACTIVE', label: 'Inactive only' },
];

const STRATEGY_LABELS = {
  meta_graph_api: 'Graph API',
  meta_ad_library_html: 'Ad Library HTML',
  duckduckgo_search: 'Search Discovery',
  google_search: 'Google Search',
  bing_search: 'Bing Search',
  industry_directory: 'Industry Dataset',
};

/* ── Status Pill ── */
function StatusPill({ status }) {
  if (!status) return null;
  const running = status === 'running';
  const cfg = {
    running: 'bg-sky-50 text-sky-700 border-sky-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    stopped: 'bg-amber-50 text-amber-700 border-amber-200',
  }[status] || 'bg-slate-100 text-slate-500 border-slate-200';
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${cfg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-sky-500 animate-pulse' : status === 'completed' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {status}
    </span>
  );
}

/* ── Thin label above select/input ── */
function FieldLabel({ children }) {
  return (
    <p className="text-[11px] font-medium text-slate-400 mb-1 leading-none">{children}</p>
  );
}

/* ── Shared select style ── */
const SEL = 'w-full h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 appearance-none cursor-pointer hover:border-slate-300 transition-colors';

export default function DiscoverPage() {
  const [country, setCountry] = useState('BD');
  const [adCategory, setAdCategory] = useState('Fashion & Apparel');
  const [adStatus, setAdStatus] = useState('ACTIVE');
  const [search, setSearch] = useState('Fashion Brand');
  const [max, setMax] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('meta_scraper_limit');
      if (saved && Number(saved) > 0) return Number(saved);
    }
    return 10;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && max && Number(max) > 0) {
      localStorage.setItem('meta_scraper_limit', String(max));
    }
  }, [max]);
  const [scope, setScope] = useState('all');
  const [nicheCategoryFilter, setNicheCategoryFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [honorRobots, setHonorRobots] = useState(true);
  const [extractEmails, setExtractEmails] = useState(true);
  const [extractPhones, setExtractPhones] = useState(true);
  const [deepContactScan, setDeepContactScan] = useState(true);
  const [selected, setSelected] = useState(() => new Set());
  const [notice, setNotice] = useState('');

  const [isNicheDropdownOpen, setIsNicheDropdownOpen] = useState(false);
  const [nicheCategoryTab, setNicheCategoryTab] = useState('all');
  const nicheContainerRef = useRef(null);

  const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false);
  const limitContainerRef = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (nicheContainerRef.current && !nicheContainerRef.current.contains(e.target))
        setIsNicheDropdownOpen(false);
      if (limitContainerRef.current && !limitContainerRef.current.contains(e.target))
        setIsLimitDropdownOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const { running, run, logs, error, start, stop } = useEngineRun();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (running || run?.status === 'completed') {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['organization-stats'] });
      queryClient.invalidateQueries({ queryKey: ['job-stats'] });
    }
  }, [running, run?.status, run?.totals?.newJobs, queryClient]);

  const { data: organizationsData, isLoading } = useQuery({
    queryKey: ['discover-organizations'],
    queryFn: () => organizationsApi.getAll({ limit: 200, sort: 'name' }),
    staleTime: 15000,
  });

  const { data: statsData } = useQuery({
    queryKey: ['organization-stats'],
    queryFn: () => organizationsApi.getStats(),
    staleTime: 10000,
    refetchInterval: running ? 2500 : false,
  });

  const organizations = useMemo(() => organizationsData?.data || [], [organizationsData]);

  const handleCategoryChange = (newCat) => {
    setAdCategory(newCat);
    setNicheCategoryTab(newCat);
    const catObj = AD_CATEGORIES.find((c) => c.value === newCat);
    if (catObj?.defaultKeyword) setSearch(catObj.defaultKeyword);
  };

  const handleSelectNicheOption = (niche) => {
    setSearch(niche.keyword);
    setAdCategory(niche.categoryValue);
    setNicheCategoryTab(niche.categoryValue);
    setIsNicheDropdownOpen(false);
  };

  const displayedNiches = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    let list = ALL_NICHES;
    if (nicheCategoryTab !== 'all')
      list = list.filter((n) => n.categoryValue.toLowerCase() === nicheCategoryTab.toLowerCase());
    if (q)
      list = list.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.keyword.toLowerCase().includes(q) ||
          n.categoryValue.toLowerCase().includes(q) ||
          n.categoryLabel.toLowerCase().includes(q) ||
          (n.badge && n.badge.toLowerCase().includes(q))
      );
    return list;
  }, [search, nicheCategoryTab]);

  const currentQuickNiches = useMemo(() => {
    const activeCat = AD_CATEGORIES.find((c) => c.value === adCategory);
    if (activeCat?.niches?.length > 0)
      return activeCat.niches.slice(0, 7).map((n) => ({ label: n.name, keyword: n.keyword, category: activeCat.value, badge: n.badge }));
    return ALL_NICHES.slice(0, 7).map((n) => ({ label: n.name, keyword: n.keyword, category: n.categoryValue, badge: n.badge }));
  }, [adCategory]);

  const filtered = useMemo(() =>
    organizations.filter((o) =>
      nicheCategoryFilter === 'All' ||
      (o.category && o.category.toLowerCase() === nicheCategoryFilter.toLowerCase())
    ),
    [organizations, nicheCategoryFilter]
  );

  const logBoxRef = useRef(null);
  useEffect(() => {
    if (logBoxRef.current) logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
  }, [logs]);

  const toggle = (id) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selectAllFiltered = () =>
    setSelected((prev) => { const n = new Set(prev); filtered.forEach((c) => n.add(c._id)); return n; });

  const handleSelectNiche = (niche) => {
    setSearch(niche.shortName || niche.organizationName);
    if (niche.country?.length === 2) setCountry(niche.country.toUpperCase());
    if (niche.category) {
      const m = AD_CATEGORIES.find((c) => c.value.toLowerCase() === niche.category.toLowerCase());
      if (m) setAdCategory(m.value);
    }
  };

  const handleStart = () => {
    setNotice('');
    if (running) return;
    if (scope === 'selected' && selected.size === 0) {
      setNotice('Select at least one niche, or use "All" scope.');
      return;
    }
    const kw = search.trim() || CATEGORY_DEFAULT_KEYWORDS[adCategory] || 'Business Brand';
    if (!search.trim()) setSearch(kw);
    const parsedMax = Math.min(10000, Math.max(1, Number(max) || 10));
    start({ keyword: kw, country, adCategory, adStatus, max: parsedMax, organizationIds: scope === 'selected' ? Array.from(selected) : [], honorRobots, extractEmails, extractPhones, deepContactScan });
  };

  const totals = run?.totals;
  const dbStats = statsData?.data;
  const displayNichesCount = scope === 'selected' && selected.size > 0 ? selected.size : organizations.length || 0;
  const displayLeadsCount = totals?.newJobs ?? totals?.jobsFound ?? dbStats?.totalJobs ?? 0;
  const displayEmailsCount = totals?.emailsEnriched ?? dbStats?.withEmails ?? 0;
  const displayPhonesCount = totals?.phonesEnriched ?? dbStats?.withPhones ?? 0;

  return (
    <div className="container mx-auto  py-5 space-y-5 text-slate-800 pb-16">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
            <Radar className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Discovery Engine</h1>
            <p className="text-xs text-slate-400 mt-0.5">Meta Ad Library · B2B lead scraper</p>
          </div>
        </div>
        <StatusPill status={running ? 'running' : run?.status || 'ready'} />
      </div>

      {/* ── Control Card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-visible">
        <div className="h-[3px] rounded-t-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400" />
        <div className="p-4 space-y-3">

          {/* Row: selects + keyword + limit + button */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">

            {/* Country */}
            <div className="md:col-span-2">
              <FieldLabel>Country</FieldLabel>
              <div className="relative">
                <select value={country} onChange={(e) => setCountry(e.target.value)} className={SEL}>
                  {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Category */}
            <div className="md:col-span-3">
              <FieldLabel>Category</FieldLabel>
              <div className="relative">
                <select value={adCategory} onChange={(e) => handleCategoryChange(e.target.value)} className={SEL}>
                  {AD_CATEGORIES.map((cat) => <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <FieldLabel>Ad Status</FieldLabel>
              <div className="relative">
                <select value={adStatus} onChange={(e) => setAdStatus(e.target.value)} className={SEL}>
                  {AD_STATUSES.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Keyword + Limit + Start */}
            <div className="md:col-span-5 flex items-end gap-2">

              {/* Keyword with Niche Popover */}
              <div className="flex-1 relative" ref={nicheContainerRef}>
                <FieldLabel>Keyword / Niche</FieldLabel>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); if (!isNicheDropdownOpen) setIsNicheDropdownOpen(true); }}
                    onFocus={() => setIsNicheDropdownOpen(true)}
                    placeholder='e.g. "Dental Clinic"'
                    className="w-full h-10 pl-9 pr-16 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-medium hover:border-slate-300 transition-colors"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    {search && (
                      <button onClick={() => setSearch('')} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsNicheDropdownOpen((p) => !p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Browse niches"
                    >
                      {isNicheDropdownOpen ? <ChevronUp className="w-4 h-4 text-indigo-500" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* ── Niche Popover ── */}
                {isNicheDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-[540px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                      <span className="text-xs font-semibold text-slate-700">Browse Niches</span>
                      <button onClick={() => setIsNicheDropdownOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Category Tabs */}
                    <div className="px-3 py-2 border-b border-slate-100 overflow-x-auto flex items-center gap-1.5">
                      <button
                        onClick={() => setNicheCategoryTab('all')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${nicheCategoryTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}
                      >
                        All
                      </button>
                      {AD_CATEGORIES.filter((c) => c.value !== 'All Ads').map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => { setNicheCategoryTab(cat.value); setAdCategory(cat.value); }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 transition-all ${nicheCategoryTab === cat.value ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label.split(',')[0].split(' ').slice(0, 2).join(' ')}</span>
                        </button>
                      ))}
                    </div>

                    {/* Niches Grid */}
                    <div className="max-h-[260px] overflow-y-auto p-2.5 grid grid-cols-2 gap-1.5">
                      {displayedNiches.length === 0 ? (
                        <div className="col-span-2 py-8 text-center text-xs text-slate-400">
                          No results for &ldquo;{search}&rdquo; — use it as a custom keyword.
                        </div>
                      ) : (
                        displayedNiches.map((niche, idx) => {
                          const active = search === niche.keyword;
                          return (
                            <div
                              key={`${niche.categoryValue}_${niche.keyword}_${idx}`}
                              onClick={() => handleSelectNicheOption(niche)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all group ${active ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                            >
                              <span className="text-base shrink-0">{niche.categoryIcon}</span>
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs font-semibold truncate ${active ? 'text-indigo-700' : 'text-slate-700 group-hover:text-indigo-700'}`}>{niche.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono truncate">{niche.keyword}</p>
                              </div>
                              {active && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Limit Combobox (Type & Select Preset) */}
              <div className="shrink-0 w-[112px] relative" ref={limitContainerRef}>
                <FieldLabel>Limit</FieldLabel>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={max}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setMax('');
                      } else {
                        const num = parseInt(val, 10);
                        setMax(isNaN(num) ? 10 : Math.max(1, Math.min(10000, num)));
                      }
                    }}
                    onBlur={() => {
                      if (!max || Number(max) < 1) setMax(10);
                    }}
                    onFocus={() => setIsLimitDropdownOpen(true)}
                    placeholder="10"
                    title="Type custom limit or pick preset (up to 10,000)"
                    className="w-full h-10 pl-3 pr-7 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 hover:border-slate-300 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text"
                  />
                  <button
                    type="button"
                    onClick={() => setIsLimitDropdownOpen((prev) => !prev)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Choose preset limit"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLimitDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {isLimitDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-[160px] bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Presets
                    </div>
                    {LIMIT_PRESETS.map((p) => {
                      const isSelected = Number(max) === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => {
                            setMax(p.value);
                            setIsLimitDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <span className="tabular-nums font-semibold">{p.label}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{p.hint}</span>
                          {isSelected && <Check className="w-3 h-3 text-indigo-600 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Start / Stop */}
              <div className="shrink-0 flex items-center gap-1.5">
                {!running ? (
                  <button
                    onClick={handleStart}
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-[0.97] transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Start engine
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button disabled className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-500 cursor-not-allowed opacity-80">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Running…
                    </button>
                    <button
                      onClick={stop}
                      className="h-10 px-3 rounded-xl text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 transition-colors"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Quick Niches ── */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick:
            </span>
            {currentQuickNiches.map((qn) => {
              const active = search === qn.keyword && adCategory === qn.category;
              return (
                <button
                  key={`${qn.category}_${qn.keyword}`}
                  onClick={() => { setSearch(qn.keyword); setAdCategory(qn.category); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700'}`}
                >
                  {qn.label}
                </button>
              );
            })}
            <button
              onClick={() => setIsNicheDropdownOpen((p) => !p)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              + More
            </button>

            <div className="ml-auto">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${showFilters ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>
          </div>

          {/* ── Enrichment Filters ── */}
          {showFilters && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: 'Extract Emails', val: extractEmails, set: setExtractEmails },
                { label: 'Extract Phones', val: extractPhones, set: setExtractPhones },
                { label: 'Deep Crawl', val: deepContactScan, set: setDeepContactScan },
                { label: 'Honor robots.txt', val: honorRobots, set: setHonorRobots },
              ].map(({ label, val, set }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-white transition-all">
                  <div className="relative shrink-0">
                    <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} className="sr-only peer" />
                    <div className="w-8 h-4 rounded-full bg-slate-200 peer-checked:bg-indigo-600 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">{label}</span>
                </label>
              ))}
            </div>
          )}

          {/* Error */}
          {(notice || error) && (
            <div className="flex items-center justify-between gap-3 text-xs font-medium text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                {notice || error}
              </span>
              <button onClick={() => { setNotice(''); handleStart(); }} className="font-semibold hover:underline shrink-0">Retry</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Niches', value: displayNichesCount, sub: 'Target sectors', icon: Layers, top: 'from-indigo-500 to-indigo-400', num: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Advertisers', value: displayLeadsCount, sub: 'From Ad Library', icon: Building2, top: 'from-sky-500 to-sky-400', num: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Emails', value: displayEmailsCount, sub: 'Enriched', icon: Mail, top: 'from-emerald-500 to-teal-400', num: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Phones', value: displayPhonesCount, sub: 'Verified', icon: Phone, top: 'from-violet-500 to-purple-400', num: 'text-violet-600', bg: 'bg-violet-50' },
        ].map(({ label, value, sub, icon: Icon, top, num, bg }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${top}`} />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">{label}</span>
              <span className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${num}`} />
              </span>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${num}`}>{value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main Split: Niches List + Terminal ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Left — Advertiser Niches */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
          <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-slate-800">Advertiser Niches</span>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{filtered.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={nicheCategoryFilter}
                  onChange={(e) => setNicheCategoryFilter(e.target.value)}
                  className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="All">All ({organizations.length})</option>
                  {Array.from(new Set(organizations.map((o) => o.category).filter(Boolean))).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                <button onClick={selectAllFiltered} className="hover:text-indigo-600 transition-colors">All</button>
                <span className="text-slate-200">|</span>
                <button onClick={() => setSelected(new Set())} className="hover:text-slate-700 transition-colors">Clear</button>
              </div>
            </div>
          </div>

          <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-50">
            {isLoading && (
              <div className="py-14 flex flex-col items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span>Loading…</span>
              </div>
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="py-14 text-center text-slate-400 text-sm">No niches found.</div>
            )}
            {filtered.map((c) => {
              const isSel = selected.has(c._id);
              const badge = CATEGORY_COLORS[c.category] || CATEGORY_COLORS.General;
              const ctry = COUNTRIES.find((cnt) => cnt.code === (c.country || 'US').toUpperCase());
              return (
                <div
                  key={c._id}
                  onClick={() => handleSelectNiche(c)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer group transition-colors ${isSel ? 'bg-indigo-50/70' : 'hover:bg-slate-50'}`}
                >
                  {/* Custom checkbox */}
                  <div
                    onClick={(e) => { e.stopPropagation(); toggle(c._id); }}
                    className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${isSel ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white hover:border-indigo-400'}`}
                  >
                    {isSel && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 truncate transition-colors">
                        {c.organizationName}
                      </span>
                      {ctry && <span className="text-xs shrink-0">{ctry.flag}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge}`}>
                        {c.category || 'General'}
                      </span>
                      <a
                        href={c.circularUrl || `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${country}&q=${encodeURIComponent(c.shortName || c.organizationName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        Ad Library <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelectNiche(c); handleStart(); }}
                    disabled={running}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 hover:border-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Scrape
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — Live Logs Terminal */}
        <div className="bg-[#0d1117] rounded-2xl overflow-hidden flex flex-col shadow-sm border border-slate-800">
          {/* Terminal titlebar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#161b22]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex items-center gap-1.5 ml-1">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-sm font-medium text-slate-200">Engine Logs</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {run?.strategy && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  {STRATEGY_LABELS[run.strategy] || run.strategy}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                {running ? 'Running' : run ? 'Idle' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Log body */}
          <div
            ref={logBoxRef}
            className="flex-1 min-h-[380px] max-h-[420px] overflow-y-auto px-4 py-3.5 font-mono text-[11.5px] leading-6 whitespace-pre-wrap space-y-0.5"
          >
            {logs.length === 0 && (
              <div className="space-y-1.5">
                <p className="text-emerald-400 font-semibold">[Discovery Engine v2.0 Ready]</p>
                <p className="text-slate-500">Country: {COUNTRIES.find((c) => c.code === country)?.name || country}</p>
                <p className="text-slate-500">Category: {adCategory}</p>
                <p className="text-slate-500">Strategy: Meta Graph API → HTML → Search → Directory</p>
                <p className="text-slate-600 mt-3">
                  {running ? '⚡ Scraping Meta Ad Library…' : '→ Click "Start engine" to begin.'}
                </p>
              </div>
            )}
            {logs.map((line, i) => (
              <div key={i} className={LEVEL_STYLE[line.level] || 'text-slate-300'}>{line.message}</div>
            ))}
          </div>

          {/* Terminal footer */}
          <div className="border-t border-slate-800 px-4 py-2.5 bg-[#161b22] text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {run?.totals?.success || 0} found
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                {run?.totals?.emailsEnriched || 0} emails
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-violet-400" />
                {run?.totals?.phonesEnriched || 0} phones
              </span>
            </div>
            <Link href="/dashboard/jobs" className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Business Leads <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

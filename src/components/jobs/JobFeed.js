'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  Search, MapPin, Briefcase, ArrowUpRight, X, Loader2, Building2,
  CalendarDays, Clock3, Wallet, ExternalLink
} from 'lucide-react';
import { jobsApi } from '../../lib/api/jobs';

const JOB_TYPES = ['Internship', 'Full-time', 'Part-time', 'Contract', 'Trainee'];
const WORK_MODES = ['Remote', 'On-site', 'Hybrid'];
const DATE_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: '1', label: 'Today' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
];

const CHIP = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600';

/** Desktop (>= lg, 3 columns) shows 21 cards; mobile/tablet (2 columns) shows 20. */
const DESKTOP_PAGE_SIZE = 21;
const MOBILE_PAGE_SIZE = 20;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

const TYPE_BADGE = {
  Internship: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Full-time': 'bg-blue-50 text-blue-700 border-blue-200',
  'Part-time': 'bg-violet-50 text-violet-700 border-violet-200',
  Contract: 'bg-slate-100 text-slate-600 border-slate-200',
  Trainee: 'bg-teal-50 text-teal-700 border-teal-200',
};

const AVATAR_TONES = [
  'bg-indigo-500', 'bg-violet-500', 'bg-emerald-500', 'bg-sky-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-600', 'bg-fuchsia-500',
];

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const initialsOf = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

const toneOf = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
};

const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatShortDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-US', sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });
};

function CompanyLogo({ name, website, size = 'w-12 h-12' }) {
  const [failed, setFailed] = useState(false);
  const domain = hostOf(website);
  if (!domain || failed) {
    return (
      <span className={`${size} shrink-0 rounded-xl flex items-center justify-center text-white text-sm font-bold ${toneOf(name)}`}>
        {initialsOf(name)}
      </span>
    );
  }
  return (
    <span className={`${size} shrink-0 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
        alt={`${name} logo`}
        className="w-7 h-7 object-contain"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </span>
  );
}

function PublicJobCard({ job, onDetails }) {
  const posted = formatDate(job.postedDate) || formatDate(job.firstSeenAt);
  const shortPosted = formatShortDate(job.postedDate) || formatShortDate(job.firstSeenAt);
  const deadline = formatDate(job.applicationDeadline);
  const typeTone = TYPE_BADGE[job.jobType] || 'bg-slate-100 text-slate-600 border-slate-200';
  const hasType = job.jobType && job.jobType !== 'Unknown';
  const hasMode = job.workMode && job.workMode !== 'Unknown';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onDetails(job)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDetails(job); } }}
      className="group flex flex-col rounded-2xl bg-white border border-slate-200 p-3.5 sm:p-6 shadow-sm sm:shadow-none hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] sm:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 transition-all cursor-pointer sm:cursor-default"
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 sm:gap-3.5">
        <CompanyLogo name={job.companyName} website={job.companyId?.companyWebsite} size="w-10 h-10 sm:w-12 sm:h-12" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {job.title}
          </h3>
          <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm text-slate-500 truncate">{job.companyName || 'Unknown company'}</p>
        </div>
        {hasType && (
          <span className={`hidden sm:inline-flex shrink-0 items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${typeTone}`}>
            {job.jobType}
          </span>
        )}
      </div>

      {/* Meta chips */}
      <div className="mt-2.5 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
        {hasType && (
          <span className={`sm:hidden inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${typeTone}`}>
            {job.jobType}
          </span>
        )}
        {hasMode && (
          <span className={CHIP}>
            <Briefcase className="w-3 h-3 text-slate-400" />
            {job.workMode}
          </span>
        )}
        <span className={`${CHIP} min-w-0 max-w-full`}>
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{job.location || 'Not specified'}</span>
        </span>
        {shortPosted && (
          <span className={`${CHIP} sm:hidden`}>
            <CalendarDays className="w-3 h-3 text-slate-400" />
            {shortPosted}
          </span>
        )}
      </div>

      {/* Dates + source — desktop only */}
      <div className="hidden sm:grid mt-5 pt-5 border-t border-slate-100 grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400">Posted Date</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{posted || 'Not specified'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-400">Deadline</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{deadline || 'Not specified'}</p>
        </div>
      </div>

      <p className="hidden sm:block mt-4 text-xs text-slate-500">
        Source: <span className="font-semibold text-slate-600">Company Career Page</span>
      </p>

      {/* Actions */}
      <div className="mt-auto pt-3.5 sm:pt-4" onClick={(e) => e.stopPropagation()}>
        {/* Mobile: single apply button — the card itself opens details */}
        <a
          href={job.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="sm:hidden flex items-center justify-center gap-1.5 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-[13px] font-bold text-white shadow-sm shadow-indigo-600/20 transition-colors"
        >
          Apply Now <ArrowUpRight className="w-4 h-4" />
        </a>
        {/* Desktop: details + apply */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => onDetails(job)}
            className="flex-1 h-11 grid place-items-center rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            View Details
          </button>
          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-11 grid place-items-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition-colors"
          >
            <span className="inline-flex items-center gap-1.5">
              Apply Now <ArrowUpRight className="w-4 h-4" />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ jobId, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['public-job', jobId],
    queryFn: () => jobsApi.getPublicById(jobId),
    enabled: !!jobId,
    staleTime: 60000,
  });

  const job = data?.data || null;
  const skills = Array.isArray(job?.requiredSkills) ? job.requiredSkills : [];
  const posted = formatDate(job?.postedDate) || formatDate(job?.firstSeenAt);
  const deadline = formatDate(job?.applicationDeadline);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-white rounded-t-2xl">
          <div className="flex items-start gap-3.5 min-w-0">
            <CompanyLogo name={job?.companyName} website={job?.companyId?.companyWebsite} size="w-12 h-12" />
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{isLoading ? 'Loading…' : job?.title}</h3>
              <p className="mt-0.5 text-sm text-slate-500">
                {job?.companyName}
                {job?.jobType && job.jobType !== 'Unknown' && <> · {job.jobType}</>}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 shrink-0" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="px-6 py-16 flex items-center justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : job ? (
          <div className="px-5 sm:px-6 py-5 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400"><MapPin className="w-3.5 h-3.5" /> Location</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{job.location || 'Not specified'}</p>
              </div>
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400"><Briefcase className="w-3.5 h-3.5" /> Work mode</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{job.workMode && job.workMode !== 'Unknown' ? job.workMode : 'Not specified'}</p>
              </div>
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400"><CalendarDays className="w-3.5 h-3.5" /> Posted</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{posted || 'Not specified'}</p>
              </div>
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400"><Clock3 className="w-3.5 h-3.5" /> Deadline</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{deadline || 'Not specified'}</p>
              </div>
            </div>

            {job.salary && (
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400"><Wallet className="w-3.5 h-3.5" /> Salary / Stipend</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{job.salary}</p>
              </div>
            )}

            {job.description && (
              <div>
                <h4 className="text-sm font-bold text-slate-900">Job Description</h4>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line line-clamp-12">{job.description}</p>
              </div>
            )}

            {skills.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-900">Required Skills</h4>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {skills.slice(0, 20).map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Source: <span className="font-semibold text-slate-600">Company Career Page</span>
                {job.sourceUrl && (
                  <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-2 text-indigo-600 font-semibold hover:text-indigo-700">
                    Original <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </span>
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 h-11 sm:h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white transition-colors w-full sm:w-auto"
              >
                Apply Now <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          <p className="px-6 py-12 text-center text-sm text-slate-400">Job not found.</p>
        )}
      </div>
    </div>
  );
}

export default function JobFeed() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [days, setDays] = useState('');
  const [detailId, setDetailId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search.trim()); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const filters = useMemo(
    () => ({ search: debouncedSearch, jobType, workMode, days }),
    [debouncedSearch, jobType, workMode, days]
  );

  const isDesktop = useIsDesktop();
  const pageSize = isDesktop ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE;

  const { data, isLoading, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['public-jobs', filters, pageSize],
    queryFn: ({ pageParam }) => jobsApi.getPublic({ page: pageParam, limit: pageSize, ...filters }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
    staleTime: 60000,
  });

  const jobs = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const page of data?.pages || []) {
      for (const job of page.data || []) {
        if (!job?._id || seen.has(job._id)) continue;
        seen.add(job._id);
        out.push(job);
      }
    }
    return out;
  }, [data]);
  const total = data?.pages?.[0]?.total || 0;

  const inputCls =
    'h-10 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all';
  const chipCls = (active) =>
    `h-9 px-3.5 rounded-full text-[13px] font-semibold border transition-colors ${
      active
        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/20'
        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
    }`;

  return (
    <section id="jobs" className="bg-white scroll-mt-16 border-t border-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-indigo-600">Live listings</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Latest jobs &amp; internships
            </h2>
            <p className="mt-3 text-slate-500 max-w-xl">
              Fresh openings scraped straight from company career pages
              {total > 0 && <span className="font-semibold text-slate-700"> · {total.toLocaleString()} live {total === 1 ? 'job' : 'jobs'}</span>}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5">
          <div className="relative w-full sm:flex-1 sm:min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, company, location…"
              className={`${inputCls} w-full pl-9`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:contents">
            <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className={`${inputCls} w-full sm:w-auto`}>
              <option value="">Any work mode</option>
              {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={days} onChange={(e) => setDays(e.target.value)} className={`${inputCls} w-full sm:w-auto`}>
              {DATE_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-3.5 -mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button onClick={() => setJobType('')} className={`${chipCls(!jobType)} shrink-0`}>All</button>
          {JOB_TYPES.map((t) => (
            <button key={t} onClick={() => setJobType(jobType === t ? '' : t)} className={`${chipCls(jobType === t)} shrink-0`}>
              {t}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-slate-200 p-3.5 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2.5 sm:gap-3.5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
                <div className="pt-3 sm:pt-4 border-t border-slate-100 space-y-2">
                  <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
                  <div className="h-9 bg-slate-100 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
            <Building2 className="w-9 h-9 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">No jobs found</p>
            <p className="mt-1.5 text-sm text-slate-400">
              {debouncedSearch || jobType || workMode || days
                ? 'Try different filters — new listings arrive as companies are scraped.'
                : 'New listings will appear here as career pages are scraped.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {jobs.map((job) => (
                <PublicJobCard key={job._id} job={job} onDetails={(j) => setDetailId(j._id)} />
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              {hasNextPage ? (
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="inline-flex items-center justify-center gap-2 h-11 w-full sm:w-auto px-6 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 transition-colors"
                >
                  {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin" />}
                  Show more
                </button>
              ) : (
                <p className="text-xs text-slate-400">
                  {isFetching ? 'Refreshing…' : `You've seen all ${total.toLocaleString()} live jobs`}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {detailId && <DetailModal jobId={detailId} onClose={() => setDetailId(null)} />}
    </section>
  );
}

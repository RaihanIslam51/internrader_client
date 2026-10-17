'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Building2, Briefcase, Clock, Activity, ArrowUpRight, Plus, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { companiesApi } from '../../lib/api/companies';

const RUN_TONE = {
  success: 'text-emerald-600 bg-emerald-50',
  empty: 'text-slate-600 bg-slate-100',
  partial: 'text-amber-600 bg-amber-50',
  failed: 'text-rose-600 bg-rose-50',
  running: 'text-sky-600 bg-sky-50',
};

function timeAgo(value) {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['company-stats'],
    queryFn: () => companiesApi.getStats(),
    refetchInterval: 15000,
  });

  const stats = statsData?.data || {};
  const totalCompanies = Number(stats.totalCompanies || 0);
  const activeCompanies = Number(stats.activeCompanies || 0);
  const totalJobs = Number(stats.totalJobs || 0);
  const pendingJobs = Number(stats.pendingJobs || 0);
  const activeJobs = Number(stats.activeJobs || 0);
  const failedRuns = Number(stats.failedRuns || 0);

  const activity = Array.isArray(stats.activity) && stats.activity.length
    ? stats.activity
    : [{ date: '—', jobs: 0, runs: 0 }];

  const jobsByType = Array.isArray(stats.jobsByType) ? stats.jobsByType.filter((t) => t._id) : [];
  const typeTotal = jobsByType.reduce((sum, t) => sum + t.count, 0) || 1;

  const metricCards = [
    { label: 'Companies', value: totalCompanies, hint: `${activeCompanies} active`, icon: Building2, tone: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total jobs', value: totalJobs, hint: `${activeJobs} active`, icon: Briefcase, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Pending review', value: pendingJobs, hint: 'Awaiting approval', icon: Clock, tone: 'bg-amber-50 text-amber-600' },
    { label: 'Failed runs', value: failedRuns, hint: 'Needs attention', icon: AlertTriangle, tone: 'bg-rose-50 text-rose-600' },
  ];

  const cardCls = 'bg-white border border-slate-200 rounded-xl';

  return (
    <div className="space-y-6 container mx-auto text-slate-800">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            A live snapshot of your companies, scraped jobs and scraping activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 mr-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            {isLoading ? 'Syncing…' : 'Live'}
          </span>
          <Link href="/dashboard/companies" className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-[13px] font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add company
          </Link>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map(({ label, value, hint, icon: Icon, tone }) => (
          <div key={label} className={`${cardCls} p-5 hover:border-slate-300 transition-colors`}>
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-slate-500">{label}</p>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tone}`}>
                <Icon className="w-4 h-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {value.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-400">{hint}</p>
          </div>
        ))}
      </div>

      {/* Activity + distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${cardCls} lg:col-span-2 p-5 sm:p-6`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Scraping activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Jobs found & runs over the last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#4F46E5]" /> Jobs</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#C7D2FE]" /> Runs</span>
            </div>
          </div>

          <div className="h-64 w-full mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '10px', borderColor: '#E2E8F0', boxShadow: '0 10px 15px -3px rgba(15,23,42,0.08)', fontSize: '12px' }}
                  labelStyle={{ color: '#64748B', fontSize: '11px', fontWeight: 600 }}
                />
                <Bar dataKey="jobs" name="Jobs" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="runs" name="Runs" fill="#C7D2FE" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job type distribution */}
        <div className={`${cardCls} p-5 sm:p-6 flex flex-col`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Jobs by type</h2>
              <p className="text-xs text-slate-500 mt-0.5">Distribution across all companies</p>
            </div>
            <span className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-6 space-y-4 flex-1">
            {jobsByType.length === 0 && (
              <p className="text-sm text-slate-400">No jobs yet. Queue a company and run the scraper.</p>
            )}
            {jobsByType.slice(0, 6).map(({ _id, count }) => {
              const percent = Math.round((count / typeTotal) * 100);
              return (
                <div key={_id}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-slate-700">{_id}</span>
                    <span className="text-slate-500 tabular-nums">
                      <span className="font-semibold text-slate-900">{count}</span> · {percent}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <Link href="/dashboard/jobs" className="mt-6 inline-flex items-center justify-between h-10 px-3.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-[13px] font-semibold text-slate-700 transition-colors">
            Open jobs
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Recent runs */}
      <div className={`${cardCls} overflow-hidden`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-900">Recent scraping runs</h2>
          </div>
          <Link href="/dashboard/scraping" className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-700">
            View all
          </Link>
        </div>

        {(stats.recentRuns || []).length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">No scraping runs recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentRuns.map((run) => (
              <div key={run._id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{run.companyName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {run.strategy} · {timeAgo(run.startedAt)} · {run.jobsFound || 0} found
                  </p>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${RUN_TONE[run.status] || 'text-slate-500 bg-slate-50'}`}>
                  {run.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

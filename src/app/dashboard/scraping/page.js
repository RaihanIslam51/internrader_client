'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { scrapingApi } from '../../../lib/api/scraping';
import Pagination from '../../../components/common/Pagination';

const STATUS_TONE = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  empty: 'bg-slate-100 text-slate-600 border-slate-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  running: 'bg-sky-50 text-sky-700 border-sky-200',
};

const STATUS_LABEL = {
  empty: 'No postings',
};

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Success', value: 'success' },
  { label: 'No postings', value: 'empty' },
  { label: 'Partial', value: 'partial' },
  { label: 'Failed', value: 'failed' },
  { label: 'Running', value: 'running' },
];

function duration(ms) {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function ScrapingPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const limit = 20;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['scrape-logs', { page, status }],
    queryFn: () => scrapingApi.getLogs({ page, limit, status }),
    keepPreviousData: true,
  });

  const { data: failedData } = useQuery({
    queryKey: ['failed-companies'],
    queryFn: () => scrapingApi.getFailedCompanies(),
    refetchInterval: 30000,
  });

  const logs = data?.data || [];
  const counts = data?.counts || {};
  const failed = failedData?.data || [];

  return (
    <div className="space-y-5 container mx-auto text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Scraping Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            History of every local scraper run. Runs are manual — start the scraper when you want fresh data.
          </p>
        </div>
        <button onClick={() => refetch()} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Needs attention */}
      {failed.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-amber-800">Needs attention ({failed.length})</h2>
          </div>
          <div className="space-y-2">
            {failed.slice(0, 5).map((c) => (
              <div key={c._id} className="flex items-center justify-between gap-3 bg-white/70 rounded-lg px-3 py-2">
                <Link href={`/dashboard/companies/${c._id}`} className="text-sm font-semibold text-slate-800 hover:text-indigo-600 truncate">
                  {c.companyName}
                </Link>
                <span className="text-xs text-amber-700 truncate max-w-[50%]">{c.latestLog?.errorMessage || 'Last run needs attention'}</span>
              </div>
            ))}
          </div>
          {failed.length > 5 && (
            <p className="mt-2 text-xs font-semibold text-amber-700 px-1">
              +{failed.length - 5} more {failed.length - 5 === 1 ? 'company' : 'companies'} need attention
            </p>
          )}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit overflow-x-auto max-w-full">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setStatus(t.value); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${status === t.value ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {t.label}
            {t.value && counts[t.value] !== undefined && (
              <span className={`ml-1.5 ${status === t.value ? 'text-indigo-200' : 'text-slate-400'}`}>{counts[t.value]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Logs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3 font-bold">Company</th>
                <th className="px-4 py-3 font-bold">Strategy</th>
                <th className="px-4 py-3 font-bold">Started</th>
                <th className="px-4 py-3 font-bold">Duration</th>
                <th className="px-4 py-3 font-bold">Found</th>
                <th className="px-4 py-3 font-bold">New</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>}
              {!isLoading && logs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-14 text-center">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-500">No runs recorded yet</p>
                  <p className="text-xs text-slate-400 mt-1">Run the local scraper to generate reports.</p>
                </td></tr>
              )}
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/companies/${log.companyId}`} className="font-semibold text-slate-900 hover:text-indigo-600">{log.companyName}</Link>
                    {log.errorMessage && (
                      <p
                        title={log.errorMessage}
                        className={`text-xs mt-0.5 max-w-[280px] truncate ${log.status === 'failed' ? 'text-rose-500' : 'text-slate-400'}`}
                      >
                        {log.errorMessage}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 capitalize">{log.strategy}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{log.startedAt ? new Date(log.startedAt).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 text-slate-500 tabular-nums">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3 text-slate-300" />{duration(log.duration)}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">{log.jobsFound || 0}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">{log.newJobs || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_TONE[log.status] || STATUS_TONE.failed}`}>{STATUS_LABEL[log.status] || log.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4">
          <Pagination page={data?.page || 1} pages={data?.pages || 1} total={data?.total || 0} limit={limit} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}

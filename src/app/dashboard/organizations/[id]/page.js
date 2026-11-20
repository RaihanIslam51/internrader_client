'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ExternalLink, FlaskConical, PlayCircle, Power, Briefcase,
  Clock, Loader2, Landmark
} from 'lucide-react';
import { organizationsApi } from '../../../../lib/api/organizations';
import { jobsApi } from '../../../../lib/api/jobs';
import { showSwal } from '../../../../lib/swal';

const LAST_TONE = {
  success: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  empty: 'text-slate-600 bg-slate-100 border-slate-200',
  partial: 'text-amber-700 bg-amber-50 border-amber-200',
  failed: 'text-rose-700 bg-rose-50 border-rose-200',
  running: 'text-sky-700 bg-sky-50 border-sky-200',
  never: 'text-slate-500 bg-slate-100 border-slate-200',
};

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1.5 text-xl font-bold text-slate-900 tabular-nums">{value}</p>
    </div>
  );
}

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationsApi.getById(id),
    enabled: !!id,
  });

  const jobsQuery = useQuery({
    queryKey: ['organization-jobs', id],
    queryFn: () => jobsApi.getAll({ organizationId: id, limit: 10 }),
    enabled: !!id,
  });

  const organization = data?.data;
  const config = organization?.config;
  const logs = organization?.recentLogs || [];
  const jobs = jobsQuery.data?.data || [];

  const toast = (icon, title) => showSwal({ toast: true, position: 'top-end', icon, title, showConfirmButton: false, timer: 2500 });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['organization', id] });
    queryClient.invalidateQueries({ queryKey: ['organizations'] });
    queryClient.invalidateQueries({ queryKey: ['organization-stats'] });
  };

  const testMutation = useMutation({
    mutationFn: () => organizationsApi.test(id),
    onSuccess: (res) => {
      const d = res.data || {};
      showSwal({
        title: 'Circular page test',
        html: `<div style="text-align:left;font-size:13px;line-height:1.6">
          <p><b>Reachable:</b> ${d.reachable ? 'Yes' : 'No'}</p>
          <p><b>Effective strategy:</b> ${d.effectiveStrategy || '—'}</p>
          <p><b>Circulars found:</b> ${d.jsonLdJobs ?? d.htmlJobs ?? 0}</p>
          ${d.note ? `<p style="color:#b45309">${d.note}</p>` : ''}
          ${d.error ? `<p style="color:#b91c1c">${d.error}</p>` : ''}
        </div>`,
        icon: d.reachable ? 'success' : 'warning',
      });
    },
    onError: (err) => toast('error', err.message),
  });

  const scrapeMutation = useMutation({
    mutationFn: () => organizationsApi.requestScrape(id),
    onSuccess: (res) => { toast('success', res.message || 'Queued'); invalidate(); },
    onError: (err) => toast('error', err.message),
  });

  const statusMutation = useMutation({
    mutationFn: () => organizationsApi.setStatus(id, organization.status === 'Active' ? 'Inactive' : 'Active'),
    onSuccess: (res) => { toast('success', res.message || 'Updated'); invalidate(); },
    onError: (err) => toast('error', err.message),
  });

  if (isLoading) {
    return <div className="container mx-auto py-20 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  }
  if (isError || !organization) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p className="text-slate-500">Organization not found.</p>
        <Link href="/dashboard/organizations" className="text-sm font-semibold text-indigo-600 mt-2 inline-block">Back to organizations</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 container mx-auto text-slate-800">
      <button onClick={() => router.push('/dashboard/organizations')} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> All organizations
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{organization.organizationName}</h1>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${organization.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              {organization.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {[organization.organizationType, organization.ministry, organization.country].filter(Boolean).join(' · ')}
          </p>
          {organization.nameBn && <p className="mt-0.5 text-sm text-slate-400">{organization.nameBn}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => testMutation.mutate()} disabled={testMutation.isPending} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
            {testMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />} Test page
          </button>
          <button onClick={() => scrapeMutation.mutate()} disabled={scrapeMutation.isPending} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-[13px] font-semibold text-white transition-colors disabled:opacity-60">
            <PlayCircle className="w-3.5 h-3.5" /> Queue scrape
          </button>
          <button onClick={() => statusMutation.mutate()} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Power className="w-3.5 h-3.5" /> {organization.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total circulars" value={organization.totalJobs ?? 0} />
        <Stat label="Strategy" value={config?.strategy || organization.scrapingStrategy} />
        <Stat label="Last status" value={organization.lastScrapingStatus === 'empty' ? 'no circulars' : organization.lastScrapingStatus || 'never'} />
        <Stat label="Queued" value={organization.scrapeRequested ? 'Yes' : 'No'} />
      </div>

      {/* Links + config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3">URLs</h2>
          <div className="space-y-2.5 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Website</p>
              <a href={organization.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 break-all">
                {organization.website} <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Circular page</p>
              {organization.circularUrl ? (
                <a href={organization.circularUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 break-all">
                  {organization.circularUrl} <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <p className="text-slate-400">Using website</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Scraper configuration</h2>
          {!config ? (
            <p className="text-sm text-slate-400">No configuration saved — using the organization strategy ({organization.scrapingStrategy}).</p>
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              <div><dt className="text-xs text-slate-400">Strategy</dt><dd className="font-medium text-slate-700 capitalize">{config.strategy}</dd></div>
              <div><dt className="text-xs text-slate-400">Enabled</dt><dd className="font-medium text-slate-700">{config.enabled ? 'Yes' : 'No'}</dd></div>
              {Object.entries(config.selectors || {}).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="col-span-2 sm:col-span-1">
                  <dt className="text-xs text-slate-400">{k}</dt>
                  <dd className="font-mono text-xs text-slate-600 break-all">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {/* Recent logs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <Clock className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-900">Recent runs</h2>
        </div>
        {logs.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">No runs yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log._id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-slate-700">{new Date(log.startedAt).toLocaleString()}</p>
                  {log.errorMessage && <p className="text-xs text-rose-500 mt-0.5 truncate">{log.errorMessage}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400">{log.jobsFound} found · {log.newJobs} new</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border capitalize ${LAST_TONE[log.status] || LAST_TONE.never}`}>{log.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Jobs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900">Latest circulars</h2>
          </div>
          <Link href={`/dashboard/jobs?organizationId=${id}`} className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-700">View all</Link>
        </div>
        {jobs.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Landmark className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No circulars yet. Queue a scrape and run the scraper.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <Link key={job._id} href={`/dashboard/jobs/${job._id}`} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50/70 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{job.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{job.jobType || 'Unknown'} · {job.jobClass ? `Class ${job.jobClass}` : 'Class n/a'}</p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">{job.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ExternalLink, MapPin, Laptop, Building2, Calendar,
  DollarSign, Loader2, Sparkles, Mail
} from 'lucide-react';
import { jobsApi } from '../../../../lib/api/jobs';
import { showSwal } from '../../../../lib/swal';

const JOB_STATUSES = ['Pending Review', 'Active', 'Expired', 'Closed'];
const STATUS_TONE = {
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Expired: 'bg-slate-100 text-slate-500 border-slate-200',
  Closed: 'bg-rose-50 text-rose-700 border-rose-200',
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.getById(id),
    enabled: !!id,
  });

  const job = data?.data;
  const company = job?.companyId && typeof job.companyId === 'object' ? job.companyId : null;

  const toast = (icon, title) => showSwal({ toast: true, position: 'top-end', icon, title, showConfirmButton: false, timer: 2500 });

  const statusMutation = useMutation({
    mutationFn: (next) => jobsApi.update(id, { status: next }),
    onSuccess: () => {
      toast('success', 'Status updated');
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (err) => toast('error', err.message),
  });

  if (isLoading) {
    return <div className="container mx-auto py-20 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  }
  if (isError || !job) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p className="text-slate-500">Job not found.</p>
        <Link href="/dashboard/jobs" className="text-sm font-semibold text-indigo-600 mt-2 inline-block">Back to jobs</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 container mx-auto max-w-4xl text-slate-800">
      <button onClick={() => router.push('/dashboard/jobs')} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> All jobs
      </button>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">{job.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
              {company ? (
                <Link href={`/dashboard/companies/${company._id}`} className="inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-700">
                  <Building2 className="w-4 h-4" /> {company.companyName}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {job.companyName}</span>
              )}
              <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location || 'Unknown'}</span>
              <span className="inline-flex items-center gap-1.5"><Laptop className="w-4 h-4" /> {job.workMode} · {job.jobType}</span>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${STATUS_TONE[job.status] || STATUS_TONE.Expired}`}>{job.status}</span>
        </div>

        {/* Status actions */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Set status:</span>
          {JOB_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => statusMutation.mutate(s)}
              disabled={statusMutation.isPending || job.status === s}
              className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-100 ${job.status === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {s}
            </button>
          ))}
          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors"
          >
            Apply <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <InfoRow icon={DollarSign} label="Salary" value={job.salary} />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <InfoRow icon={Calendar} label="Posted" value={job.postedDate ? new Date(job.postedDate).toLocaleDateString() : null} />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <InfoRow icon={Calendar} label="Deadline" value={job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : null} />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <InfoRow icon={Calendar} label="Last seen" value={job.lastSeenAt ? new Date(job.lastSeenAt).toLocaleDateString() : null} />
        </div>
      </div>

      {/* Required skills */}
      {job.requiredSkills?.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-500" /> Required skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Description</h2>
        {job.description ? (
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
        ) : (
          <p className="text-sm text-slate-400">No description captured.</p>
        )}
      </div>

      {/* Meta */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Source</h2>
        <div className="space-y-2.5">
          <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 break-all">
            <ExternalLink className="w-4 h-4 shrink-0" /> {job.applicationUrl}
          </a>
          {job.sourceUrl && job.sourceUrl !== job.applicationUrl && (
            <p className="flex items-start gap-1.5 text-xs text-slate-400 break-all">
              <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Found on {job.sourceUrl}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

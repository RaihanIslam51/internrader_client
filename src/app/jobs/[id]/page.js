'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Landmark, ArrowLeft, MapPin, Calendar, Users2, Briefcase,
  GraduationCap, Clock, Banknote, Hash, Loader2, ExternalLink, FileText, AlertCircle,
} from 'lucide-react';
import { publicApi } from '../../../lib/api/public';

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function DetailItem({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

export default function PublicJobPage() {
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-job', id],
    queryFn: () => publicApi.getJob(id),
    enabled: Boolean(id),
  });

  const job = data?.data;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-4xl mx-auto h-16 px-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="GovtJobsBD home">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Landmark className="w-4 h-4 text-white" />
            </span>
            <span className="text-[15px] font-bold text-slate-900 tracking-tight">GovtJobsBD</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All circulars
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="mt-3 text-sm font-medium">Loading circular…</p>
          </div>
        ) : isError || !job ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center">
            <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
            <p className="mt-3 text-sm font-semibold text-rose-700">This circular could not be found.</p>
            <Link href="/" className="mt-4 inline-flex text-xs font-bold text-rose-700 hover:text-rose-800">Back to all circulars</Link>
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold">Government Circular</span>
                {job.jobClass && (
                  <span className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 text-[11px] font-bold">{job.jobClass}</span>
                )}
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${job.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {job.status}
                </span>
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">{job.title}</h1>

              {job.organizationId?.organizationName && (
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <Landmark className="w-4 h-4 text-slate-400" />
                  {job.organizationId.organizationName}
                  {job.organizationId.organizationType && (
                    <span className="text-slate-400 font-medium">· {job.organizationId.organizationType}</span>
                  )}
                </p>
              )}

              {(job.organizationId?.ministry || job.organizationId?.website) && (
                <p className="mt-1 text-xs text-slate-400">
                  {job.organizationId.ministry}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {(job.circularUrl || job.applicationUrl) && (
                  <a
                    href={job.circularUrl || job.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all"
                  >
                    <FileText className="w-4 h-4" /> View circular
                  </a>
                )}
                {job.applicationUrl && job.circularUrl && job.applicationUrl !== job.circularUrl && (
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Apply online
                  </a>
                )}
              </div>

              {job.applicationDeadline && (
                <p className="mt-4 text-xs font-semibold text-rose-600">
                  Application deadline: {formatDate(job.applicationDeadline)}
                </p>
              )}
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
                <h2 className="text-sm font-extrabold text-slate-900">Circular details</h2>
                <DetailItem icon={Hash} label="Circular number" value={job.circularNumber} />
                <DetailItem icon={Users2} label="Total vacancies" value={job.vacancyCount > 0 ? String(job.vacancyCount) : null} />
                <DetailItem icon={Briefcase} label="Job type" value={job.jobType && job.jobType !== 'Unknown' ? job.jobType : null} />
                <DetailItem icon={MapPin} label="Location" value={job.location} />
                <DetailItem icon={Banknote} label="Salary" value={job.salary} />
                <DetailItem icon={Calendar} label="Published" value={formatDate(job.postedDate)} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
                <h2 className="text-sm font-extrabold text-slate-900">Eligibility</h2>
                <DetailItem icon={GraduationCap} label="Education" value={job.education} />
                <DetailItem icon={Clock} label="Experience" value={job.experience} />
                <DetailItem icon={Users2} label="Age limit" value={job.ageLimit} />
                <DetailItem icon={Banknote} label="Application fee" value={job.applicationFee} />
                {!job.education && !job.experience && !job.ageLimit && !job.applicationFee && (
                  <p className="text-xs text-slate-400">Eligibility details are available in the official circular.</p>
                )}
              </div>
            </div>

            {job.description && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-extrabold text-slate-900 mb-3">Description</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
            )}

            <p className="mt-6 text-center text-[11px] text-slate-400">
              Always verify details on the official organization website before applying.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

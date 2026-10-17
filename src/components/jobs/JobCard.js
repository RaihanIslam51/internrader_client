'use client';

import Link from 'next/link';
import { FileText, MapPin, Pencil, Trash2, ArrowUpRight, Check } from 'lucide-react';

const STATUS_TONE = {
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Expired: 'bg-slate-100 text-slate-500 border-slate-200',
  Closed: 'bg-rose-50 text-rose-700 border-rose-200',
};

const TYPE_TONE = {
  Internship: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Full-time': 'bg-blue-50 text-blue-700 border-blue-200',
  'Part-time': 'bg-violet-50 text-violet-700 border-violet-200',
  Contract: 'bg-slate-100 text-slate-600 border-slate-200',
  Trainee: 'bg-teal-50 text-teal-700 border-teal-200',
};

const MODE_TONE = {
  Remote: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'On-site': 'bg-amber-50 text-amber-700 border-amber-200',
  Hybrid: 'bg-sky-50 text-sky-700 border-sky-200',
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const isNew = (job) => {
  if (!job.firstSeenAt) return false;
  return Date.now() - new Date(job.firstSeenAt).getTime() < 3 * 24 * 60 * 60 * 1000;
};

function Tag({ children, tone = 'bg-slate-100 text-slate-600 border-slate-200' }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full border ${tone}`}>
      {children}
    </span>
  );
}

function MetaItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-800">{value || '—'}</p>
    </div>
  );
}

export default function JobCard({ job, onEdit, onDelete, selectable = false, selected = false, onToggleSelect }) {
  const skills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
  const typeTone = TYPE_TONE[job.jobType];
  const modeTone = MODE_TONE[job.workMode];

  return (
    <div
      className={`group relative flex flex-col bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
        selected ? 'border-indigo-400 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-200'
      }`}
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400" />

      <div className="flex flex-col flex-1 p-5 pt-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          {selectable && (
            <button
              type="button"
              onClick={() => onToggleSelect?.(job)}
              aria-label={selected ? 'Deselect job' : 'Select job'}
              aria-pressed={selected}
              className={`mt-0.5 grid place-items-center w-5 h-5 rounded-md border transition-colors shrink-0 ${
                selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-transparent hover:border-indigo-400'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <FileText className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <Link
              href={`/dashboard/jobs/${job._id}`}
              className="block text-base font-bold text-slate-900 leading-snug line-clamp-2 hover:text-indigo-600 transition-colors"
            >
              {job.title}
            </Link>
            <p className="mt-0.5 text-xs text-slate-500 truncate">
              {job.companyName}
              {job.location ? <> · {job.location}</> : null}
            </p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              title="Edit"
              onClick={() => onEdit(job)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              title="Delete"
              onClick={() => onDelete(job)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {job.jobType && job.jobType !== 'Unknown' && <Tag tone={typeTone}>{job.jobType}</Tag>}
          {job.workMode && job.workMode !== 'Unknown' && <Tag tone={modeTone}>{job.workMode}</Tag>}
          {isNew(job) && (
            <span className="ml-auto inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white">
              New
            </span>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-bold text-slate-900 mb-2.5">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 8).map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  {s}
                </span>
              ))}
              {skills.length > 8 && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 text-xs font-semibold">
                  +{skills.length - 8}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Details grid */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-x-4 gap-y-4">
          <MetaItem label="Salary / Stipend" value={job.salary} />
          <MetaItem
            label="Location"
            value={
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location || 'Not specified'}
              </span>
            }
          />
          <MetaItem label="Posted Date" value={formatDate(job.postedDate)} />
          <MetaItem label="Application Deadline" value={formatDate(job.applicationDeadline)} />
        </div>

        {/* Footer meta */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Source: <span className="font-semibold text-slate-600">Company Career Page</span>
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_TONE[job.status] || STATUS_TONE.Expired}`}>
            {job.status}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2.5">
          <Link
            href={`/dashboard/jobs/${job._id}`}
            className="flex-1 h-10 grid place-items-center rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            View Details
          </Link>
          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-10 grid place-items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white transition-colors"
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

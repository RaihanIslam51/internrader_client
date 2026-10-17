'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Briefcase, ExternalLink, Pencil, Trash2, Loader2, X, MapPin, Laptop, List, LayoutGrid
} from 'lucide-react';
import { jobsApi } from '../../../lib/api/jobs';
import { showSwal } from '../../../lib/swal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Pagination from '../../../components/common/Pagination';
import JobCard from '../../../components/jobs/JobCard';

const JOB_TYPES = ['Internship', 'Full-time', 'Part-time', 'Contract', 'Trainee', 'Unknown'];
const WORK_MODES = ['Remote', 'On-site', 'Hybrid', 'Unknown'];
const JOB_STATUSES = ['Pending Review', 'Active', 'Expired', 'Closed'];

const STATUS_TONE = {
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Expired: 'bg-slate-100 text-slate-500 border-slate-200',
  Closed: 'bg-rose-50 text-rose-700 border-rose-200',
};

const inputCls =
  'w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function JobsContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [jobType, setJobType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [sort, setSort] = useState('');
  const [view, setView] = useState('table');
  const [companyId, setCompanyId] = useState(() => searchParams.get('companyId') || '');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState('');
  const [selection, setSelection] = useState(() => new Set());
  const [selectAllMatching, setSelectAllMatching] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const limit = 20;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['jobs', { page, search, status, jobType, workMode, sort, companyId }],
    queryFn: () => jobsApi.getAll({ page, limit, search, status, jobType, workMode, sort, companyId }),
    keepPreviousData: true,
  });

  const jobs = data?.data || [];
  const counts = data?.counts || {};
  const toast = (icon, title) => showSwal({ toast: true, position: 'top-end', icon, title, showConfirmButton: false, timer: 2500 });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    queryClient.invalidateQueries({ queryKey: ['company-stats'] });
  };

  const updateMutation = useMutation({
    mutationFn: (payload) => jobsApi.update(editing._id, payload),
    onSuccess: () => { toast('success', 'Job updated'); setEditing(null); invalidate(); },
    onError: (err) => setFormError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => jobsApi.deleteById(id),
    onSuccess: () => { toast('success', 'Job deleted'); setConfirmDialog(null); invalidate(); },
    onError: (err) => { toast('error', err.message); setConfirmDialog(null); },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (payload) => jobsApi.deleteMany(payload),
    onSuccess: (res) => { toast('success', res?.message || 'Jobs deleted'); setConfirmDialog(null); setSelection(new Set()); setSelectAllMatching(false); invalidate(); },
    onError: (err) => { toast('error', err.message); setConfirmDialog(null); },
  });

  const deleting = deleteMutation.isPending || bulkDeleteMutation.isPending;
  const filters = { search, status, jobType, workMode, companyId };

  const selectedCount = selectAllMatching ? (data?.total || 0) : selection.size;
  const allOnPageSelected = jobs.length > 0 && jobs.every((j) => selection.has(j._id));
  const someOnPageSelected = jobs.some((j) => selection.has(j._id));

  const toggleSelect = (job) =>
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(job._id)) next.delete(job._id); else next.add(job._id);
      return next;
    });

  const toggleSelectPage = () =>
    setSelection((prev) => {
      const next = new Set(prev);
      const selected = jobs.every((j) => next.has(j._id));
      jobs.forEach((j) => (selected ? next.delete(j._id) : next.add(j._id)));
      return next;
    });

  const clearSelection = () => { setSelection(new Set()); setSelectAllMatching(false); };

  const requestDeleteOne = (job) => setConfirmDialog({
    title: 'Delete job?',
    description: `This permanently removes "${job.title}".`,
    confirmLabel: 'Delete',
    run: () => deleteMutation.mutate(job._id),
  });

  const requestDeleteSelected = () => {
    const count = selectAllMatching ? (data?.total || selection.size) : selection.size;
    setConfirmDialog({
      title: `Delete ${count} job${count === 1 ? '' : 's'}?`,
      description: selectAllMatching
        ? `This permanently removes all ${count} job${count === 1 ? '' : 's'} matching the current filters.`
        : `This permanently removes ${count} selected job${count === 1 ? '' : 's'}.`,
      confirmLabel: `Delete ${count}`,
      run: () => (selectAllMatching
        ? bulkDeleteMutation.mutate({ all: true, filters })
        : bulkDeleteMutation.mutate({ ids: Array.from(selection) })),
    });
  };

  const requestDeleteAll = () => {
    const count = data?.total || 0;
    setConfirmDialog({
      title: `Delete all ${count} matching job${count === 1 ? '' : 's'}?`,
      description: 'This permanently removes every job matching the current filters. This action cannot be undone.',
      confirmLabel: 'Delete all',
      run: () => bulkDeleteMutation.mutate({ all: true, filters }),
    });
  };

  const openEdit = (job) => {
    setEditing(job);
    setFormError('');
    setForm({
      title: job.title || '',
      location: job.location || '',
      salary: job.salary || '',
      applicationUrl: job.applicationUrl || '',
      status: job.status || 'Pending Review',
      jobType: job.jobType || 'Unknown',
      workMode: job.workMode || 'Unknown',
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '',
      description: job.description || '',
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().slice(0, 10) : '',
    });
  };

  const submitForm = (e) => {
    e.preventDefault();
    setFormError('');
    updateMutation.mutate({
      ...form,
      requiredSkills: form.requiredSkills ? form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      applicationDeadline: form.applicationDeadline || null,
    });
  };

  const statusTabs = [
    { label: 'All', value: '' },
    ...JOB_STATUSES.map((s) => ({ label: s, value: s })),
  ];

  return (
    <div className="space-y-5 container mx-auto text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Jobs & Internships</h1>
          <p className="mt-1 text-sm text-slate-500">Review, edit and approve scraped listings.</p>
        </div>
        {companyId && (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5">
            Filtered by company
            <button onClick={() => { setCompanyId(''); clearSelection(); }} className="text-indigo-400 hover:text-indigo-700"><X className="w-3.5 h-3.5" /></button>
          </span>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit overflow-x-auto max-w-full">
        {statusTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => { setStatus(t.value); setPage(1); clearSelection(); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${status === t.value ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {t.label}
            {t.value && counts[t.value] !== undefined && (
              <span className={`ml-1.5 ${status === t.value ? 'text-indigo-200' : 'text-slate-400'}`}>{counts[t.value]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); clearSelection(); }} placeholder="Search title, company, location…" className={`${inputCls} pl-9`} />
        </div>
        <select value={jobType} onChange={(e) => { setJobType(e.target.value); setPage(1); clearSelection(); }} className={`${inputCls} w-auto`}>
          <option value="">All types</option>
          {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={workMode} onChange={(e) => { setWorkMode(e.target.value); setPage(1); clearSelection(); }} className={`${inputCls} w-auto`}>
          <option value="">All work modes</option>
          {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); clearSelection(); }} className={`${inputCls} w-auto`}>
          <option value="">Recently seen</option>
          <option value="posted">Posted date</option>
          <option value="title">Title A–Z</option>
          <option value="oldest">Oldest first</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setView('table')}
              title="Table view"
              aria-label="Table view"
              className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs font-bold transition-colors ${view === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
            <button
              onClick={() => setView('cards')}
              title="Card view"
              aria-label="Card view"
              className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs font-bold transition-colors ${view === 'cards' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
          </div>
          <button
            onClick={requestDeleteAll}
            disabled={(data?.total || 0) === 0}
            title="Delete all jobs matching the current filters"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete all
          </button>
        </div>
      </div>

      {/* Selection toolbar */}
      {selection.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
          <span className="text-sm font-bold text-indigo-900">
            {selectedCount} selected
          </span>
          {!selectAllMatching && (data?.total || 0) > selection.size && (
            <button onClick={() => setSelectAllMatching(true)} className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline underline-offset-2">
              Select all {data?.total} matching
            </button>
          )}
          {selectAllMatching && (
            <span className="text-xs font-medium text-indigo-700">Every matching job is selected</span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={clearSelection} className="h-8 px-3 rounded-lg text-xs font-bold text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors">
              Clear
            </button>
            <button
              onClick={requestDeleteSelected}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete selected
            </button>
          </div>
        </div>
      )}

      {/* Table view */}
      {view === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="pl-4 pr-2 py-3 w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all jobs on this page"
                      checked={allOnPageSelected}
                      ref={(el) => { if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected; }}
                      onChange={toggleSelectPage}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer align-middle"
                    />
                  </th>
                  <th className="px-4 py-3 font-bold">Job</th>
                  <th className="px-4 py-3 font-bold">Company</th>
                  <th className="px-4 py-3 font-bold">Location</th>
                  <th className="px-4 py-3 font-bold">Type</th>
                  <th className="px-4 py-3 font-bold">Mode</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>}
                {!isLoading && jobs.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-14 text-center">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-500">No jobs found</p>
                    <p className="text-xs text-slate-400 mt-1">Run the discovery engine to collect listings.</p>
                  </td></tr>
                )}
                {jobs.map((job) => (
                  <tr key={job._id} className={`transition-colors ${selection.has(job._id) ? 'bg-indigo-50/60' : 'hover:bg-slate-50/70'}`}>
                    <td className="pl-4 pr-2 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${job.title}`}
                        checked={selection.has(job._id)}
                        onChange={() => toggleSelect(job)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 max-w-[280px]">
                      <Link href={`/dashboard/jobs/${job._id}`} className="font-semibold text-slate-900 hover:text-indigo-600 line-clamp-1">{job.title}</Link>
                      {job.postedDate && <p className="text-xs text-slate-400 mt-0.5">Posted {new Date(job.postedDate).toLocaleDateString()}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{job.companyName}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[180px]">
                      <span className="inline-flex items-center gap-1 truncate"><MapPin className="w-3 h-3 text-slate-400 shrink-0" />{job.location || '—'}</span>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs font-medium text-slate-600">{job.jobType}</span></td>
                    <td className="px-4 py-3"><span className="text-xs font-medium text-slate-600 inline-flex items-center gap-1"><Laptop className="w-3 h-3 text-slate-400" />{job.workMode}</span></td>
                    <td className="px-4 py-3"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${STATUS_TONE[job.status] || STATUS_TONE.Expired}`}>{job.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" title="Open application" className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button title="Edit" onClick={() => openEdit(job)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button title="Delete" onClick={() => requestDeleteOne(job)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card view */
        isLoading ? (
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-14 text-center text-sm text-slate-400">Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-14 text-center">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">No jobs found</p>
            <p className="text-xs text-slate-400 mt-1">Run the discovery engine to collect listings.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  ref={(el) => { if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected; }}
                  onChange={toggleSelectPage}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                {allOnPageSelected ? 'Clear page selection' : `Select all on page (${jobs.length})`}
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onEdit={openEdit}
                  onDelete={requestDeleteOne}
                  selectable
                  selected={selection.has(job._id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </div>
          </div>
        )
      )}

      {/* Pagination */}
      <div className="bg-white border border-slate-200 rounded-xl px-4">
        <Pagination page={data?.page || 1} pages={data?.pages || 1} total={data?.total || 0} limit={limit} onPageChange={(p) => { setPage(p); clearSelection(); }} />
      </div>

      {isFetching && !isLoading && <p className="text-xs text-slate-400">Refreshing…</p>}

      {/* Edit modal */}
      {editing && (
        <Modal title="Edit job" onClose={() => setEditing(null)}>
          <form onSubmit={submitForm} className="space-y-4">
            {formError && <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{formError}</div>}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  {JOB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Type</label>
                <select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} className={inputCls}>
                  {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Work mode</label>
                <select value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })} className={inputCls}>
                  {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Application deadline</label>
                <input type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Salary</label>
                <input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Required skills (comma separated)</label>
              <input value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} className={inputCls} placeholder="React, Node.js, MongoDB" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Application URL</label>
              <input type="url" value={form.applicationUrl} onChange={(e) => setForm({ ...form, applicationUrl: e.target.value })} className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
              <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setEditing(null)} className="h-9 px-4 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" disabled={updateMutation.isPending} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-[13px] font-semibold text-white transition-colors">
                {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => confirmDialog?.run()}
        loading={deleting}
        title={confirmDialog?.title}
        description={confirmDialog?.description}
        confirmLabel={confirmDialog?.confirmLabel || 'Delete'}
        confirmVariant="danger"
      />
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-20 text-center text-slate-400">Loading…</div>}>
      <JobsContent />
    </Suspense>
  );
}

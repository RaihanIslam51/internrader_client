'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Search, Building2, RefreshCw, ExternalLink, Pencil, Trash2,
  PlayCircle, Power, X, Loader2, FlaskConical
} from 'lucide-react';
import { companiesApi } from '../../../lib/api/companies';
import { showSwal } from '../../../lib/swal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Pagination from '../../../components/common/Pagination';

const STRATEGIES = ['auto', 'jsonld', 'static', 'playwright', 'greenhouse', 'lever', 'custom'];
const STATUSES = ['Active', 'Inactive'];

const EMPTY_FORM = {
  companyName: '',
  companyWebsite: '',
  careerPageUrl: '',
  country: 'Unknown',
  category: 'Software',
  status: 'Active',
  scrapingStrategy: 'auto',
};

const STATUS_TONE = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-500 border-slate-200',
};

const LAST_TONE = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  empty: 'bg-slate-100 text-slate-600 border-slate-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  running: 'bg-sky-50 text-sky-700 border-sky-200',
  never: 'bg-slate-100 text-slate-500 border-slate-200',
};

const LAST_LABEL = {
  empty: 'no postings',
};

const inputCls =
  'w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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

export default function CompaniesPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [country, setCountry] = useState('');
  const [lastScrapingStatus, setLastScrapingStatus] = useState('');
  const [sort, setSort] = useState('');
  const limit = 20;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const queryKey = ['companies', { page, search, status, country, lastScrapingStatus, sort }];

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () => companiesApi.getAll({ page, limit, search, status, country, lastScrapingStatus, sort }),
    keepPreviousData: true,
  });

  const companies = data?.data || [];
  const countries = data?.countries || [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['companies'] });
    queryClient.invalidateQueries({ queryKey: ['company-stats'] });
  };

  const toast = (icon, title) => showSwal({ toast: true, position: 'top-end', icon, title, showConfirmButton: false, timer: 2500 });

  const saveMutation = useMutation({
    mutationFn: (payload) => (editing ? companiesApi.update(editing._id, payload) : companiesApi.create(payload)),
    onSuccess: (res) => {
      toast('success', editing ? 'Company updated' : 'Company added');
      setFormOpen(false);
      invalidate();
    },
    onError: (err) => setFormError(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }) => companiesApi.setStatus(id, next),
    onSuccess: (res) => { toast('success', res.message || 'Status updated'); invalidate(); },
    onError: (err) => toast('error', err.message),
  });

  const scrapeMutation = useMutation({
    mutationFn: (id) => companiesApi.requestScrape(id),
    onSuccess: (res) => { toast('success', res.message || 'Queued'); invalidate(); },
    onError: (err) => toast('error', err.message),
  });

  const testMutation = useMutation({
    mutationFn: (id) => companiesApi.test(id),
    onSuccess: (res) => {
      const d = res.data || {};
      showSwal({
        title: 'Career page test',
        html: `<div style="text-align:left;font-size:13px;line-height:1.6">
          <p><b>Reachable:</b> ${d.reachable ? 'Yes' : 'No'}</p>
          <p><b>Effective strategy:</b> ${d.effectiveStrategy || '—'}</p>
          <p><b>JSON-LD jobs found:</b> ${d.jsonLdJobs ?? 0}</p>
          <p><b>Static jobs found:</b> ${d.htmlJobs ?? 0}</p>
          ${d.note ? `<p style="color:#b45309">${d.note}</p>` : ''}
          ${d.error ? `<p style="color:#b91c1c">${d.error}</p>` : ''}
        </div>`,
        icon: d.reachable ? 'success' : 'warning',
      });
    },
    onError: (err) => toast('error', err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => companiesApi.deleteById(id),
    onSuccess: () => { toast('success', 'Company deleted'); setDeleteTarget(null); invalidate(); },
    onError: (err) => { toast('error', err.message); setDeleteTarget(null); },
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setFormError(''); setFormOpen(true); };
  const openEdit = (company) => {
    setEditing(company);
    setForm({
      companyName: company.companyName || '',
      companyWebsite: company.companyWebsite || '',
      careerPageUrl: company.careerPageUrl || '',
      country: company.country || 'Unknown',
      category: company.category || 'Software',
      status: company.status || 'Active',
      scrapingStrategy: company.scrapingStrategy || 'auto',
    });
    setFormError('');
    setFormOpen(true);
  };

  const submitForm = (e) => {
    e.preventDefault();
    setFormError('');
    saveMutation.mutate(form);
  };

  const resetFilters = () => { setSearch(''); setStatus(''); setCountry(''); setLastScrapingStatus(''); setSort(''); setPage(1); };

  return (
    <div className="space-y-5 container mx-auto text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Companies</h1>
          <p className="mt-1 text-sm text-slate-500">Manage the career pages the local scraper reads.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-[13px] font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors">
          <Plus className="w-4 h-4" /> Add company
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, URL, country…"
            className={`${inputCls} pl-9`}
          />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={`${inputCls} w-auto`}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={country} onChange={(e) => { setCountry(e.target.value); setPage(1); }} className={`${inputCls} w-auto`}>
          <option value="">All countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={lastScrapingStatus} onChange={(e) => { setLastScrapingStatus(e.target.value); setPage(1); }} className={`${inputCls} w-auto`}>
          <option value="">Any last run</option>
          {['success', 'empty', 'partial', 'failed', 'never'].map((s) => <option key={s} value={s}>{s === 'empty' ? 'no postings' : s}</option>)}
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className={`${inputCls} w-auto`}>
          <option value="">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="oldest">Oldest first</option>
          <option value="lastScraped">Last scraped</option>
        </select>
        <button onClick={resetFilters} className="h-9 px-3 rounded-lg text-[13px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors">
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3 font-bold">Company</th>
                <th className="px-4 py-3 font-bold">Career page</th>
                <th className="px-4 py-3 font-bold">Strategy</th>
                <th className="px-4 py-3 font-bold">Jobs</th>
                <th className="px-4 py-3 font-bold">Last run</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              )}
              {!isLoading && companies.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-14 text-center">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-500">No companies yet</p>
                  <p className="text-xs text-slate-400 mt-1">Add a company and point it at a career page.</p>
                </td></tr>
              )}
              {companies.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/companies/${c._id}`} className="font-semibold text-slate-900 hover:text-indigo-600">
                      {c.companyName}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5">{c.country} · {c.category}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <a href={c.careerPageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 truncate">
                      {c.careerPageUrl?.replace(/^https?:\/\//, '').slice(0, 40)}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-slate-600 capitalize">{c.scrapingStrategy}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">{c.totalJobs || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border capitalize ${LAST_TONE[c.lastScrapingStatus] || LAST_TONE.never}`}>
                      {LAST_LABEL[c.lastScrapingStatus] || c.lastScrapingStatus || 'never'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${STATUS_TONE[c.status]}`}>{c.status}</span>
                    {c.scrapeRequested && <span className="ml-1.5 text-[10px] font-bold text-amber-600">queued</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Test career page"
                        onClick={() => testMutation.mutate(c._id)}
                        disabled={testMutation.isPending}
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-40"
                      >
                        <FlaskConical className="w-4 h-4" />
                      </button>
                      <button
                        title="Queue for scraping"
                        onClick={() => scrapeMutation.mutate(c._id)}
                        disabled={scrapeMutation.isPending}
                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                      >
                        <PlayCircle className="w-4 h-4" />
                      </button>
                      <button
                        title={c.status === 'Active' ? 'Deactivate' : 'Activate'}
                        onClick={() => statusMutation.mutate({ id: c._id, next: c.status === 'Active' ? 'Inactive' : 'Active' })}
                        className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button title="Edit" onClick={() => openEdit(c)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button title="Delete" onClick={() => setDeleteTarget(c)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4">
          <Pagination
            page={data?.page || 1}
            pages={data?.pages || 1}
            total={data?.total || 0}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      </div>

      {isFetching && !isLoading && (
        <p className="text-xs text-slate-400 flex items-center gap-1.5"><RefreshCw className="w-3 h-3 animate-spin" /> Refreshing…</p>
      )}

      {/* Create / Edit modal */}
      {formOpen && (
        <Modal title={editing ? 'Edit company' : 'Add company'} onClose={() => setFormOpen(false)}>
          <form onSubmit={submitForm} className="space-y-4">
            {formError && (
              <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{formError}</div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Company name *</label>
              <input required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className={inputCls} placeholder="Acme Ltd." />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Company website *</label>
              <input required type="url" value={form.companyWebsite} onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })} className={inputCls} placeholder="https://acme.com" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Career page URL *</label>
              <input required type="url" value={form.careerPageUrl} onChange={(e) => setForm({ ...form, careerPageUrl: e.target.value })} className={inputCls} placeholder="https://acme.com/careers" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Country</label>
                <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Scraping strategy</label>
                <select value={form.scrapingStrategy} onChange={(e) => setForm({ ...form, scrapingStrategy: e.target.value })} className={inputCls}>
                  {STRATEGIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setFormOpen(false)} className="h-9 px-4 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saveMutation.isPending} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-[13px] font-semibold text-white transition-colors">
                {saveMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editing ? 'Save changes' : 'Add company'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete company?"
        description={`This removes ${deleteTarget?.companyName} and all of its jobs, configuration and scraping logs. This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}

'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, ExternalLink, Pencil, Trash2, Loader2, X,
  Globe, Mail, Phone, List, LayoutGrid, Download, Building2,
  Copy, CheckCheck, Sparkles, Filter, ChevronDown, Users,
  ArrowRight, ShieldCheck, Check, RefreshCw, MessageCircle, Target
} from 'lucide-react';
import { jobsApi } from '../../../lib/api/jobs';
import { showSwal } from '../../../lib/swal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Pagination from '../../../components/common/Pagination';
import JobCard from '../../../components/jobs/JobCard';
import AdvertiserLogo from '../../../components/common/AdvertiserLogo';
import {
  FacebookIcon,
  InstagramIcon,
  MessengerIcon,
  WhatsAppIcon,
} from '../../../components/common/SocialIcons';
import {
  resolveSocialUrls,
  formatFacebookUrl,
  formatInstagramUrl,
  getDisplayWebsite,
  getDirectMessageInfo,
} from '../../../lib/social';

const COUNTRIES = [
  { code: '', label: 'All Countries', flag: '🌐' },
  { code: 'BD', label: 'Bangladesh', flag: '🇧🇩' },
  { code: 'US', label: 'United States', flag: '🇺🇸' },
  { code: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', label: 'Canada', flag: '🇨🇦' },
  { code: 'AU', label: 'Australia', flag: '🇦🇺' },
  { code: 'DE', label: 'Germany', flag: '🇩🇪' },
  { code: 'AE', label: 'UAE', flag: '🇦🇪' },
  { code: 'FR', label: 'France', flag: '🇫🇷' },
  { code: 'IN', label: 'India', flag: '🇮🇳' },
];

const CATEGORIES = [
  'All Categories',
  'Fashion & Apparel',
  'Healthcare',
  'E-commerce',
  'Real Estate',
  'Technology',
  'Fitness',
  'Food & Beverage',
  'Automotive',
  'Education',
  'Finance',
];

const CATEGORY_COLORS = {
  Healthcare: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Fashion & Apparel': 'bg-violet-50 text-violet-700 border-violet-200',
  'E-commerce': 'bg-pink-50 text-pink-700 border-pink-200',
  'Real Estate': 'bg-blue-50 text-blue-700 border-blue-200',
  Technology: 'bg-purple-50 text-purple-700 border-purple-200',
  Fitness: 'bg-amber-50 text-amber-700 border-amber-200',
  'Food & Beverage': 'bg-orange-50 text-orange-700 border-orange-200',
  Automotive: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Finance: 'bg-teal-50 text-teal-700 border-teal-200',
  General: 'bg-slate-100 text-slate-700 border-slate-200',
};

const COUNTRY_FLAGS = {
  BD: '🇧🇩 BD',
  US: '🇺🇸 US',
  GB: '🇬🇧 GB',
  CA: '🇨🇦 CA',
  AU: '🇦🇺 AU',
  DE: '🇩🇪 DE',
  AE: '🇦🇪 AE',
  FR: '🇫🇷 FR',
  IN: '🇮🇳 IN',
  ALL: '🌐 Global',
};

const inputCls =
  'w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all';

const selectCls =
  'h-9 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 appearance-none cursor-pointer hover:border-slate-300 transition-colors';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            {title}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
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
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [adStatus, setAdStatus] = useState('');
  const [sort, setSort] = useState('');
  const [view, setView] = useState('table');
  const [organizationId, setOrganizationId] = useState(() => searchParams.get('organizationId') || '');

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const [selection, setSelection] = useState(() => new Set());
  const [selectAllMatching, setSelectAllMatching] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [limit, setLimit] = useState(25);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['jobs', { page, limit, search, status, country, category, adStatus, sort, organizationId }],
    queryFn: () => jobsApi.getAll({
      page,
      limit,
      search,
      status,
      country,
      category: category === 'All Categories' ? '' : category,
      adStatus,
      sort,
      organizationId,
    }),
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  const leads = data?.data || [];
  const counts = data?.counts || {};
  const toast = (icon, title) => showSwal({ toast: true, position: 'top-end', icon, title, showConfirmButton: false, timer: 2500 });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    queryClient.invalidateQueries({ queryKey: ['job-stats'] });
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['organization-stats'] });
    queryClient.invalidateQueries({ queryKey: ['target-niches'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    refetch();
  };

  const targetMutation = useMutation({
    mutationFn: (id) => jobsApi.toggleTarget(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      queryClient.setQueriesData({ queryKey: ['jobs'] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((lead) =>
            lead._id === id ? { ...lead, isTargeted: !lead.isTargeted } : lead
          ),
        };
      });
    },
    onSuccess: (res) => {
      toast('success', res?.message || 'Updated target status');
      invalidate();
    },
    onError: (err) => {
      toast('error', err.message || 'Failed to update target status');
      invalidate();
    },
  });

  const bulkTargetMutation = useMutation({
    mutationFn: (payload) => jobsApi.bulkTarget(payload),
    onSuccess: (res) => {
      toast('success', res?.message || 'Updated target status');
      clearSelection();
      invalidate();
    },
    onError: (err) => {
      toast('error', err.message || 'Failed to update target status');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => jobsApi.update(editing._id, payload),
    onSuccess: () => {
      toast('success', 'Lead updated');
      setEditing(null);
      invalidate();
    },
    onError: (err) => setFormError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => jobsApi.deleteById(id),
    onSuccess: () => {
      toast('success', 'Lead deleted successfully');
      setConfirmDialog(null);
      invalidate();
    },
    onError: (err) => {
      toast('error', err.message);
      setConfirmDialog(null);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (payload) => jobsApi.deleteMany(payload),
    onSuccess: (res) => {
      toast('success', res?.message || 'All leads deleted successfully');
      setConfirmDialog(null);
      setSelection(new Set());
      setSelectAllMatching(false);
      invalidate();
    },
    onError: (err) => {
      toast('error', err.message);
      setConfirmDialog(null);
    },
  });

  const selectedCount = selectAllMatching ? (data?.total || 0) : selection.size;
  const allOnPageSelected = leads.length > 0 && leads.every((j) => selection.has(j._id));
  const someOnPageSelected = leads.some((j) => selection.has(j._id));

  const toggleSelect = (lead) =>
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(lead._id)) next.delete(lead._id); else next.add(lead._id);
      return next;
    });

  const toggleSelectPage = () =>
    setSelection((prev) => {
      const next = new Set(prev);
      const selected = leads.every((j) => next.has(j._id));
      leads.forEach((j) => (selected ? next.delete(j._id) : next.add(j._id)));
      return next;
    });

  const clearSelection = () => {
    setSelection(new Set());
    setSelectAllMatching(false);
  };

  const copyText = (text, id) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const requestDeleteOne = async (lead) => {
    const name = lead?.businessName || lead?.title || 'this lead';
    const result = await showSwal({
      title: 'Delete lead?',
      text: `Are you sure you want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });
    if (result?.isConfirmed) {
      deleteMutation.mutate(lead._id);
    }
  };

  const requestDeleteSelected = async () => {
    const count = selectAllMatching ? (data?.total || selection.size) : selection.size;
    if (count === 0) return;
    const result = await showSwal({
      title: `Delete ${count} lead${count === 1 ? '' : 's'}?`,
      text: selectAllMatching
        ? `Are you sure you want to permanently delete all ${count.toLocaleString()} matching leads?`
        : `Are you sure you want to permanently delete ${count} selected lead${count === 1 ? '' : 's'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, delete ${count}`,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });
    if (result?.isConfirmed) {
      if (selectAllMatching) {
        bulkDeleteMutation.mutate({ all: true, filters: { search, status, country, category, adStatus } });
      } else {
        bulkDeleteMutation.mutate({ ids: Array.from(selection) });
      }
    }
  };

  const requestDeleteAll = async () => {
    const count = data?.total || leads.length || 0;
    if (count === 0) {
      toast('info', 'No leads to delete');
      return;
    }
    const result = await showSwal({
      title: 'Clear All Leads?',
      text: `Are you sure you want to permanently delete all ${count.toLocaleString()} business leads? All contacts and scraped ads will be removed. This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, clear all',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });
    if (result?.isConfirmed) {
      bulkDeleteMutation.mutate({ all: true });
    }
  };

  const openEdit = (lead) => {
    setEditing(lead);
    setFormError('');
    const { facebookUrl: rFb, instagramUrl: rIg } = resolveSocialUrls(lead);
    setForm({
      businessName: lead.businessName || lead.title || '',
      pageName: lead.pageName || lead.organizationName || '',
      websiteUrl: lead.websiteUrl || lead.applicationUrl || '',
      pageUrl: rFb || lead.pageUrl || '',
      facebookUrl: rFb || lead.facebookUrl || '',
      instagramUrl: rIg || lead.instagramUrl || '',
      adLibraryUrl: lead.adLibraryUrl || lead.circularUrl || '',
      adArchiveId: lead.adArchiveId || '',
      adStartDate: lead.adStartDate || '',
      ctaText: lead.ctaText || '',
      emails: Array.isArray(lead.emails) ? lead.emails.join(', ') : '',
      phones: Array.isArray(lead.phones) ? lead.phones.join(', ') : '',
      country: lead.country || 'BD',
      searchKeyword: lead.searchKeyword || lead.category || '',
      adStatus: lead.adStatus || 'ACTIVE',
    });
  };

  const submitForm = (e) => {
    e.preventDefault();
    setFormError('');
    const payload = {
      ...form,
      facebookUrl: formatFacebookUrl(form.facebookUrl),
      instagramUrl: formatInstagramUrl(form.instagramUrl),
    };
    updateMutation.mutate(payload);
  };

  // Clean, concise tabs without emojis
  const statusTabs = [
    { label: 'All', value: '', count: counts.all },
    { label: 'With Emails', value: 'withEmail', count: counts.withEmail },
    { label: 'With Phones', value: 'withPhone', count: counts.withPhone },
    { label: 'Both Contacts', value: 'withBoth', count: counts.withBoth },
    { label: 'Active Ads', value: 'Active', count: counts.Active },
  ];

  const handleExport = (format) => {
    const params = new URLSearchParams();
    if (selection.size > 0 && !selectAllMatching) {
      params.set('ids', Array.from(selection).join(','));
    } else {
      if (search) params.set('search', search);
      if (country) params.set('country', country);
      if (category && category !== 'All Categories') params.set('keyword', category);
      if (adStatus) params.set('adStatus', adStatus);
      if (status === 'withEmail') params.set('hasEmail', 'true');
      if (status === 'withPhone') params.set('hasPhone', 'true');
    }
    window.open(`http://localhost:5000/api/export/${format}?${params}`, '_blank');
  };

  return (
    <div className="container mx-auto md:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 text-slate-800 pb-16 ">

      {/* ── Page Header (Mobile-First Responsive) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Business Leads</h1>
            <p className="text-xs text-slate-400 mt-0.5 truncate sm:whitespace-normal">Verified advertiser profiles & enriched contacts</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
            title="Refresh leads list immediately"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Syncing…' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
          <Link
            href="/dashboard/discover"
            className="col-span-3 sm:col-span-1 inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            <span>Discovery Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── 4 Top Metric Cards (Mobile Grid) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          { label: 'Total Leads', value: counts.all ?? leads.length, sub: 'Advertiser profiles', icon: Building2, top: 'from-indigo-500 to-indigo-400', num: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'With Emails', value: counts.withEmail ?? 0, sub: 'Verified inboxes', icon: Mail, top: 'from-emerald-500 to-teal-400', num: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'With Phones', value: counts.withPhone ?? 0, sub: 'Direct phone lines', icon: Phone, top: 'from-violet-500 to-purple-400', num: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Active Ads', value: counts.Active ?? 0, sub: 'Live running ads', icon: Sparkles, top: 'from-amber-500 to-amber-400', num: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, sub, icon: Icon, top, num, bg }) => (
          <div key={label} className="bg-white border border-slate-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs relative overflow-hidden group hover:shadow-xs transition-shadow">
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${top}`} />
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">{label}</span>
              <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${num}`} />
              </span>
            </div>
            <p className={`text-xl sm:text-2xl font-bold tabular-nums tracking-tight ${num}`}>{value.toLocaleString()}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Filters & Controls Card ── */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs p-3 sm:p-3.5 space-y-2.5 sm:space-y-3">

        {/* Status Tabs Bar (Horizontal Touch Scroll on Mobile) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {statusTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => { setStatus(t.value); setPage(1); clearSelection(); }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                status === t.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums font-bold ${
                  status === t.value ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filter dropdowns row (Responsive on Mobile) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 pt-2 border-t border-slate-100">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); clearSelection(); }}
              placeholder="Search business, website, email, phone…"
              className="w-full h-9 pl-8.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 w-full lg:w-auto">
            {/* Country */}
            <div className="relative w-full sm:w-auto">
              <select
                value={country}
                onChange={(e) => { setCountry(e.target.value); setPage(1); clearSelection(); }}
                className={`${selectCls} w-full sm:w-auto`}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Category */}
            <div className="relative w-full sm:w-auto">
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); clearSelection(); }}
                className={`${selectCls} w-full sm:w-auto`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Ad Status */}
            <div className="relative w-full sm:w-auto">
              <select
                value={adStatus}
                onChange={(e) => { setAdStatus(e.target.value); setPage(1); clearSelection(); }}
                className={`${selectCls} w-full sm:w-auto`}
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative w-full sm:w-auto">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); clearSelection(); }}
                className={`${selectCls} w-full sm:w-auto`}
              >
                <option value="">Newest</option>
                <option value="name">Name (A–Z)</option>
                <option value="name_desc">Name (Z–A)</option>
                <option value="emails">Most Emails</option>
                <option value="phones">Most Phones</option>
                <option value="oldest">Oldest</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Toggle & Clear All on Mobile */}
            <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-start gap-1.5 w-full sm:w-auto">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setView('table')}
                  title="Table view"
                  className={`p-1.5 rounded-md text-xs font-semibold transition-all ${
                    view === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setView('cards')}
                  title="Cards view"
                  className={`p-1.5 rounded-md text-xs font-semibold transition-all ${
                    view === 'cards' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={requestDeleteAll}
                disabled={(data?.total || 0) === 0 || bulkDeleteMutation.isPending}
                title="Permanently delete all leads from database"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-rose-200 bg-rose-50/90 text-xs font-semibold text-rose-600 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>{bulkDeleteMutation.isPending ? 'Clearing…' : 'Clear All'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Selection Action Bar ── */}
      {selection.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/90 border border-indigo-200 rounded-2xl px-4 py-2.5 shadow-xs animate-in fade-in duration-100">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>{selectedCount} selected</span>
            {!selectAllMatching && (data?.total || 0) > selection.size && (
              <button
                onClick={() => setSelectAllMatching(true)}
                className="text-xs text-indigo-700 hover:text-indigo-900 underline font-semibold ml-1"
              >
                Select all {data?.total}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => bulkTargetMutation.mutate({ ids: Array.from(selection), isTargeted: true })}
              disabled={bulkTargetMutation.isPending}
              className="inline-flex items-center gap-1 h-7.5 px-3 rounded-lg border border-violet-200 bg-white text-xs font-semibold text-violet-700 hover:bg-violet-50 transition-colors"
            >
              <Target className="w-3 h-3 text-violet-600" /> Target Selected
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="inline-flex items-center gap-1 h-7.5 px-3 rounded-lg border border-indigo-200 bg-white text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
            >
              <Download className="w-3 h-3" /> Export CSV
            </button>
            <button
              onClick={clearSelection}
              className="h-7.5 px-2.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-white transition-colors"
            >
              Deselect
            </button>
            <button
              onClick={requestDeleteSelected}
              className="inline-flex items-center gap-1 h-7.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* ── Content View (Table / Cards) ── */}
      {view === 'table' ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          {/* Mobile swipe hint */}
          <div className="md:hidden px-3.5 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">Swipe horizontally to view all columns</span>
            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Scroll ↔</span>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
                  <th className="pl-4 pr-2 py-3 w-8">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={allOnPageSelected}
                      ref={(el) => { if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected; }}
                      onChange={toggleSelectPage}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-3.5 py-3 font-semibold">Advertiser</th>
                  <th className="px-3.5 py-3 font-semibold">Social Pages</th>
                  <th className="px-3.5 py-3 font-semibold">Enriched Contacts</th>
                  <th className="px-3.5 py-3 font-semibold">Website & CTA</th>
                  <th className="px-3 py-3 font-semibold">Country</th>
                  <th className="px-3.5 py-3 font-semibold">Ad Library</th>
                  <th className="px-3.5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                      Loading leads…
                    </td>
                  </tr>
                )}
                {!isLoading && leads.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center mx-auto mb-2.5">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">No leads found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Use the Discovery Engine to scrape active Meta ads.</p>
                      <Link
                        href="/dashboard/discover"
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                      >
                        Start Engine <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                )}
                {leads.map((lead) => {
                  const bName = lead.businessName || lead.title || 'Advertiser';
                  const eList = Array.isArray(lead.emails) ? lead.emails : [];
                  const pList = Array.isArray(lead.phones) ? lead.phones : [];
                  const cCode = String(lead.country || 'BD').toUpperCase();
                  const cFlag = COUNTRY_FLAGS[cCode] || cCode;
                  const cat = lead.category || lead.searchKeyword || 'E-commerce';
                  const catColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS.General;
                  const wUrl = lead.websiteUrl || lead.applicationUrl || '';
                  const aUrl = lead.adLibraryUrl || lead.circularUrl || '';
                  const isAct = lead.adStatus === 'ACTIVE';
                  const {
                    facebookUrl: resolvedFb,
                    instagramUrl: resolvedIg,
                    facebookHandle: cleanFbHandle,
                    instagramHandle: cleanIgHandle,
                  } = resolveSocialUrls(lead);
                  const siteInfo = getDisplayWebsite({ ...lead, facebookUrl: resolvedFb, instagramUrl: resolvedIg });
                  const directMsg = getDirectMessageInfo({ ...lead, facebookUrl: resolvedFb, instagramUrl: resolvedIg });

                  return (
                    <tr
                      key={lead._id}
                      className={`transition-colors ${
                        selection.has(lead._id) ? 'bg-indigo-50/70' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="pl-4 pr-2 py-3">
                        <input
                          type="checkbox"
                          checked={selection.has(lead._id)}
                          onChange={() => toggleSelect(lead)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Business / Advertiser with Logo */}
                      <td className="px-3.5 py-3 min-w-[220px] max-w-[280px]">
                        <div className="flex items-center gap-2.5">
                          <AdvertiserLogo lead={lead} />
                          <div className="min-w-0 flex-1">
                            <button
                              onClick={() => openEdit(lead)}
                              className="font-bold text-slate-900 hover:text-indigo-600 text-left line-clamp-1 transition-colors text-xs"
                              title={bName}
                            >
                              {bName}
                            </button>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                              {lead.adArchiveId && <span className="font-mono">ID: {lead.adArchiveId}</span>}
                              {lead.adStartDate && <span>· {lead.adStartDate}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Social Pages (Facebook & Instagram) */}
                      <td className="px-3.5 py-3 max-w-[190px]">
                        <div className="space-y-1">
                          {resolvedFb ? (
                            <div>
                              <a
                                href={resolvedFb}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium truncate max-w-[170px] group"
                                title={`Open Facebook Page: ${resolvedFb}`}
                              >
                                <FacebookIcon className="w-3.5 h-3.5 shrink-0 drop-shadow-2xs group-hover:scale-105 transition-transform" />
                                <span className="truncate">{cleanFbHandle}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                              </a>
                            </div>
                          ) : !resolvedIg ? (
                            <span className="text-[11px] text-slate-300">—</span>
                          ) : null}

                          {resolvedIg && (
                            <div>
                              <a
                                href={resolvedIg}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-800 font-medium truncate max-w-[170px] group"
                                title={`Open Instagram Profile: ${resolvedIg}`}
                              >
                                <InstagramIcon className="w-3.5 h-3.5 shrink-0 drop-shadow-2xs group-hover:scale-105 transition-transform" />
                                <span className="truncate">{cleanIgHandle}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-pink-400 shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Enriched Contacts */}
                      <td className="px-3.5 py-3 max-w-[220px]">
                        <div className="space-y-0.5">
                          {eList.length > 0 ? (
                            <div className="flex items-center gap-1 text-xs text-emerald-700 font-mono">
                              <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[150px]" title={eList.join(', ')}>
                                {eList[0]}
                                {eList.length > 1 && ` (+${eList.length - 1})`}
                              </span>
                              <button
                                onClick={() => copyText(eList.join(', '), `e_${lead._id}`)}
                                title="Copy email"
                                className="text-slate-400 hover:text-emerald-700 transition-colors ml-0.5"
                              >
                                {copiedId === `e_${lead._id}` ? (
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-300">No email</span>
                          )}

                          {pList.length > 0 ? (
                            <div className="flex items-center gap-1.5 text-xs">
                              <a
                                href={`https://wa.me/${pList[0].replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium hover:underline truncate max-w-[160px] group/wa"
                                title={`Chat on WhatsApp: ${pList[0]}`}
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5 shrink-0 group-hover/wa:scale-110 transition-transform" />
                                <span className="truncate">{pList[0]}</span>
                                {pList.length > 1 && <span className="text-slate-400 text-[10px] font-sans">+{pList.length - 1}</span>}
                              </a>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyText(pList.join(', '), `p_${lead._id}`);
                                }}
                                title="Copy phone"
                                className="text-slate-400 hover:text-emerald-700 transition-colors ml-0.5"
                              >
                                {copiedId === `p_${lead._id}` ? (
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Website & CTA (with Direct Message) */}
                      <td className="px-3.5 py-3 min-w-[180px] max-w-[240px]">
                        <div className="space-y-1">
                          {/* 1. Website URL or Facebook Page Fallback */}
                          {siteInfo.url ? (
                            <a
                              href={siteInfo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors truncate max-w-[190px] ${
                                siteInfo.isWebsite
                                  ? 'text-indigo-600 hover:text-indigo-800'
                                  : 'text-blue-600 hover:text-blue-800'
                              }`}
                              title={siteInfo.isWebsite ? `Visit Website: ${siteInfo.url}` : `Open Facebook Page: ${siteInfo.url}`}
                            >
                              {siteInfo.isWebsite ? (
                                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              ) : siteInfo.isInstagram ? (
                                <InstagramIcon className="w-3.5 h-3.5 shrink-0" />
                              ) : (
                                <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span className="truncate">{siteInfo.display}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-300">—</span>
                          )}

                          {/* 2. CTA Badge (if present) */}
                          {lead.ctaText && (
                            <div className="flex items-center">
                              <span
                                className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[120px]"
                                title={`Ad CTA: ${lead.ctaText}`}
                              >
                                {lead.ctaText}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Country */}
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {cFlag}
                        </span>
                      </td>

                      {/* Meta Ad Library Link */}
                      <td className="px-3.5 py-3">
                        {aUrl ? (
                          <a
                            href={aUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700 transition-colors"
                          >
                            Ad Library <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-300">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {directMsg?.url && (
                            <a
                              href={directMsg.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={`Send Official Message on ${directMsg.type}: ${directMsg.url}`}
                              className={`inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full text-white text-xs font-semibold shadow-xs hover:shadow-md active:scale-95 transition-all group shrink-0 ${
                                directMsg.type === 'WhatsApp'
                                  ? 'bg-[#25D366] hover:bg-[#20bd5a]'
                                  : 'bg-gradient-to-r from-[#0084FF] to-[#006AFF] hover:from-[#0078ea] hover:to-[#005cd6]'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full bg-white grid place-items-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                                {directMsg.type === 'WhatsApp' ? (
                                  <WhatsAppIcon className="w-3.5 h-3.5" />
                                ) : (
                                  <MessengerIcon className="w-3.5 h-3.5" />
                                )}
                              </span>
                              <span className="tracking-tight">
                                {directMsg.type === 'WhatsApp' ? 'WhatsApp' : 'Message'}
                              </span>
                            </a>
                          )}
                          <button
                            type="button"
                            title={lead.isTargeted ? 'Targeted! (Click to remove from Target Niches)' : 'Target this Lead (Add to Target Niches)'}
                            onClick={(e) => {
                              e.stopPropagation();
                              targetMutation.mutate(lead._id);
                            }}
                            disabled={targetMutation.isPending}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              lead.isTargeted
                                ? 'text-violet-700 bg-violet-100 hover:bg-violet-200 border border-violet-300 ring-1 ring-violet-400/40 shadow-xs'
                                : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50 hover:border-violet-200 border border-transparent'
                            }`}
                          >
                            <Target className={`w-3.5 h-3.5 ${lead.isTargeted ? 'fill-violet-600 text-violet-700' : ''}`} />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => openEdit(lead)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => requestDeleteOne(lead)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-16 text-center text-sm text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
            Loading leads…
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-16 text-center">
            <Building2 className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No leads found</p>
            <p className="text-xs text-slate-400 mt-0.5">Run the Discovery Engine to scrape Meta Ad Library.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <label className="inline-flex items-center gap-2 cursor-pointer hover:text-indigo-600">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  ref={(el) => { if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected; }}
                  onChange={toggleSelectPage}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                {allOnPageSelected ? 'Clear page selection' : `Select page (${leads.length})`}
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {leads.map((lead) => (
                <JobCard
                  key={lead._id}
                  job={lead}
                  onEdit={openEdit}
                  onDelete={requestDeleteOne}
                  onToggleTarget={(j) => targetMutation.mutate(j._id)}
                  selectable
                  selected={selection.has(lead._id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </div>
          </div>
        )
      )}

      {/* ── Pagination & Rows-Per-Page ── */}
      <div className="bg-white border border-slate-200/80 rounded-xl px-3 sm:px-4 py-2.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1.5">
            <span>Rows:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border border-slate-200/80 rounded-lg px-2 py-0.5 bg-slate-50 font-bold text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-500">Showing <strong className="text-slate-700">{leads.length}</strong> of <strong className="text-slate-700">{data?.total || 0}</strong></span>
        </div>
        <Pagination
          page={data?.page || 1}
          pages={data?.pages || 1}
          total={data?.total || 0}
          limit={limit}
          onPageChange={(p) => { setPage(p); clearSelection(); }}
        />
      </div>

      {isFetching && !isLoading && (
        <p className="text-[11px] text-slate-400 text-center">Syncing real-time leads…</p>
      )}

      {/* ── Edit Modal ── */}
      {editing && (
        <Modal title={`Edit: ${editing.businessName || editing.title}`} onClose={() => setEditing(null)}>
          <form onSubmit={submitForm} className="space-y-3.5">
            {formError && (
              <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name</label>
                <input
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Page Name</label>
                <input
                  value={form.pageName}
                  onChange={(e) => setForm({ ...form, pageName: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook URL</label>
                <input
                  value={form.facebookUrl}
                  onChange={(e) => setForm({ ...form, facebookUrl: e.target.value, pageUrl: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram URL</label>
                <input
                  value={form.instagramUrl}
                  onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ad Archive ID</label>
                <input
                  value={form.adArchiveId}
                  onChange={(e) => setForm({ ...form, adArchiveId: e.target.value })}
                  placeholder="4625500784337964"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Started Date</label>
                <input
                  value={form.adStartDate}
                  onChange={(e) => setForm({ ...form, adStartDate: e.target.value })}
                  placeholder="Apr 15, 2026"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CTA</label>
                <input
                  value={form.ctaText}
                  onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                  placeholder="Order now"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  value={form.websiteUrl}
                  onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                  placeholder="https://example.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ad Library URL</label>
                <input
                  value={form.adLibraryUrl}
                  onChange={(e) => setForm({ ...form, adLibraryUrl: e.target.value })}
                  placeholder="https://facebook.com/ads/library/..."
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Verified Emails (comma separated)</label>
                <textarea
                  rows={2}
                  value={form.emails}
                  onChange={(e) => setForm({ ...form, emails: e.target.value })}
                  placeholder="info@example.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Verified Phones (comma separated)</label>
                <textarea
                  rows={2}
                  value={form.phones}
                  onChange={(e) => setForm({ ...form, phones: e.target.value })}
                  placeholder="+880 1711-xxxxxx"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className={inputCls}
                >
                  {COUNTRIES.filter((c) => c.code).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category / Keyword</label>
                <input
                  value={form.searchKeyword}
                  onChange={(e) => setForm({ ...form, searchKeyword: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ad Status</label>
                <select
                  value={form.adStatus}
                  onChange={(e) => setForm({ ...form, adStatus: e.target.value })}
                  className={inputCls}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="ALL">ALL</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Confirm Dialog ── */}
      {confirmDialog && (
        <ConfirmDialog
          open={!!confirmDialog}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmLabel={confirmDialog.confirmLabel}
          onConfirm={confirmDialog.run}
          onClose={() => setConfirmDialog(null)}
          loading={deleteMutation.isPending || bulkDeleteMutation.isPending}
        />
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading Leads…</div>}>
      <JobsContent />
    </Suspense>
  );
}


'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, ExternalLink, Pencil, Trash2, Loader2, X,
  Globe, Mail, Phone, List, LayoutGrid, Download, Building2,
  Copy, CheckCheck, Sparkles, Filter, ChevronDown, Users,
  ArrowRight, ShieldCheck, Check, RefreshCw, MessageCircle,
  Target, Layers, BookmarkCheck, ArrowUpRight, Send, AlertCircle,
  Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { jobsApi } from '../../../lib/api/jobs';
import { showSwal } from '../../../lib/swal';
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

export const OUTREACH_STATUS_OPTIONS = [
  {
    key: 'not_contacted',
    label: 'Not Contacted',
    badge: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
    dot: 'bg-slate-400',
  },
  {
    key: 'contacted',
    label: 'Contacted',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    dot: 'bg-blue-500',
  },
  {
    key: 'follow_up',
    label: 'Follow Up',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    dot: 'bg-amber-500',
  },
  {
    key: 'in_discussion',
    label: 'In Discussion',
    badge: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    dot: 'bg-purple-500',
  },
  {
    key: 'interested',
    label: 'Interested / Won',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    dot: 'bg-emerald-500',
  },
  {
    key: 'not_interested',
    label: 'Not Interested',
    badge: 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100',
    dot: 'bg-rose-500',
  },
];

function TargetNichesContent() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [contactFilter, setContactFilter] = useState('');
  const [outreachStatusFilter, setOutreachStatusFilter] = useState('');
  const [sort, setSort] = useState('');
  const [view, setView] = useState('table'); // 'table' | 'cards'
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Selection
  const [selection, setSelection] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);

  // Edit Lead Modal
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    businessName: '',
    searchKeyword: '',
    websiteUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    emails: '',
    phones: '',
    country: 'BD',
    outreachStatus: 'not_contacted',
  });
  const [editSaving, setEditSaving] = useState(false);

  const queryKey = useMemo(
    () => [
      'target-niches',
      {
        page,
        limit,
        search,
        country,
        category,
        contactFilter,
        outreachStatus: outreachStatusFilter,
        sort,
      },
    ],
    [page, limit, search, country, category, contactFilter, outreachStatusFilter, sort]
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      jobsApi.getAll({
        page,
        limit,
        search,
        country,
        category,
        hasEmail: contactFilter === 'hasEmail' || contactFilter === 'hasBoth' ? 'true' : '',
        hasPhone: contactFilter === 'hasPhone' || contactFilter === 'hasBoth' ? 'true' : '',
        outreachStatus: outreachStatusFilter,
        isTargeted: 'true',
        sort,
      }),
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  const leads = data?.data || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.pages || 1;

  const toast = (icon, title) =>
    showSwal({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
    });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['target-niches'] });
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    queryClient.invalidateQueries({ queryKey: ['job-stats'] });
    refetch();
  };

  // Toggle Target Mutation (removes lead from this view)
  const targetMutation = useMutation({
    mutationFn: (id) => jobsApi.toggleTarget(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['target-niches'] });
      queryClient.setQueriesData({ queryKey: ['target-niches'] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          total: Math.max(0, (old.total || 1) - 1),
          data: old.data.filter((l) => l._id !== id),
        };
      });
    },
    onSuccess: (res) => {
      toast('info', res?.message || 'Removed from Target Niches');
      invalidate();
    },
    onError: (err) => {
      toast('error', err.message || 'Failed to update target status');
      invalidate();
    },
  });

  // Bulk Untarget Mutation
  const bulkUntargetMutation = useMutation({
    mutationFn: (ids) => jobsApi.bulkTarget({ ids, isTargeted: false }),
    onSuccess: (res) => {
      toast('success', res?.message || 'Leads removed from Target Niches');
      setSelection(new Set());
      invalidate();
    },
    onError: (err) => {
      toast('error', err.message || 'Failed to update leads');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => jobsApi.deleteById(id),
    onSuccess: () => {
      toast('success', 'Lead deleted successfully');
      invalidate();
    },
    onError: (err) => {
      toast('error', err.message);
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => jobsApi.update(id, payload),
    onSuccess: () => {
      toast('success', 'Lead details updated');
      setEditing(null);
      invalidate();
    },
    onError: (err) => {
      toast('error', err.message);
    },
  });

  // Outreach Status Update Mutation (Inline Dropdown)
  const statusUpdateMutation = useMutation({
    mutationFn: ({ id, outreachStatus }) => jobsApi.updateOutreachStatus(id, outreachStatus),
    onMutate: async ({ id, outreachStatus }) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueriesData({ queryKey: ['target-niches'] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((lead) =>
            lead._id === id ? { ...lead, outreachStatus } : lead
          ),
        };
      });
    },
    onSuccess: (_, vars) => {
      const matched = OUTREACH_STATUS_OPTIONS.find((s) => s.key === vars.outreachStatus);
      toast('success', `Status: ${matched?.label || 'Updated'}`);
      invalidate();
    },
    onError: (err) => {
      toast('error', err.message || 'Failed to update status');
      invalidate();
    },
  });

  // Copy helper
  const copyText = (text, id) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Selection helpers
  const allOnPageSelected = leads.length > 0 && leads.every((j) => selection.has(j._id));
  const someOnPageSelected = leads.some((j) => selection.has(j._id));

  const toggleSelectPage = () => {
    setSelection((prev) => {
      const next = new Set(prev);
      const isAll = leads.every((j) => next.has(j._id));
      leads.forEach((j) => (isAll ? next.delete(j._id) : next.add(j._id)));
      return next;
    });
  };

  const toggleSelectOne = (lead) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(lead._id)) next.delete(lead._id);
      else next.add(lead._id);
      return next;
    });
  };

  // KPI Calculations
  const stats = useMemo(() => {
    let withEmail = 0;
    let withPhone = 0;
    let contactedCount = 0;
    let followUpCount = 0;
    let interestedCount = 0;
    const niches = new Set();

    leads.forEach((l) => {
      if (l.emails && l.emails.length > 0) withEmail++;
      if (l.phones && l.phones.length > 0) withPhone++;
      const ost = l.outreachStatus || 'not_contacted';
      if (ost === 'contacted' || ost === 'in_discussion') contactedCount++;
      if (ost === 'follow_up') followUpCount++;
      if (ost === 'interested') interestedCount++;
      if (l.category || l.searchKeyword) niches.add(l.category || l.searchKeyword);
    });

    return {
      withEmail,
      withPhone,
      contactedCount,
      followUpCount,
      interestedCount,
      nichesCount: niches.size,
      availableNiches: Array.from(niches),
    };
  }, [leads]);

  // Handle Export CSV
  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast('info', 'No leads to export');
      return;
    }

    const exportRows = selection.size > 0
      ? leads.filter((l) => selection.has(l._id))
      : leads;

    const headers = [
      'Advertiser',
      'Outreach Status',
      'Target Niche',
      'Country',
      'Emails',
      'Phones',
      'Website',
      'Facebook URL',
      'Instagram URL',
      'Ad Archive ID',
      'Targeted Date',
    ];

    const csvContent = [
      headers.join(','),
      ...exportRows.map((r) =>
        [
          `"${(r.businessName || '').replace(/"/g, '""')}"`,
          `"${r.outreachStatus || 'not_contacted'}"`,
          `"${(r.category || r.searchKeyword || '').replace(/"/g, '""')}"`,
          `"${r.country || 'BD'}"`,
          `"${(r.emails || []).join('; ')}"`,
          `"${(r.phones || []).join('; ')}"`,
          `"${(r.websiteUrl || '').replace(/"/g, '""')}"`,
          `"${(r.facebookUrl || '').replace(/"/g, '""')}"`,
          `"${(r.instagramUrl || '').replace(/"/g, '""')}"`,
          `"${r.adArchiveId || ''}"`,
          `"${r.targetedAt ? new Date(r.targetedAt).toLocaleDateString() : ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `target_niches_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast('success', `Exported ${exportRows.length} targeted lead(s)`);
  };

  // Open Edit Modal
  const openEdit = (lead) => {
    setEditing(lead);
    setEditForm({
      businessName: lead.businessName || lead.title || '',
      searchKeyword: lead.category || lead.searchKeyword || '',
      websiteUrl: lead.websiteUrl || '',
      facebookUrl: lead.facebookUrl || '',
      instagramUrl: lead.instagramUrl || '',
      emails: (lead.emails || []).join(', '),
      phones: (lead.phones || []).join(', '),
      country: lead.country || 'BD',
      outreachStatus: lead.outreachStatus || 'not_contacted',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setEditSaving(true);
    try {
      await updateMutation.mutateAsync({
        id: editing._id,
        payload: {
          ...editForm,
          emails: editForm.emails.split(',').map((s) => s.trim()).filter(Boolean),
          phones: editForm.phones.split(',').map((s) => s.trim()).filter(Boolean),
        },
      });
    } finally {
      setEditSaving(false);
    }
  };

  const requestDeleteOne = async (lead) => {
    const res = await showSwal({
      title: 'Delete this Lead?',
      text: `Are you sure you want to delete "${lead.businessName || 'this advertiser'}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete',
    });
    if (res?.isConfirmed) {
      deleteMutation.mutate(lead._id);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 container mx-auto px-3.5 sm:px-4 md:px-6 text-slate-800 pb-16 ">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-violet-600 text-white grid place-items-center shadow-xs shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Target Niches
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200/80">
                {totalCount} {totalCount === 1 ? 'Lead' : 'Leads'}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 truncate sm:whitespace-normal max-w-xl">
              Curated collection of advertisers targeted from Business Leads for high-conversion personalized outreach.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => invalidate()}
            disabled={isFetching}
            title="Refresh targeted leads"
            className="h-9 px-3 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="h-9 px-3 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/dashboard/jobs"
            className="col-span-2 sm:col-span-1 h-9 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer group"
          >
            <span>Browse Business Leads</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Targeted Prospects</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 sm:mt-1">
              {totalCount}
            </div>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-violet-50 text-violet-600 grid place-items-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Contacted Leads</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 sm:mt-1">
              {stats.contactedCount}
            </div>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 text-blue-600 grid place-items-center shrink-0">
            <Send className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Follow Up Needed</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 sm:mt-1">
              {stats.followUpCount}
            </div>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-50 text-amber-600 grid place-items-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Interested / Won</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 sm:mt-1">
              {stats.interestedCount}
            </div>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── Search, Filters & Controls Bar ── */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs space-y-2.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search targeted advertisers, domain, email, phone…"
              className="w-full bg-slate-50/70 border border-slate-200/80 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns (Responsive Grid on Mobile) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 w-full lg:w-auto">
            {/* Country Filter */}
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setPage(1);
              }}
              className="h-9 bg-slate-50/70 hover:bg-slate-100/60 border border-slate-200/80 rounded-lg px-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer w-full sm:w-auto"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.label}
                </option>
              ))}
            </select>

            {/* Outreach Status Filter */}
            <select
              value={outreachStatusFilter}
              onChange={(e) => {
                setOutreachStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 bg-slate-50/70 hover:bg-slate-100/60 border border-slate-200/80 rounded-lg px-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer w-full sm:w-auto"
            >
              <option value="">All Statuses</option>
              {OUTREACH_STATUS_OPTIONS.map((st) => (
                <option key={st.key} value={st.key}>
                  {st.label}
                </option>
              ))}
            </select>

            {/* Contact Status */}
            <select
              value={contactFilter}
              onChange={(e) => {
                setContactFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 bg-slate-50/70 hover:bg-slate-100/60 border border-slate-200/80 rounded-lg px-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer w-full sm:w-auto"
            >
              <option value="">All Contacts</option>
              <option value="hasEmail">Has Email</option>
              <option value="hasPhone">Has Phone</option>
              <option value="hasBoth">Has Both</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="h-9 bg-slate-50/70 hover:bg-slate-100/60 border border-slate-200/80 rounded-lg px-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer w-full sm:w-auto"
            >
              <option value="">Recently Targeted</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Advertiser A-Z</option>
            </select>

            {/* Rows per page & View switcher */}
            <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-start gap-1.5 w-full sm:w-auto">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="h-9 bg-slate-50/70 hover:bg-slate-100/60 border border-slate-200/80 rounded-lg px-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer flex-1 sm:flex-initial"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>

              {/* View Switcher */}
              <div className="flex items-center bg-slate-100/80 rounded-lg p-0.5 border border-slate-200/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setView('table')}
                  title="Table View"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    view === 'table' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setView('cards')}
                  title="Cards View"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    view === 'cards' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar (when rows are selected) */}
        {selection.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-violet-50/90 border border-violet-200 rounded-xl px-4 py-2.5 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-900">
              <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
              <span>{selection.size} lead(s) selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkUntargetMutation.mutate(Array.from(selection))}
                disabled={bulkUntargetMutation.isPending}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Remove from Target Niches
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-violet-200 bg-white text-xs font-semibold text-violet-700 hover:bg-violet-50 transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3" /> Export Selected
              </button>
              <button
                onClick={() => setSelection(new Set())}
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-white transition-colors cursor-pointer"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Table View / Cards View ── */}
      {view === 'table' ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          {/* Mobile horizontal swipe indicator */}
          <div className="md:hidden px-3.5 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              Swipe horizontally to view all columns
            </span>
            <span className="text-[10px] text-violet-600 font-bold tracking-wider uppercase">Scroll ↔</span>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead>
                <tr className="bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                  <th className="pl-4 pr-2 py-3 w-8">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={allOnPageSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected;
                      }}
                      onChange={toggleSelectPage}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-3.5 py-3 font-semibold text-slate-600">Advertiser</th>
                  <th className="px-3.5 py-3 font-semibold text-slate-600">Social Pages</th>
                  <th className="px-3.5 py-3 font-semibold text-slate-600">Enriched Contacts</th>
                  <th className="px-3.5 py-3 font-semibold text-slate-600">Website & CTA</th>
                  <th className="px-3.5 py-3 font-semibold text-slate-600">Outreach Status</th>
                  <th className="px-3.5 py-3 font-semibold text-right text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-20 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-600" />
                      Loading targeted leads…
                    </td>
                  </tr>
                )}

                {!isLoading && leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-20 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 grid place-items-center mx-auto mb-3 shadow-inner">
                        <Target className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        No Leads in Target Niches Yet
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        Go to Business Leads and click the{' '}
                        <span className="inline-flex items-center gap-1 font-semibold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-200">
                          <Target className="w-3 h-3" /> Target
                        </span>{' '}
                        button to focus on high-converting prospects.
                      </p>
                      <Link
                        href="/dashboard/jobs"
                        className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        <span>Browse Business Leads</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )}

                {leads.map((lead) => {
                  const name = lead.businessName || lead.title || 'Advertiser';
                  const emails = Array.isArray(lead.emails) ? lead.emails : [];
                  const phones = Array.isArray(lead.phones) ? lead.phones : [];
                  const cCode = String(lead.country || 'BD').toUpperCase();
                  const cFlag = COUNTRY_FLAGS[cCode] || cCode;
                  const niche = lead.category || lead.searchKeyword || 'E-commerce';
                  const {
                    facebookUrl,
                    instagramUrl,
                    facebookHandle,
                    instagramHandle,
                  } = resolveSocialUrls(lead);
                  const siteInfo = getDisplayWebsite({ ...lead, facebookUrl, instagramUrl });
                  const directMsg = getDirectMessageInfo({ ...lead, facebookUrl, instagramUrl });
                  const isAct = lead.adStatus === 'ACTIVE';
                  const targetedDate = lead.targetedAt
                    ? new Date(lead.targetedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : lead.createdAt
                    ? new Date(lead.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '';

                  return (
                    <tr
                      key={lead._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        selection.has(lead._id) ? 'bg-violet-50/50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="pl-4 pr-2 py-3">
                        <input
                          type="checkbox"
                          checked={selection.has(lead._id)}
                          onChange={() => toggleSelectOne(lead)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                        />
                      </td>

                      {/* Advertiser Column */}
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-2.5">
                          <AdvertiserLogo lead={lead} size="sm" />
                          <div className="min-w-0 max-w-[200px]">
                            <span
                              className="font-bold text-slate-900 truncate block hover:text-violet-600 cursor-pointer"
                              title={name}
                              onClick={() => openEdit(lead)}
                            >
                              {name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                              {lead.adArchiveId && (
                                <span title={`Ad Archive ID: ${lead.adArchiveId}`}>
                                  ID: {lead.adArchiveId}
                                </span>
                              )}
                              {targetedDate && (
                                <>
                                  <span>·</span>
                                  <span className="font-sans text-slate-400">{targetedDate}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Social Pages Column */}
                      <td className="px-3.5 py-3">
                        <div className="flex flex-col gap-1">
                          {facebookHandle && (
                            <a
                              href={formatFacebookUrl(facebookHandle)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium hover:underline text-[11px] group"
                              title={`Facebook: ${facebookHandle}`}
                            >
                              <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate max-w-[120px]">{facebookHandle}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                            </a>
                          )}
                          {instagramHandle && (
                            <a
                              href={formatInstagramUrl(instagramHandle)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 font-medium hover:underline text-[11px] group"
                              title={`Instagram: ${instagramHandle}`}
                            >
                              <InstagramIcon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate max-w-[120px]">{instagramHandle}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-pink-500" />
                            </a>
                          )}
                          {!facebookHandle && !instagramHandle && (
                            <span className="text-slate-300 italic text-[11px]">No page linked</span>
                          )}
                        </div>
                      </td>

                      {/* Enriched Contacts */}
                      <td className="px-3.5 py-3">
                        <div className="flex flex-col gap-1 text-[11px]">
                          {emails.length > 0 ? (
                            <div className="flex items-center gap-1.5 group/copy">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-slate-700 font-medium truncate max-w-[150px]" title={emails[0]}>
                                {emails[0]}
                              </span>
                              <button
                                onClick={() => copyText(emails[0], `email-${lead._id}`)}
                                title="Copy Email"
                                className="text-slate-400 hover:text-indigo-600 p-0.5 rounded cursor-pointer shrink-0"
                              >
                                {copiedId === `email-${lead._id}` ? (
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-300 italic text-[10px]">No email</span>
                          )}

                          {phones.length > 0 ? (
                            <div className="flex items-center gap-1.5 group/copy">
                              <a
                                href={`https://wa.me/${phones[0].replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium hover:underline truncate max-w-[160px] group/wa"
                                title={`Chat on WhatsApp: ${phones[0]}`}
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5 shrink-0 group-hover/wa:scale-110 transition-transform" />
                                <span className="truncate">{phones[0]}</span>
                              </a>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyText(phones[0], `phone-${lead._id}`);
                                }}
                                title="Copy Phone"
                                className="text-slate-400 hover:text-emerald-600 p-0.5 rounded cursor-pointer shrink-0"
                              >
                                {copiedId === `phone-${lead._id}` ? (
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-300 italic text-[10px]">No phone</span>
                          )}
                        </div>
                      </td>

                      {/* Website & CTA Column */}
                      <td className="px-3.5 py-3">
                        <div className="flex flex-col gap-1 max-w-[190px]">
                          {siteInfo.url ? (
                            <a
                              href={siteInfo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1.5 text-[11px] font-medium hover:underline truncate group/link ${
                                siteInfo.isWebsite
                                  ? 'text-indigo-600 hover:text-indigo-700'
                                  : 'text-blue-600 hover:text-blue-700'
                              }`}
                              title={siteInfo.isWebsite ? `Website: ${siteInfo.url}` : `Page: ${siteInfo.url}`}
                            >
                              {siteInfo.isWebsite ? (
                                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover/link:text-indigo-600 transition-colors" />
                              ) : (
                                <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span className="truncate">{siteInfo.display}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-40 group-hover/link:opacity-100 transition-opacity" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-300 italic">No link</span>
                          )}

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

                      {/* Outreach Status Dropdown Column */}
                      <td className="px-3.5 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block text-left">
                          {(() => {
                            const curKey = lead.outreachStatus || 'not_contacted';
                            const curSt = OUTREACH_STATUS_OPTIONS.find((s) => s.key === curKey) || OUTREACH_STATUS_OPTIONS[0];

                            return (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setActiveDropdownId(activeDropdownId === lead._id ? null : lead._id)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs ${
                                    curSt.badge
                                  }`}
                                  title="Click to change status"
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${curSt.dot} shrink-0`} />
                                  <span className="whitespace-nowrap">{curSt.label}</span>
                                  <ChevronDown className="w-3 h-3 opacity-40 ml-0.5" />
                                </button>

                                {activeDropdownId === lead._id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-40"
                                      onClick={() => setActiveDropdownId(null)}
                                    />
                                    <div className="absolute left-0 mt-1 w-44 rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-1 animate-in fade-in zoom-in-95">
                                      {OUTREACH_STATUS_OPTIONS.map((st) => {
                                        const isSelected = curKey === st.key;
                                        return (
                                          <button
                                            key={st.key}
                                            type="button"
                                            onClick={() => {
                                              statusUpdateMutation.mutate({ id: lead._id, outreachStatus: st.key });
                                              setActiveDropdownId(null);
                                            }}
                                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                              isSelected
                                                ? 'bg-slate-100 text-slate-900 font-semibold'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className={`w-2 h-2 rounded-full ${st.dot} shrink-0`} />
                                              <span>{st.label}</span>
                                            </div>
                                            {isSelected && (
                                              <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-3.5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
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
                            title="Remove from Target Niches"
                            onClick={(e) => {
                              e.stopPropagation();
                              targetMutation.mutate(lead._id);
                            }}
                            disabled={targetMutation.isPending}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 transition-all cursor-pointer"
                          >
                            <Target className="w-3.5 h-3.5" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <JobCard
              key={lead._id}
              job={lead}
              onEdit={openEdit}
              onDelete={requestDeleteOne}
              onToggleTarget={(j) => targetMutation.mutate(j._id)}
              selectable
              selected={selection.has(lead._id)}
              onToggleSelect={toggleSelectOne}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalCount}
            limit={limit}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* ── Edit Lead Modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Edit Targeted Lead</h3>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 sm:p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={editForm.businessName}
                  onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Niche / Category</label>
                <input
                  type="text"
                  value={editForm.searchKeyword}
                  onChange={(e) => setEditForm({ ...editForm, searchKeyword: e.target.value })}
                  placeholder="e.g. Fashion, Healthcare, Tech, Real Estate"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={editForm.websiteUrl}
                  onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Facebook URL</label>
                  <input
                    type="text"
                    value={editForm.facebookUrl}
                    onChange={(e) => setEditForm({ ...editForm, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/page"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={editForm.instagramUrl}
                    onChange={(e) => setEditForm({ ...editForm, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/handle"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emails (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.emails}
                  onChange={(e) => setEditForm({ ...editForm, emails: e.target.value })}
                  placeholder="contact@business.com, sales@business.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phones (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.phones}
                  onChange={(e) => setEditForm({ ...editForm, phones: e.target.value })}
                  placeholder="+8801700000000, +1234567890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Outreach Status</label>
                <select
                  value={editForm.outreachStatus}
                  onChange={(e) => setEditForm({ ...editForm, outreachStatus: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  {OUTREACH_STATUS_OPTIONS.map((st) => (
                    <option key={st.key} value={st.key}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {editSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TargetNichesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-600" />
          Loading Target Niches…
        </div>
      }
    >
      <TargetNichesContent />
    </Suspense>
  );
}

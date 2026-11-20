'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Users, Search, RefreshCw, CheckCircle2, XCircle, Clock, Ban, Trash2, ShieldCheck,
  ShieldAlert, ChevronLeft, ChevronRight, Phone, Landmark, Mail, X, Loader2,
  UserCheck, Calendar, Globe, LogIn, AlertTriangle, RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { adminApi } from '../../../lib/api/admin';

// ── Status presentation ────────────────────────────────────────
const STATUS_META = {
  pending:   { label: 'Pending',   icon: Clock,        badge: 'bg-amber-50 text-amber-700 border-amber-200',     dot: 'bg-amber-500',   card: 'from-amber-500 to-orange-500' },
  approved:  { label: 'Approved',  icon: CheckCircle2, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', card: 'from-emerald-500 to-teal-500' },
  rejected:  { label: 'Rejected',  icon: XCircle,      badge: 'bg-rose-50 text-rose-700 border-rose-200',         dot: 'bg-rose-500',    card: 'from-rose-500 to-pink-500' },
  suspended: { label: 'Suspended', icon: Ban,          badge: 'bg-slate-100 text-slate-600 border-slate-300',     dot: 'bg-slate-500',   card: 'from-slate-500 to-slate-700' },
};

const FILTER_TABS = [
  { id: '', label: 'All users' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'suspended', label: 'Suspended' },
];

const AVATAR_GRADIENTS = [
  'from-indigo-500 to-violet-500', 'from-sky-500 to-indigo-500', 'from-emerald-500 to-teal-500',
  'from-rose-500 to-orange-500', 'from-fuchsia-500 to-purple-500', 'from-amber-500 to-rose-500',
];

const gradientFor = (str = '') =>
  AVATAR_GRADIENTS[[...str].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_GRADIENTS.length];

const formatDate = (d) =>
  d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function timeAgo(d) {
  if (!d) return 'Never';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
  return formatDate(d).split(',')[0];
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-extrabold px-2.5 py-1 rounded-full border ${meta.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${status === 'pending' ? 'animate-pulse' : ''}`} />
      {meta.label}
    </span>
  );
}

function Avatar({ name = '?', size = 'w-9 h-9 text-sm' }) {
  return (
    <div className={`${size} rounded-xl bg-gradient-to-br ${gradientFor(name)} text-white font-black flex items-center justify-center shrink-0 shadow-sm`}>
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

// ── Row action buttons ─────────────────────────────────────────
function RowActions({ user, busy, onApprove, onReject, onSuspend, onDelete }) {
  const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border';
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {user.status === 'pending' && (
        <>
          <button disabled={busy} onClick={() => onApprove(user)}
            className={`${base} bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white shadow-sm`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
          </button>
          <button disabled={busy} onClick={() => onReject(user)}
            className={`${base} bg-white hover:bg-rose-50 border-rose-200 text-rose-600`}>
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
        </>
      )}
      {user.status === 'approved' && (
        <button disabled={busy} onClick={() => onSuspend(user)}
          className={`${base} bg-white hover:bg-amber-50 border-amber-200 text-amber-700`}>
          <Ban className="w-3.5 h-3.5" /> Suspend
        </button>
      )}
      {(user.status === 'rejected' || user.status === 'suspended') && (
        <button disabled={busy} onClick={() => onApprove(user)}
          className={`${base} bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700`}>
          <RotateCcw className="w-3.5 h-3.5" /> {user.status === 'suspended' ? 'Reactivate' : 'Approve'}
        </button>
      )}
      <button disabled={busy} onClick={() => onDelete(user)} title="Delete user"
        className={`${base} bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 px-2`}>
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────
export default function UsersPage() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const qc = useQueryClient();

  const [status, setStatus] = useState('pending');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detailUser, setDetailUser] = useState(null);
  const [action, setAction] = useState(null); // { type: 'reject'|'suspend'|'delete', user }
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState(null);

  // Debounce search box
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-users', status, search, page],
    queryFn: () => adminApi.getUsers({ status, search, page, limit: 15 }),
    enabled: isSuperAdmin,
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
  });

  const users = data?.data || [];
  const counts = data?.counts || { all: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 };
  const pages = data?.pages || 1;

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ['admin-users'] });
    qc.invalidateQueries({ queryKey: ['admin-user-stats'] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status: next, reason: why }) => adminApi.updateStatus(id, next, why),
    onSuccess: (res) => {
      setToast({ type: 'success', message: res.message });
      setAction(null);
      setReason('');
      setDetailUser((d) => (d && res.data && d._id === res.data._id ? res.data : d));
      refreshAll();
    },
    onError: (err) => setToast({ type: 'error', message: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: (res) => {
      setToast({ type: 'success', message: res.message });
      setAction(null);
      setDetailUser(null);
      refreshAll();
    },
    onError: (err) => setToast({ type: 'error', message: err.message }),
  });

  const busy = statusMutation.isPending || deleteMutation.isPending;

  const approve = (user) => statusMutation.mutate({ id: user._id, status: 'approved' });
  const openAction = (type) => (user) => { setReason(''); setAction({ type, user }); };

  const confirmAction = () => {
    if (!action) return;
    if (action.type === 'delete') deleteMutation.mutate(action.user._id);
    else statusMutation.mutate({
      id: action.user._id,
      status: action.type === 'reject' ? 'rejected' : 'suspended',
      reason,
    });
  };

  // ── Access guard ──────────────────────────────────────────
  if (authLoading) return null;
  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-4 bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7 text-rose-500" />
        </div>
        <h1 className="text-lg font-black text-slate-900">Super admin only</h1>
        <p className="text-sm text-slate-500">You do not have permission to manage users.</p>
      </div>
    );
  }

  const statCards = [
    { key: 'pending', value: counts.pending },
    { key: 'approved', value: counts.approved },
    { key: 'rejected', value: counts.rejected },
    { key: 'suspended', value: counts.suspended },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto py-1 text-slate-800">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Users className="w-4.5 h-4.5 text-white" />
            </span>
            User Management
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 sm:ml-[46px]">
            Review sign-ups and control who can access the platform. Only approved users can enter the dashboard.
          </p>
        </div>
        <button onClick={() => refetch()} id="refresh-users-btn"
          className="self-start sm:self-auto inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 px-3.5 py-2 rounded-xl transition-all cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} /> Refresh
        </button>
      </div>

      {/* ── Pending callout ──────────────────────────────── */}
      {counts.pending > 0 && status !== 'pending' && (
        <button onClick={() => { setStatus('pending'); setPage(1); }}
          className="w-full flex items-center gap-3 text-left bg-amber-50 border border-amber-200 hover:bg-amber-100/70 rounded-2xl px-4 py-3 transition-colors cursor-pointer">
          <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4 text-amber-600" />
          </span>
          <span className="text-xs font-semibold text-amber-800">
            <strong className="font-black">{counts.pending}</strong> user{counts.pending > 1 ? 's are' : ' is'} waiting for your approval — click to review.
          </span>
        </button>
      )}

      {/* ── Stat cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ key, value }) => {
          const meta = STATUS_META[key];
          const Icon = meta.icon;
          const active = status === key;
          return (
            <button key={key} onClick={() => { setStatus(active ? '' : key); setPage(1); }}
              className={`text-left rounded-2xl p-4 border transition-all cursor-pointer ${
                active ? `bg-gradient-to-br ${meta.card} text-white border-transparent shadow-lg` : 'bg-white border-slate-200/80 hover:border-indigo-200 hover:shadow-md'
              }`}>
              <div className="flex items-center justify-between">
                <p className={`text-[11px] font-extrabold uppercase tracking-wider ${active ? 'text-white/80' : 'text-slate-400'}`}>{meta.label}</p>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${active ? 'bg-white/20' : 'bg-slate-50'}`}>
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                </span>
              </div>
              <p className={`text-3xl font-black mt-2 tracking-tight ${active ? 'text-white' : 'text-slate-900'}`}>{value}</p>
            </button>
          );
        })}
      </div>

      {/* ── Filters ──────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 overflow-x-auto no-scrollbar">
          {FILTER_TABS.map((t) => {
            const count = t.id ? counts[t.id] : counts.all;
            const active = status === t.id;
            return (
              <button key={t.id || 'all'} onClick={() => { setStatus(t.id); setPage(1); }}
                className={`flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  active ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}>
                {t.label}
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200/70 text-slate-500'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-400 focus-within:bg-white transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input id="user-search" type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, phone or organization…"
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none" />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Users list ───────────────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading users…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Users className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-600">No users found</p>
            <p className="text-xs text-slate-400">
              {status === 'pending' ? 'No one is waiting for approval right now.' : 'Try a different filter or search term.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider bg-slate-50/70">
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-4 py-3.5">Contact</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Registered</th>
                    <th className="px-4 py-3.5">Last login</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <button onClick={() => setDetailUser(u)} className="flex items-center gap-3 text-left cursor-pointer group">
                          <Avatar name={u.name} />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{u.name}</p>
                            <p className="text-slate-500 truncate">{u.email}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 space-y-0.5">
                        <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" />{u.phone || <span className="text-slate-300">—</span>}</p>
                        <p className="flex items-center gap-1.5"><Landmark className="w-3 h-3 text-slate-400" />{u.organization || <span className="text-slate-300">—</span>}</p>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={u.status} /></td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        <p className="font-semibold text-slate-700">{timeAgo(u.createdAt)}</p>
                        <p className="text-[10.5px]">{formatDate(u.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{timeAgo(u.lastLoginAt)}</td>
                      <td className="px-5 py-3.5">
                        <RowActions user={u} busy={busy} onApprove={approve}
                          onReject={openAction('reject')} onSuspend={openAction('suspend')} onDelete={openAction('delete')} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <button onClick={() => setDetailUser(u)} className="flex items-center gap-3 text-left min-w-0">
                      <Avatar name={u.name} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                      </div>
                    </button>
                    <StatusBadge status={u.status} />
                  </div>
                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                    {u.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{u.phone}</span>}
                    {u.organization && <span className="flex items-center gap-1"><Landmark className="w-3 h-3" />{u.organization}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{timeAgo(u.createdAt)}</span>
                  </div>
                  <RowActions user={u} busy={busy} onApprove={approve}
                    onReject={openAction('reject')} onSuspend={openAction('suspend')} onDelete={openAction('delete')} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[11px] text-slate-400 font-medium">
                Showing <span className="font-bold text-slate-700">{users.length}</span> of{' '}
                <span className="font-bold text-slate-700">{data?.total || 0}</span> users
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <span className="text-xs font-bold text-slate-500 px-2">{page} / {pages}</span>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── User details drawer ──────────────────────────── */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setDetailUser(null)} />
          <aside className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900">User details</h2>
              <button onClick={() => setDetailUser(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar name={detailUser.name} size="w-14 h-14 text-xl" />
                <div className="min-w-0">
                  <p className="text-base font-black text-slate-900 truncate">{detailUser.name}</p>
                  <p className="text-xs text-slate-500 truncate">{detailUser.email}</p>
                  <div className="mt-2"><StatusBadge status={detailUser.status} /></div>
                </div>
              </div>

              {detailUser.statusReason && (
                <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-800">Reason:</strong> {detailUser.statusReason}</span>
                </div>
              )}

              <dl className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden text-xs">
                {[
                  { icon: Mail, label: 'Email', value: detailUser.email },
                  { icon: Phone, label: 'Phone', value: detailUser.phone || '—' },
                  { icon: Landmark, label: 'Organization', value: detailUser.organization || '—' },
                  { icon: Calendar, label: 'Registered', value: formatDate(detailUser.createdAt) },
                  { icon: Globe, label: 'Sign-up IP', value: detailUser.registeredIp || '—' },
                  { icon: LogIn, label: 'Last login', value: formatDate(detailUser.lastLoginAt) },
                  { icon: LogIn, label: 'Total logins', value: detailUser.loginCount ?? 0 },
                  { icon: ShieldCheck, label: 'Approved at', value: formatDate(detailUser.approvedAt) },
                  { icon: UserCheck, label: 'Approved by', value: detailUser.approvedBy?.name || '—' },
                  { icon: Clock, label: 'Status changed', value: formatDate(detailUser.statusChangedAt) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="flex items-center gap-2 text-slate-400 font-semibold"><Icon className="w-3.5 h-3.5" />{label}</dt>
                    <dd className="font-bold text-slate-800 text-right break-all">{value}</dd>
                  </div>
                ))}
              </dl>

              <RowActions user={detailUser} busy={busy}
                onApprove={approve} onReject={openAction('reject')}
                onSuspend={openAction('suspend')} onDelete={openAction('delete')} />
            </div>
          </aside>
        </div>
      )}

      {/* ── Confirm modal (reject / suspend / delete) ───── */}
      {action && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={() => !busy && setAction(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${action.type === 'suspend' ? 'bg-amber-50' : 'bg-rose-50'}`}>
                {action.type === 'delete' ? <Trash2 className="w-5 h-5 text-rose-500" /> :
                  action.type === 'suspend' ? <Ban className="w-5 h-5 text-amber-600" /> :
                  <XCircle className="w-5 h-5 text-rose-500" />}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {action.type === 'delete' && 'Delete this user?'}
                  {action.type === 'reject' && 'Reject this request?'}
                  {action.type === 'suspend' && 'Suspend this user?'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {action.type === 'delete' && <><strong className="text-slate-700">{action.user.name}</strong> and their account will be permanently removed. This cannot be undone.</>}
                  {action.type === 'reject' && <><strong className="text-slate-700">{action.user.name}</strong> will not be able to sign in. You can approve them again later.</>}
                  {action.type === 'suspend' && <><strong className="text-slate-700">{action.user.name}</strong> will lose access immediately, even if currently signed in.</>}
                </p>
              </div>
            </div>

            {action.type !== 'delete' && (
              <div>
                <label htmlFor="action-reason" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reason <span className="font-semibold text-slate-400">(optional, shown to the user)</span>
                </label>
                <textarea id="action-reason" rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Could not verify organization details"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none transition-all" />
              </div>
            )}

            <div className="flex justify-end gap-2.5">
              <button onClick={() => setAction(null)} disabled={busy}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
                Cancel
              </button>
              <button onClick={confirmAction} disabled={busy} id="confirm-action-btn"
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white rounded-xl transition-colors cursor-pointer disabled:opacity-60 ${
                  action.type === 'suspend' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}>
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {action.type === 'delete' ? 'Delete permanently' : action.type === 'reject' ? 'Reject request' : 'Suspend user'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[70] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold text-white max-w-sm ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`} role="status">
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

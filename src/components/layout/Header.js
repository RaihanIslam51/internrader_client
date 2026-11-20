'use client';

// components/layout/Header.js
import { useState } from 'react';
import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, ChevronRight, X, Plus, Menu, RotateCcw, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

const BREADCRUMBS = {
  '/dashboard': [{ label: 'Overview' }],
  '/dashboard/discover': [{ label: 'Overview', href: '/dashboard' }, { label: 'Discovery Engine' }],
  '/dashboard/organizations': [{ label: 'Overview', href: '/dashboard' }, { label: 'Target Niches' }],
  '/dashboard/jobs': [{ label: 'Overview', href: '/dashboard' }, { label: 'Business Leads' }],
  '/dashboard/scraping': [{ label: 'Overview', href: '/dashboard' }, { label: 'Scraping Reports' }],
  '/dashboard/users': [{ label: 'Overview', href: '/dashboard' }, { label: 'User Management' }],
  '/dashboard/settings': [{ label: 'Overview', href: '/dashboard' }, { label: 'Settings' }],
};

const PAGE_TITLES = {
  '/dashboard': 'Dashboard Overview',
  '/dashboard/discover': 'Discovery Engine',
  '/dashboard/organizations': 'Target Advertiser Niches',
  '/dashboard/jobs': 'Business Leads & Contacts',
  '/dashboard/scraping': 'Scraping Reports',
  '/dashboard/users': 'User Management',
  '/dashboard/settings': 'Settings',
};

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Scraping run finished', description: 'Meta Ad Library extraction completed with verified emails', time: '2m ago', read: false },
  { id: 2, title: 'New advertiser leads found', description: 'Business contacts enriched from destination websites', time: '15m ago', read: false },
  { id: 3, title: 'Engine active', description: 'Ready to query Meta Ad Library and enrich leads', time: '1h ago', read: true },
];

export default function Header({ onToggleMobileMenu = () => {}, onToggleSidebar = () => {}, sidebarCollapsed = false }) {
  const { user } = useAuth();
  const [isReloading, setIsReloading] = React.useState(false);
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);

  const baseRoute = Object.keys(PAGE_TITLES)
    .filter(k => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0] || '/dashboard';

  const title = PAGE_TITLES[baseRoute] || 'Dashboard';
  const breadcrumbs = BREADCRUMBS[baseRoute] || [{ label: 'Dashboard', href: '/dashboard' }];
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  const iconBtn =
    'flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0';

  return (
    <header className="h-14 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center px-4 sm:px-6 gap-2 sticky top-0 z-30">
      {/* Left — Hamburger + Sidebar Toggle + Breadcrumb */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onToggleMobileMenu}
          className={`lg:hidden ${iconBtn}`}
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar collapse/expand toggle */}
        <button
          id="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`hidden lg:flex ${iconBtn}`}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
        </button>

        <div className="hidden sm:block w-px h-5 bg-slate-200 mx-1.5" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[13px] overflow-x-auto whitespace-nowrap no-scrollbar" title={title}>
            {breadcrumbs.map((bc, i) => (
              <span key={i} className="flex items-center gap-1.5 shrink-0">
                {bc.href ? (
                  <Link href={bc.href} className="text-slate-400 hover:text-slate-700 transition-colors font-medium">{bc.label}</Link>
                ) : (
                  <span className="text-slate-900 font-semibold">{bc.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1.5">
        {/* Hard Reload Button */}
        <button
          id="hard-reload-btn"
          onClick={() => {
            setIsReloading(true);
            setTimeout(() => {
              window.location.href = window.location.href;
            }, 300);
          }}
          title="Hard Reload — Full project refresh"
          className={`hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] font-medium border transition-colors shrink-0 ${
            isReloading
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
          <span>{isReloading ? 'Reloading…' : 'Reload'}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className={`relative ${iconBtn}`}
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unread > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-11 z-20 w-80 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-900/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  <button onClick={() => setNotifOpen(false)} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100" aria-label="Close notifications">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {MOCK_NOTIFICATIONS.map(n => (
                    <div key={n.id} className={`px-4 py-3 ${!n.read ? 'bg-indigo-50/40' : ''}`}>
                      <div className="flex items-start gap-3">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-indigo-600' : 'bg-transparent'}`} />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.description}</p>
                          <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Add organization */}
        <Link
          href="/dashboard/organizations"
          className="hidden md:flex items-center gap-1.5 h-9 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          Add organization
        </Link>

        {/* Signed-in user (mobile — desktop shows it in the sidebar) */}
        {user && (
          <div
            className="lg:hidden w-8 h-8 ml-1 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold text-xs flex items-center justify-center shrink-0"
            title={user.name}
          >
            {(user.name || '?').trim().charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}

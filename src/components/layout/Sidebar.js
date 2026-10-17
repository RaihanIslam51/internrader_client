'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, Briefcase, Activity,
  Settings, Users, LogOut, X, Radar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { adminApi } from '../../lib/api/admin';

const MENU_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', group: 'Workspace' },
  { href: '/dashboard/discover', icon: Radar, label: 'Discovery Engine', group: 'Workspace' },
  { href: '/dashboard/companies', icon: Building2, label: 'Companies', group: 'Workspace' },
  { href: '/dashboard/jobs', icon: Briefcase, label: 'Jobs & Internships', group: 'Workspace' },
  { href: '/dashboard/scraping', icon: Activity, label: 'Scraping Reports', group: 'Workspace' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', group: 'Administration' },
  { href: '/dashboard/users', icon: Users, label: 'User Approvals', superAdminOnly: true, group: 'Administration' },
];

function SidebarContent({ isMobile, slim, pathname, groups, pendingCount, user, logout, onClose }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`h-14 flex items-center shrink-0 ${slim ? 'justify-center' : 'justify-between px-2'}`}>
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0" aria-label="CareerPulse dashboard">
          <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30">
            <Briefcase className="w-4 h-4" />
          </span>
          {!slim && (
            <span className="text-[15px] font-bold text-slate-900 tracking-tight whitespace-nowrap">CareerPulse</span>
          )}
        </Link>

        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto no-scrollbar mt-2 ${slim ? 'space-y-3' : 'space-y-5'}`} aria-label="Dashboard">
        {groups.map((group) => (
          <div key={group.name}>
            {!slim ? (
              <p className="px-3 mb-1.5 text-[11px] font-semibold text-slate-400 tracking-wide">{group.name}</p>
            ) : (
              <div className="mx-3 mb-2 border-t border-slate-100 first:hidden" />
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href);
                const showBadge = item.superAdminOnly && pendingCount > 0;

                if (slim) {
                  return (
                    <div key={item.href} className="relative group flex justify-center">
                      <Link
                        href={item.href}
                        aria-label={item.label}
                        className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                        {showBadge && (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                        )}
                      </Link>
                      {/* Tooltip */}
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <div className="bg-slate-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg">
                          {item.label}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={isMobile ? onClose : undefined}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-indigo-600" />}
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="truncate flex-1">{item.label}</span>
                    {showBadge && (
                      <span className="min-w-5 h-5 px-1.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center">
                        {pendingCount > 99 ? '99+' : pendingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Account */}
      <div className="pt-3 mt-3 border-t border-slate-100">
        {slim ? (
          <div className="relative group flex justify-center">
            <button
              onClick={logout}
              aria-label="Logout"
              className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <div className="bg-slate-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg">
                Logout
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-1.5 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
              {(user?.name || '?').trim().charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[13px] font-semibold text-slate-800 truncate">{user?.name || 'Account'}</p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.role === 'super_admin' ? 'Super Admin' : 'Member'}
              </p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              aria-label="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen = false, onClose = () => {}, collapsed = false }) {
  const pathname = usePathname();
  const { logout, isSuperAdmin, user } = useAuth();

  // Live count of users waiting for approval (super admin only)
  const { data: userStats } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: () => adminApi.getStats(),
    enabled: isSuperAdmin,
    refetchInterval: 30000,
    staleTime: 15000,
  });
  const pendingCount = userStats?.data?.pending || 0;

  const visibleItems = MENU_ITEMS.filter((item) => !item.superAdminOnly || isSuperAdmin);

  // Preserve order while grouping
  const groups = visibleItems.reduce((acc, item) => {
    const last = acc[acc.length - 1];
    if (last && last.name === item.group) last.items.push(item);
    else acc.push({ name: item.group, items: [item] });
    return acc;
  }, []);

  return (
    <>
      {/* Desktop Sidebar — width animates between collapsed (72px) and expanded (248px) */}
      <aside
        className={`hidden lg:flex shrink-0 flex-col bg-white border-r border-slate-200 h-screen sticky top-0 px-3 pb-3 text-slate-700 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[72px]' : 'w-[248px]'
        }`}
      >
        <SidebarContent
          isMobile={false}
          slim={collapsed}
          pathname={pathname}
          groups={groups}
          pendingCount={pendingCount}
          user={user}
          logout={logout}
          onClose={onClose}
        />
      </aside>

      {/* Mobile Overlay & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white flex flex-col h-full px-3 pb-3 text-slate-700 shadow-2xl z-10 overflow-y-auto">
            <SidebarContent
              isMobile={true}
              slim={false}
              pathname={pathname}
              groups={groups}
              pendingCount={pendingCount}
              user={user}
              logout={logout}
              onClose={onClose}
            />
          </aside>
        </div>
      )}
    </>
  );
}

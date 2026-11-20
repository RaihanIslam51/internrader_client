'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#6366F1', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899'];

export default function AnalyticsCharts({ analytics = {} }) {
  const {
    totalLeads = 0,
    withEmails = 0,
    withPhones = 0,
    countryBreakdown = [],
    keywordBreakdown = [],
  } = analytics;

  // Contact capture breakdown data
  const pieData = [
    { name: 'Emails Found', value: withEmails },
    { name: 'Phones Found', value: withPhones },
    {
      name: 'No Contacts',
      value: Math.max(0, totalLeads - Math.max(withEmails, withPhones)),
    },
  ].filter((d) => d.value > 0);

  // Country breakdown formatting
  const countryData = countryBreakdown.slice(0, 6).map((c) => ({
    country: c.country,
    leads: c.count,
  }));

  // Keyword breakdown formatting
  const keywordData = keywordBreakdown.slice(0, 6).map((k) => ({
    keyword: k.keyword,
    leads: k.count,
  }));

  if (totalLeads === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Chart 1: Leads by Country */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl shadow-black/20">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-4 w-4 text-indigo-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Top Countries by Leads
          </h4>
        </div>
        <div className="h-48 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="country" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#1E293B',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  color: '#F8FAFC',
                }}
              />
              <Bar dataKey="leads" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Contact Enrichment Breakdown */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl shadow-black/20">
        <div className="flex items-center space-x-2 mb-4">
          <PieIcon className="h-4 w-4 text-emerald-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Enrichment Distribution
          </h4>
        </div>
        <div className="h-48 w-full flex items-center justify-center">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#F8FAFC',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs text-slate-500">No contact data yet</span>
          )}
        </div>
        <div className="flex justify-center space-x-4 text-[10px] text-slate-400 mt-1">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>Emails</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Phones</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span>Pending</span>
          </span>
        </div>
      </div>

      {/* Chart 3: Leads by Niche Keyword */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl shadow-black/20">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-4 w-4 text-violet-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Leads by Keyword
          </h4>
        </div>
        <div className="h-48 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={keywordData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="keyword" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#1E293B',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  color: '#F8FAFC',
                }}
              />
              <Bar dataKey="leads" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

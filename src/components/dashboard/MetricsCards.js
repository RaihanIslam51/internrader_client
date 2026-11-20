'use client';

import React from 'react';
import {
  Users,
  Mail,
  Phone,
  Target,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function MetricsCards({ analytics = {}, isLoading = false }) {
  const {
    totalLeads = 0,
    withEmails = 0,
    withPhones = 0,
    emailRate = 0,
    phoneRate = 0,
  } = analytics;

  const cards = [
    {
      title: 'Total Discovered Leads',
      value: totalLeads.toLocaleString(),
      subtitle: 'From Meta Ad Library',
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Advertisers',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      title: 'Verified Business Emails',
      value: withEmails.toLocaleString(),
      subtitle: `${emailRate}% contact capture rate`,
      icon: Mail,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Public & Verified',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Direct Business Phones',
      value: withPhones.toLocaleString(),
      subtitle: `${phoneRate}% phone capture rate`,
      icon: Phone,
      color: 'from-violet-600 to-purple-600',
      badge: 'Normalized',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
    {
      title: 'Enrichment Quality',
      value: totalLeads > 0 ? `${Math.round(((withEmails + withPhones) / (totalLeads * 2)) * 100)}%` : '100%',
      subtitle: 'Zero fake contact guarantee',
      icon: ShieldCheck,
      color: 'from-amber-600 to-orange-600',
      badge: 'Cheerio Strict',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 hover:border-slate-700/80 transition-all duration-200 group shadow-lg shadow-black/20"
          >
            {/* Top gradient glow line */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-70 group-hover:opacity-100 transition`}
            />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">
                {card.title}
              </span>
              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md shadow-black/30`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-heading text-white">
                {isLoading ? (
                  <span className="inline-block w-16 h-7 bg-slate-800 animate-pulse rounded" />
                ) : (
                  card.value
                )}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center space-x-1">
                <span>{card.subtitle}</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${card.badgeColor}`}
              >
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

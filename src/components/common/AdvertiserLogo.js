'use client';

import { useState, useMemo } from 'react';

function getDomainFromUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const raw = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const parsed = new URL(raw);
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

export default function AdvertiserLogo({ lead, size = 'md' }) {
  const [profileImgError, setProfileImgError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const name = lead?.businessName || lead?.pageName || lead?.title || 'Advertiser';
  const profilePic = lead?.pageProfilePictureUrl || lead?.profilePictureUrl || '';
  const website = lead?.websiteUrl || lead?.applicationUrl || '';
  const domain = getDomainFromUrl(website);
  const isSocialDomain =
    domain.includes('facebook.com') ||
    domain.includes('instagram.com') ||
    domain.includes('fb.me') ||
    domain.includes('line.me');

  // Compute 2-letter uppercase brand initials
  const initials = useMemo(() => {
    const clean = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || 'AD';
  }, [name]);

  // Deterministic pastel color palette for brand avatar
  const colorCls = useMemo(() => {
    const palette = [
      'bg-indigo-50 text-indigo-700 border-indigo-200',
      'bg-blue-50 text-blue-700 border-blue-200',
      'bg-emerald-50 text-emerald-700 border-emerald-200',
      'bg-violet-50 text-violet-700 border-violet-200',
      'bg-rose-50 text-rose-700 border-rose-200',
      'bg-amber-50 text-amber-700 border-amber-200',
      'bg-teal-50 text-teal-700 border-teal-200',
      'bg-purple-50 text-purple-700 border-purple-200',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash << 5) - hash + name.charCodeAt(i);
    }
    return palette[Math.abs(hash) % palette.length];
  }, [name]);

  const sizeCls = size === 'lg' ? 'w-10 h-10 rounded-xl' : 'w-8 h-8 rounded-lg';
  const textCls = size === 'lg' ? 'text-xs' : 'text-[11px]';

  // 1. First priority: Direct authentic Meta Page avatar
  const hasMetaProfilePic = Boolean(profilePic && !profileImgError);

  // 2. Second priority: 128px high-res domain favicon
  const faviconUrl = !faviconError && domain && !isSocialDomain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    : null;

  return (
    <div className="relative shrink-0">
      {hasMetaProfilePic ? (
        <div className={`${sizeCls} bg-white border border-slate-200/90 shadow-2xs p-0.5 flex items-center justify-center overflow-hidden`}>
          <img
            src={profilePic}
            alt={name}
            onError={() => setProfileImgError(true)}
            className="w-full h-full object-cover rounded-[6px]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : faviconUrl ? (
        <div className={`${sizeCls} bg-white border border-slate-200/90 shadow-2xs p-1 flex items-center justify-center overflow-hidden`}>
          <img
            src={faviconUrl}
            alt={name}
            onError={() => setFaviconError(true)}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
      ) : (
        <div className={`${sizeCls} border flex items-center justify-center font-bold ${textCls} shadow-2xs select-none ${colorCls}`}>
          {initials}
        </div>
      )}
    </div>
  );
}

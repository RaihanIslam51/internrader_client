'use client';

import { useState } from 'react';
import AdvertiserLogo from '../common/AdvertiserLogo';
import {
  FacebookIcon,
  InstagramIcon,
  MessengerIcon,
  WhatsAppIcon,
} from '../common/SocialIcons';
import { resolveSocialUrls, getDisplayWebsite, getDirectMessageInfo } from '../../lib/social';
import {
  Building2, Globe, Mail, Phone, ExternalLink, Pencil, Trash2,
  Check, Copy, CheckCheck, Calendar, Radio, Share2, MessageCircle, Target
} from 'lucide-react';

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

export default function JobCard({
  job,
  onEdit,
  onDelete,
  onToggleTarget,
  selectable = false,
  selected = false,
  onToggleSelect,
}) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const businessName = job.businessName || job.title || 'Advertiser';
  const pageName = job.pageName || job.organizationName || businessName;
  const emails = Array.isArray(job.emails) ? job.emails : [];
  const phones = Array.isArray(job.phones) ? job.phones : [];
  const countryCode = String(job.country || 'BD').toUpperCase();
  const countryLabel = COUNTRY_FLAGS[countryCode] || countryCode;
  const category = job.category || job.searchKeyword || 'E-commerce';
  const websiteUrl = job.websiteUrl || job.applicationUrl || '';
  const adLibraryUrl = job.adLibraryUrl || job.circularUrl || '';
  const {
    facebookUrl,
    instagramUrl,
    facebookHandle,
    instagramHandle,
  } = resolveSocialUrls(job);
  const siteInfo = getDisplayWebsite({ ...job, facebookUrl, instagramUrl });
  const directMsg = getDirectMessageInfo({ ...job, facebookUrl, instagramUrl });
  const adArchiveId = job.adArchiveId || '';
  const adStartDate = job.adStartDate || '';
  const ctaText = job.ctaText || '';
  const adText = typeof job.adText === 'object' ? job.adText?.text || '' : String(job.adText || '');
  const platforms = Array.isArray(job.platforms) ? job.platforms : ['facebook'];
  const isActive = job.adStatus === 'ACTIVE';

  const handleCopyEmail = (e) => {
    e.stopPropagation();
    if (emails.length > 0) {
      navigator.clipboard?.writeText(emails.join(', '));
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyPhone = (e) => {
    e.stopPropagation();
    if (phones.length > 0) {
      navigator.clipboard?.writeText(phones.join(', '));
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <div
      className={`group relative flex flex-col bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
        selected ? 'border-indigo-400 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-200'
      }`}
    >
      {/* Meta Blue Accent Top Line */}
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400" />

      <div className="flex flex-col flex-1 p-5 pt-6">
        {/* Top Status & Library ID Header (Like Meta Ad Library Card) */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            {selectable && (
              <button
                type="button"
                onClick={() => onToggleSelect?.(job)}
                aria-label={selected ? 'Deselect lead' : 'Select lead'}
                className={`grid place-items-center w-4 h-4 rounded border transition-colors shrink-0 ${
                  selected
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-slate-300 text-transparent hover:border-indigo-400'
                }`}
              >
                <Check className="w-3 h-3" />
              </button>
            )}

            <span
              className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {isActive ? 'Active' : 'Inactive'}
            </span>

            {job.isTargeted && (
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border bg-violet-50 text-violet-700 border-violet-200 capitalize">
                {job.outreachStatus ? job.outreachStatus.replace(/_/g, ' ') : 'Targeted'}
              </span>
            )}

            {adArchiveId && (
              <span className="text-[11px] font-mono text-slate-400">
                ID: {adArchiveId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              title={job.isTargeted ? 'Remove from Target Niches' : 'Target this Lead (Add to Target Niches)'}
              onClick={(e) => {
                e.stopPropagation();
                onToggleTarget?.(job);
              }}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                job.isTargeted
                  ? 'text-violet-700 bg-violet-100 hover:bg-violet-200 border border-violet-300'
                  : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50'
              }`}
            >
              <Target className={`w-3.5 h-3.5 ${job.isTargeted ? 'fill-violet-600 text-violet-700' : ''}`} />
            </button>
            <button
              title="Edit lead"
              onClick={() => onEdit?.(job)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              title="Delete lead"
              onClick={() => onDelete?.(job)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Date & Platforms */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{adStartDate ? `Started running on ${adStartDate}` : 'Active Campaign'}</span>
          </div>

          {/* Platform icons */}
          <div className="flex items-center gap-1">
            {platforms.includes('facebook') && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white grid place-items-center text-[9px] font-bold" title="Facebook">
                f
              </span>
            )}
            {platforms.includes('instagram') && (
              <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white grid place-items-center text-[9px] font-bold" title="Instagram">
                ig
              </span>
            )}
            {platforms.includes('messenger') && (
              <span className="w-4 h-4 rounded-full bg-sky-500 text-white grid place-items-center text-[8px] font-bold" title="Messenger">
                ⚡
              </span>
            )}
          </div>
        </div>

        {/* Advertiser Profile Information */}
        <div className="mt-3.5 flex items-start gap-3">
          <AdvertiserLogo lead={job} size="lg" />

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 hover:text-indigo-600 transition-colors">
              {businessName}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Sponsored</p>
          </div>

          {/* CTA Badge */}
          {ctaText && (
            <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              {ctaText}
            </span>
          )}
        </div>

        {/* Social Profile Links (Facebook & Instagram) */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {facebookUrl && (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={`Open Facebook: ${facebookUrl}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors group"
            >
              <FacebookIcon className="w-3.5 h-3.5 shrink-0 group-hover:scale-105 transition-transform" />
              <span>{facebookHandle || 'Facebook'}</span>
              <ExternalLink className="w-3 h-3 text-blue-400" />
            </a>
          )}

          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={`Open Instagram: ${instagramUrl}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold transition-colors group"
            >
              <InstagramIcon className="w-3.5 h-3.5 shrink-0 group-hover:scale-105 transition-transform" />
              <span>{instagramHandle || 'Instagram'}</span>
              <ExternalLink className="w-3 h-3 text-pink-400" />
            </a>
          )}

          <span className="ml-auto inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {countryLabel}
          </span>
        </div>

        {/* Ad Copy / Text Snippet (if available) */}
        {adText && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {adText}
          </div>
        )}

        {/* Verified Enriched Contact Details */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          {/* Email */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 text-xs">
              <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {emails.length > 0 ? (
                <span className="font-mono text-emerald-700 font-medium truncate" title={emails.join(', ')}>
                  {emails[0]}
                  {emails.length > 1 && ` (+${emails.length - 1})`}
                </span>
              ) : (
                <span className="text-slate-400 italic">No email discovered</span>
              )}
            </div>
            {emails.length > 0 && (
              <button
                type="button"
                onClick={handleCopyEmail}
                title="Copy emails"
                className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 shrink-0 flex items-center gap-1"
              >
                {copiedEmail ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedEmail ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
            <div className="flex items-center gap-1.5 min-w-0 text-xs">
              {phones.length > 0 ? (
                <a
                  href={`https://wa.me/${phones[0].replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-medium hover:underline truncate group/wa"
                  title={`Chat on WhatsApp: ${phones.join(', ')}`}
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 shrink-0 group-hover/wa:scale-110 transition-transform" />
                  <span className="font-mono truncate">{phones[0]}</span>
                  {phones.length > 1 && <span className="text-slate-400 text-[10px] font-sans">(+{phones.length - 1})</span>}
                </a>
              ) : (
                <>
                  <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span className="text-slate-400 italic">No phone discovered</span>
                </>
              )}
            </div>
            {phones.length > 0 && (
              <button
                type="button"
                onClick={handleCopyPhone}
                title="Copy phones"
                className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 shrink-0 flex items-center gap-1"
              >
                {copiedPhone ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedPhone ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
        </div>

        {/* Website Destination / Fallback Link */}
        <div className="mt-3 pt-2 flex items-center justify-between text-xs text-slate-600 gap-2">
          <span className="text-slate-400 shrink-0">Destination:</span>
          {siteInfo.url ? (
            <a
              href={siteInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`font-medium flex items-center gap-1 truncate max-w-[200px] ${
                siteInfo.isWebsite ? 'text-indigo-600 hover:text-indigo-800' : 'text-blue-600 hover:text-blue-800'
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
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          ) : (
            <span className="text-slate-400 italic">In-app lead</span>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          {adLibraryUrl ? (
            <a
              href={adLibraryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              See ad details <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          ) : null}

          {directMsg?.url ? (
            <a
              href={directMsg.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-colors group ${
                directMsg.type === 'WhatsApp'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              title={`Send Direct Message on ${directMsg.type}: ${directMsg.url}`}
            >
              {directMsg.type === 'WhatsApp' ? (
                <WhatsAppIcon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              ) : (
                <MessengerIcon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              )}
              <span>{directMsg.type === 'WhatsApp' ? 'WhatsApp' : 'Direct Message'}</span>
            </a>
          ) : siteInfo.url ? (
            <a
              href={siteInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors"
            >
              Visit {siteInfo.isWebsite ? 'Website' : 'Page'} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

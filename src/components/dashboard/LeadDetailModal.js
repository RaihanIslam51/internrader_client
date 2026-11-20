'use client';

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Share2,
  Calendar,
  Layers,
  MapPin,
  Save,
  Edit2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { leadsApi } from '../../lib/api/leads';

export default function LeadDetailModal({ lead, isOpen, onClose, onLeadUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [businessName, setBusinessName] = useState(lead?.businessName || '');
  const [websiteUrl, setWebsiteUrl] = useState(lead?.websiteUrl || '');
  const [emailsText, setEmailsText] = useState((lead?.emails || []).join(', '));
  const [phonesText, setPhonesText] = useState((lead?.phones || []).join(', '));
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !lead) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await leadsApi.update(lead._id, {
        businessName,
        websiteUrl,
        emails: emailsText.split(',').map((s) => s.trim()).filter(Boolean),
        phones: phonesText.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setIsEditing(false);
      if (onLeadUpdated) onLeadUpdated(updated.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-heading">
                {lead.businessName}
              </h3>
              <p className="text-xs text-slate-400">
                Lead ID: <span className="font-mono text-slate-300">{lead._id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center space-x-1.5 transition"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Lead</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Verified Emails (Comma-separated)
                </label>
                <input
                  type="text"
                  value={emailsText}
                  onChange={(e) => setEmailsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="contact@company.com, info@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Verified Phones (Comma-separated)
                </label>
                <input
                  type="text"
                  value={phonesText}
                  onChange={(e) => setPhonesText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="+15551234567, +442079460958"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center space-x-1.5 transition"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Meta Ad & Social Info Card */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Meta Ad Library & Page Reference
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Status: {lead.adStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Advertiser / Page:</span>
                    <a
                      href={lead.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline font-medium inline-flex items-center space-x-1"
                    >
                      <span>{lead.pageName}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px] block">Ad Library Snapshot:</span>
                    <a
                      href={lead.adLibraryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline font-medium inline-flex items-center space-x-1"
                    >
                      <span>View Active Ads</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Destination Website & Enrichment Status */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Enriched Business Destination
                </span>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Official Website:</span>
                    {lead.websiteUrl ? (
                      <a
                        href={lead.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-indigo-400 font-mono text-xs flex items-center space-x-1.5"
                      >
                        <span>{lead.websiteUrl}</span>
                        <ExternalLink className="h-3 w-3 text-slate-500" />
                      </a>
                    ) : (
                      <span className="text-slate-500">Not provided</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[11px] block">Clean Domain:</span>
                    <span className="font-mono text-slate-300 font-semibold">
                      {lead.normalizedDomain || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Extracted Public Business Contacts
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span>Cheerio Validated</span>
                  </span>
                </div>

                {/* Emails */}
                <div>
                  <span className="text-slate-500 text-[11px] flex items-center space-x-1 mb-1.5">
                    <Mail className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Business Email Addresses:</span>
                  </span>
                  {lead.emails && lead.emails.length > 0 ? (
                    <div className="space-y-1.5">
                      {lead.emails.map((email, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800"
                        >
                          <span className="font-mono text-emerald-300 text-xs">{email}</span>
                          {lead.emailSource && (
                            <span className="text-[10px] text-slate-500 truncate max-w-[200px]" title={lead.emailSource}>
                              Source: {lead.emailSource}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600 text-xs italic">
                      No email addresses detected on homepage or contact pages.
                    </p>
                  )}
                </div>

                {/* Phones */}
                <div>
                  <span className="text-slate-500 text-[11px] flex items-center space-x-1 mb-1.5">
                    <Phone className="h-3.5 w-3.5 text-violet-400" />
                    <span>Direct Phone Numbers:</span>
                  </span>
                  {lead.phones && lead.phones.length > 0 ? (
                    <div className="space-y-1.5">
                      {lead.phones.map((phone, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800"
                        >
                          <span className="font-mono text-violet-300 text-xs">{phone}</span>
                          {lead.phoneSource && (
                            <span className="text-[10px] text-slate-500 truncate max-w-[200px]" title={lead.phoneSource}>
                              Source: {lead.phoneSource}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600 text-xs italic">
                      No phone numbers detected on homepage or contact pages.
                    </p>
                  )}
                </div>
              </div>

              {/* Metadata footer */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 pt-1">
                <div>
                  <span className="block text-slate-600">Niche Keyword:</span>
                  <span className="text-slate-300">{lead.searchKeyword}</span>
                </div>
                <div>
                  <span className="block text-slate-600">Country:</span>
                  <span className="text-slate-300">{lead.country}</span>
                </div>
                <div>
                  <span className="block text-slate-600">Captured At:</span>
                  <span className="text-slate-300">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

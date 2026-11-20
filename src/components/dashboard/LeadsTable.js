'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  ExternalLink,
  Mail,
  Phone,
  Trash2,
  Edit,
  Eye,
  Download,
  CheckSquare,
  Square,
  Sparkles,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Globe,
  FileSpreadsheet,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { leadsApi } from '../../lib/api/leads';

export default function LeadsTable({
  leads = [],
  pagination = {},
  filters = {},
  onFilterChange,
  onRefresh,
  onViewLead,
  onEditLead,
  isLoading = false,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [copiedText, setCopiedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const { page = 1, limit = 25, total = 0, pages = 1 } = pagination;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l._id));
    }
  };

  const toggleSelectLead = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSingle = async (id, name) => {
    if (!confirm(`Are you sure you want to delete lead "${name}"?`)) return;
    try {
      await leadsApi.delete(id);
      setSelectedIds(selectedIds.filter((item) => item !== id));
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected lead(s)?`)) return;
    setIsDeleting(true);
    try {
      await leadsApi.bulkDelete(selectedIds);
      setSelectedIds([]);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportSelected = (type) => {
    if (selectedIds.length === 0) {
      alert('Please select at least one lead to export.');
      return;
    }
    const url = leadsApi.getExportUrl(type, { ids: selectedIds.join(',') });
    window.open(url, '_blank');
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl shadow-black/30 overflow-hidden">
      {/* Search and Filters Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value, page: 1 })}
              placeholder="Search by business name, domain, email, phone..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Export & Bulk Actions */}
          <div className="flex items-center space-x-2">
            {selectedIds.length > 0 && (
              <div className="flex items-center space-x-2 bg-indigo-950/60 border border-indigo-800/80 px-3 py-1 rounded-xl text-xs">
                <span className="font-semibold text-indigo-300">
                  {selectedIds.length} Selected
                </span>
                <div className="h-4 w-px bg-indigo-800" />
                <button
                  onClick={() => handleExportSelected('csv')}
                  className="text-xs text-indigo-200 hover:text-white flex items-center space-x-1"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExportSelected('excel')}
                  className="text-xs text-indigo-200 hover:text-white flex items-center space-x-1"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1 ml-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}

            {/* General Export All Filtered Leads */}
            <div className="flex items-center space-x-1.5">
              <a
                href={leadsApi.getExportUrl('csv', filters)}
                download
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition"
                title="Export all matching leads as CSV"
              >
                <Download className="h-3.5 w-3.5 text-blue-400" />
                <span className="hidden sm:inline">Export CSV</span>
              </a>
              <a
                href={leadsApi.getExportUrl('excel', filters)}
                download
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition"
                title="Export all matching leads as Excel XLSX"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export Excel</span>
              </a>
            </div>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 text-[11px] font-medium mr-1 flex items-center space-x-1">
            <Filter className="h-3 w-3" />
            <span>Filters:</span>
          </span>

          {/* Has Email filter */}
          <button
            onClick={() =>
              onFilterChange({
                ...filters,
                hasEmail: filters.hasEmail === 'true' ? '' : 'true',
                page: 1,
              })
            }
            className={`px-3 py-1 rounded-full border transition flex items-center space-x-1 ${
              filters.hasEmail === 'true'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Mail className="h-3 w-3" />
            <span>Has Email</span>
          </button>

          {/* Has Phone filter */}
          <button
            onClick={() =>
              onFilterChange({
                ...filters,
                hasPhone: filters.hasPhone === 'true' ? '' : 'true',
                page: 1,
              })
            }
            className={`px-3 py-1 rounded-full border transition flex items-center space-x-1 ${
              filters.hasPhone === 'true'
                ? 'bg-violet-500/20 border-violet-500/50 text-violet-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Phone className="h-3 w-3" />
            <span>Has Phone</span>
          </button>

          {/* Ad Status filter */}
          <select
            value={filters.adStatus || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, adStatus: e.target.value, page: 1 })}
            className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Ad Statuses</option>
            <option value="ACTIVE">Active Ads</option>
            <option value="INACTIVE">Inactive Ads</option>
          </select>

          {/* Clear Filters */}
          {(filters.search || filters.hasEmail || filters.hasPhone || (filters.adStatus && filters.adStatus !== 'ALL') || filters.country) && (
            <button
              onClick={() => onFilterChange({ page: 1, limit: 25 })}
              className="text-xs text-rose-400 hover:text-rose-300 underline ml-2"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-xs text-slate-400">
            Showing <span className="font-semibold text-white">{leads.length}</span> of{' '}
            <span className="font-semibold text-white">{total}</span> leads
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="p-4 w-10">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-slate-400 hover:text-white"
                >
                  {selectedIds.length > 0 && selectedIds.length === leads.length ? (
                    <CheckSquare className="h-4 w-4 text-indigo-400" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-4">Business & Advertiser</th>
              <th className="py-3 px-4">Destination Website</th>
              <th className="py-3 px-4">Verified Emails</th>
              <th className="py-3 px-4">Verified Phones</th>
              <th className="py-3 px-4">Ad Snapshot</th>
              <th className="py-3 px-4">Niche / Country</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading leads...</span>
                  </div>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Globe className="h-8 w-8 text-slate-600 mb-1" />
                    <span className="text-sm font-medium text-slate-400">
                      No matching leads found
                    </span>
                    <p className="text-xs max-w-sm text-slate-500">
                      Try adjusting search filters, or click "Launch Lead Collection" in the
                      console above to scrape fresh advertisers.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedIds.includes(lead._id);
                return (
                  <tr
                    key={lead._id}
                    className={`hover:bg-slate-800/40 transition group ${
                      isSelected ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => toggleSelectLead(lead._id)}
                        className="text-slate-400 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-indigo-400" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>

                    {/* Business & Page Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-sm group-hover:text-indigo-300 transition">
                        {lead.businessName}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <a
                          href={lead.pageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-400 hover:underline flex items-center space-x-0.5"
                        >
                          <span>{lead.pageName}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </td>

                    {/* Destination Website */}
                    <td className="py-3.5 px-4">
                      {lead.websiteUrl ? (
                        <div className="flex flex-col">
                          <a
                            href={lead.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-slate-200 hover:text-indigo-400 flex items-center space-x-1"
                          >
                            <span>{lead.normalizedDomain || lead.websiteUrl}</span>
                            <ExternalLink className="h-3 w-3 text-slate-500" />
                          </a>
                          <span className="text-[10px] text-slate-500">
                            Cheerio Enriched
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-[11px]">No website URL</span>
                      )}
                    </td>

                    {/* Emails */}
                    <td className="py-3.5 px-4">
                      {lead.emails && lead.emails.length > 0 ? (
                        <div className="flex flex-col gap-1 max-w-xs">
                          {lead.emails.slice(0, 2).map((email, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => copyToClipboard(email)}
                              title={lead.emailSource ? `Source: ${lead.emailSource} (Click to copy)` : 'Click to copy'}
                              className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono hover:bg-emerald-500/20 transition group/btn w-fit"
                            >
                              <Mail className="h-3 w-3 text-emerald-400 shrink-0" />
                              <span className="truncate max-w-[140px]">{email}</span>
                              {copiedText === email ? (
                                <Check className="h-2.5 w-2.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-2.5 w-2.5 opacity-0 group-hover/btn:opacity-100 text-slate-400" />
                              )}
                            </button>
                          ))}
                          {lead.emails.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              +{lead.emails.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Phones */}
                    <td className="py-3.5 px-4">
                      {lead.phones && lead.phones.length > 0 ? (
                        <div className="flex flex-col gap-1 max-w-xs">
                          {lead.phones.slice(0, 2).map((phone, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => copyToClipboard(phone)}
                              title={lead.phoneSource ? `Source: ${lead.phoneSource} (Click to copy)` : 'Click to copy'}
                              className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/30 text-violet-300 text-[11px] font-mono hover:bg-violet-500/20 transition group/btn w-fit"
                            >
                              <Phone className="h-3 w-3 text-violet-400 shrink-0" />
                              <span>{phone}</span>
                              {copiedText === phone ? (
                                <Check className="h-2.5 w-2.5 text-violet-400" />
                              ) : (
                                <Copy className="h-2.5 w-2.5 opacity-0 group-hover/btn:opacity-100 text-slate-400" />
                              )}
                            </button>
                          ))}
                          {lead.phones.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              +{lead.phones.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Ad Library Snapshot URL */}
                    <td className="py-3.5 px-4">
                      <a
                        href={lead.adLibraryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/50 text-[11px] transition"
                      >
                        <span>Ad Snapshot</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </td>

                    {/* Niche / Country */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col space-y-1">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-medium w-fit">
                          {lead.searchKeyword}
                        </span>
                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-300">{lead.country}</span>
                          <span>•</span>
                          <span className={lead.adStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-400'}>
                            {lead.adStatus}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onViewLead(lead)}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                          title="View lead details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onEditLead(lead)}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                          title="Edit lead"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(lead._id, lead.businessName)}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition"
                          title="Delete lead"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
        <div>
          Page <span className="font-semibold text-white">{page}</span> of{' '}
          <span className="font-semibold text-white">{pages}</span> ({total} leads)
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onFilterChange({ ...filters, page: Math.max(1, page - 1) })}
            disabled={page <= 1}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, page: Math.min(pages, page + 1) })}
            disabled={page >= pages}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

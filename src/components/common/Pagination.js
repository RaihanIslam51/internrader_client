'use client';

// components/common/Pagination.js
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  pages,
  total,
  limit,
  onPageChange,
  currentPage,
  totalPages,
  totalItems,
}) {
  const curPage = page || currentPage || 1;
  const totPages = pages || totalPages || 1;
  const totItems = total || totalItems || 0;
  const perPage = limit || 20;

  if (!totPages || totPages <= 1) return null;

  const start = (curPage - 1) * perPage + 1;
  const end = Math.min(curPage * perPage, totItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
      <span className="text-xs text-slate-500 order-2 sm:order-1 font-medium">
        Showing <strong className="text-slate-800">{start}–{end}</strong> of <strong className="text-slate-800">{totItems}</strong> leads
      </span>
      <div className="flex items-center gap-1 order-1 sm:order-2 overflow-x-auto max-w-full py-0.5">
        <button
          onClick={() => onPageChange(curPage - 1)}
          disabled={curPage <= 1}
          aria-label="Previous page"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(totPages, 7) }, (_, i) => {
          const p = i + 1;
          const isAct = p === curPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                isAct
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(curPage + 1)}
          disabled={curPage >= totPages}
          aria-label="Next page"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

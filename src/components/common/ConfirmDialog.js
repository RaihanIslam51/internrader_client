'use client';

// components/common/ConfirmDialog.js
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  loading = false,
}) {
  const isVisible = isOpen !== undefined ? Boolean(isOpen) : (open !== undefined ? Boolean(open) : true);
  if (!isVisible) return null;

  const btnCls = confirmVariant === 'danger'
    ? 'bg-rose-600 hover:bg-rose-500 text-white'
    : 'bg-blue-600 hover:bg-blue-500 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/60">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${btnCls}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

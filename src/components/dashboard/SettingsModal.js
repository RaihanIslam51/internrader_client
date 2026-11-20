'use client';

import React, { useState, useEffect } from 'react';
import { X, KeyRound, Save, ShieldCheck, ExternalLink, HelpCircle } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const [metaToken, setMetaToken] = useState('');
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMetaToken(localStorage.getItem('meta_access_token') || '');
      setCustomApiUrl(localStorage.getItem('custom_api_url') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (metaToken.trim()) {
        localStorage.setItem('meta_access_token', metaToken.trim());
      } else {
        localStorage.removeItem('meta_access_token');
      }

      if (customApiUrl.trim()) {
        localStorage.setItem('custom_api_url', customApiUrl.trim());
      } else {
        localStorage.removeItem('custom_api_url');
      }
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-heading">
                Meta Ad Library API & Engine Settings
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure your Meta Graph API Token & Scraper Preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs text-slate-300">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-slate-300 flex items-center space-x-1">
                <span>Meta Graph API Access Token</span>
              </label>
              <a
                href="https://developers.facebook.com/tools/explorer/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-indigo-400 hover:underline flex items-center space-x-0.5"
              >
                <span>Get Token</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
            <textarea
              rows={3}
              value={metaToken}
              onChange={(e) => setMetaToken(e.target.value)}
              placeholder="Paste EAAB... Meta user access token here"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Token is stored locally in your browser and passed securely to the scraper. If left
              blank, the scraper uses the permitted industry directory generator with live business
              websites.
            </p>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              Backend API Server URL (Optional Override)
            </label>
            <input
              type="text"
              value={customApiUrl}
              onChange={(e) => setCustomApiUrl(e.target.value)}
              placeholder="http://localhost:5000/api"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Default: <code className="text-slate-400">http://localhost:5000/api</code>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Compliance & Safety Guarantee:</span>
            </div>
            <p>
              This application strictly respects Meta platform guidelines and does not bypass Meta
              security controls. Contact enrichment is performed solely on public destination business
              websites using Cheerio HTML extraction.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center space-x-1.5 transition"
            >
              <Save className="h-4 w-4" />
              <span>{isSaved ? 'Saved Successfully!' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

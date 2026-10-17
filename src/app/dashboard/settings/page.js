'use client';

import { useState } from 'react';
import { Terminal, Shield, Database, Info } from 'lucide-react';

const TABS = ['General', 'Scraper', 'Database'];

function Section({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, description, children }) {
  return (
    <div className="flex items-start justify-between gap-8">
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-800">{label}</p>
        {description && <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0 text-xs font-semibold text-slate-700">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');

  return (
    <div className="space-y-5 max-w-3xl py-2 text-slate-800">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Platform information and how the local scraper works.</p>
      </div>

      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'General' && (
        <Section title="Application">
          <Field label="Application" description="Display name for the dashboard">CareerPulse</Field>
          <Field label="Purpose" description="What this platform does">Career-page job & internship scraping</Field>
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-600 font-medium">
              This dashboard manages companies, runs the discovery engine and reviews scraped jobs.
              The engine executes inside the API server process and is triggered manually from the
              Discovery Engine page — nothing is scheduled or run in the cloud.
            </p>
          </div>
        </Section>
      )}

      {activeTab === 'Scraper' && (
        <div className="space-y-4">
          <Section title="Running the engine">
            <p className="text-xs text-slate-600 leading-relaxed">
              The discovery engine lives in the API server under
              {' '}<code className="bg-slate-100 px-1 py-0.5 rounded">server/services/scraper/</code>. Open the
              {' '}<strong>Discovery Engine</strong> page, choose a scope, and press <em>Start engine</em> to run it.
              Progress streams back into the live log console.
            </p>
            <div className="bg-slate-900 rounded-xl p-4 text-[12px] font-mono text-slate-200 leading-relaxed overflow-x-auto">
              <p className="text-slate-500"># first time</p>
              <p>cd server &amp;&amp; npm install</p>
              <p>npx playwright install chromium</p>
              <p className="mt-2 text-slate-500"># then use the Discovery Engine page</p>
            </div>
            <Field label="Run scope" description="All active, a hand-picked selection, or companies queued via “Scrape now”">Discovery Engine → Scope</Field>
            <Field label="Live logs" description="Server-side run logs streamed to the dashboard">Discovery Engine → Live logs</Field>
          </Section>

          <Section title="Configuration">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <Shield className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                Engine tuning (timeouts, concurrency, robots.txt, headless mode) is read from
                {' '}<code className="text-amber-900 bg-amber-100 px-1 py-0.5 rounded">server/.env</code>.
              </p>
            </div>
          </Section>
        </div>
      )}

      {activeTab === 'Database' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <Shield className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800 mb-0.5">Managed via .env</p>
              <p className="text-xs text-amber-700 font-medium">MongoDB credentials and connection strings are set in
                {' '}<code className="text-amber-900 bg-amber-100 px-1 py-0.5 rounded">server/.env</code> and are not editable here.</p>
            </div>
          </div>
          <Section title="Collections">
            <Field label="Companies" description="Career pages being tracked"><Database className="w-3.5 h-3.5 inline text-slate-400" /> companies</Field>
            <Field label="Jobs" description="Scraped listings">jobs</Field>
            <Field label="Scraping logs" description="Run history">scrapinglogs</Field>
            <Field label="Scraper config" description="Per-company strategies & selectors">scraperconfigurations</Field>
          </Section>
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <Terminal className="w-3.5 h-3.5 mt-0.5" />
            <span>Starting the server also seeds/updates the super admin and keeps legacy indexes in sync.</span>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { SenderInfo } from '@/types/invoice';
import {
  Building2,
  Save,
  CheckCircle2,
  CreditCard,
  FileCheck,
  ShieldCheck,
  Landmark
} from 'lucide-react';

interface CompanyProfileViewProps {
  sender: SenderInfo;
  onUpdateSender: (sender: SenderInfo) => void;
}

export const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({
  sender,
  onUpdateSender
}) => {
  const [form, setForm] = useState<SenderInfo>(sender);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSender(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white">Company Profile & Settlement Details</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            These credentials and payment routing instructions are printed on all generated invoices.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile Updated!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Organization Card */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Organization & Tax Identifiers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Company Legal Name</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">GSTIN / Tax ID</label>
              <input
                type="text"
                value={form.gstin || ''}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="29ABCDE1234F1Z5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Billing Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Contact Phone</label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="+91 (080) 4123-8899"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Registered Office Address</label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Bank & Settlement Card */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Landmark className="w-4 h-4 text-emerald-400" />
            Settlement Bank Account Routing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 text-[11px]">Beneficiary Bank:</span>
              <div className="font-semibold text-white">HDFC Bank Ltd.</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 text-[11px]">Account Name:</span>
              <div className="font-semibold text-white">{form.company}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 text-[11px]">Account Number:</span>
              <div className="font-mono font-semibold text-white">50200084920192</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 text-[11px]">IFSC Code:</span>
              <div className="font-mono font-semibold text-white">HDFC0001234</div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

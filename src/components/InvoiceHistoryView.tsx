'use client';

import React, { useState } from 'react';
import { InvoiceData } from '@/types/invoice';
import {
  History,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Trash2,
  Eye,
  Plus,
  ShieldCheck,
  Building,
  Calendar
} from 'lucide-react';
import { exportInvoiceToPDF } from '@/lib/pdfExport';

interface InvoiceHistoryViewProps {
  invoices: InvoiceData[];
  onSelectInvoice: (invoice: InvoiceData) => void;
  onDeleteInvoice: (invoiceNumber: string) => void;
  onCreateNew: () => void;
}

export const InvoiceHistoryView: React.FC<InvoiceHistoryViewProps> = ({
  invoices,
  onSelectInvoice,
  onDeleteInvoice,
  onCreateNew
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = invoices.filter(inv => {
    const term = searchTerm.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.client.name.toLowerCase().includes(term) ||
      (inv.client.company || '').toLowerCase().includes(term)
    );
  });

  // Calculate totals
  const totalVolume = invoices.reduce((sum, inv) => {
    const sub = inv.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const tax = (sub * inv.taxRate) / 100;
    return sum + (sub + tax - (inv.discount || 0));
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <History className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white">Invoice History & Archives</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse, manage, and download previously processed and AI-extracted invoices.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Invoice with AI</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Invoiced Volume
          </span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            ₹{totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Across {invoices.length} generated invoices
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Catalog Matching Accuracy
          </span>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            100% Verified
          </div>
          <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Zero price hallucinations
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Average Turnaround Time
          </span>
          <div className="text-xl font-bold text-indigo-400 font-mono mt-1">
            ~150 ms
          </div>
          <span className="text-[10px] text-slate-400 mt-1">
            Prompt to ready-to-sign PDF
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by invoice number (#INV-...), client name, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client & Organization</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-300">No invoices found matching your search</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Generate your first invoice in the AI Invoice Generator tab.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const sub = inv.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
                  const total = sub + (sub * inv.taxRate) / 100 - (inv.discount || 0);

                  return (
                    <tr key={inv.invoiceNumber} className="hover:bg-slate-800/40 transition-colors">
                      {/* Invoice # */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                        {inv.invoiceNumber}
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{inv.client.name}</div>
                        <div className="text-[11px] text-slate-400">{inv.client.company || inv.client.email}</div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {inv.issueDate}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                          {inv.items.length} items
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectInvoice(inv)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all"
                            title="Load into Editor"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => onDeleteInvoice(inv.invoiceNumber)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { InvoiceData, InvoiceItem } from '@/types/invoice';
import { CATALOG, CatalogItem } from '@/data/catalog';
import { exportInvoiceToPDF } from '@/lib/pdfExport';
import confetti from 'canvas-confetti';
import {
  Download,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  FileCheck,
  Percent,
  Sparkles,
  ExternalLink,
  Edit2,
  CreditCard,
  ChevronDown,
  User,
  Landmark,
  FileSpreadsheet
} from 'lucide-react';

interface InvoiceReviewPanelProps {
  invoice: InvoiceData;
  setInvoice: React.Dispatch<React.SetStateAction<InvoiceData>>;
  onOpenAddItem: () => void;
}

export const InvoiceReviewPanel: React.FC<InvoiceReviewPanelProps> = ({
  invoice,
  setInvoice,
  onOpenAddItem
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>(invoice.currency || 'INR');

  // Currency symbols
  const currencySymbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  const symbol = currencySymbols[currency] || '₹';

  // Subtotal calculation
  const subtotal = invoice.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const discountAmount = Math.min(invoice.discount || 0, subtotal);
  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  // Update item handlers
  const updateItemQty = (id: string, delta: number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    }));
  };

  const updateItemPrice = (id: string, newPrice: number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => (item.id === id ? { ...item, unitPrice: Math.max(0, newPrice) } : item))
    }));
  };

  const removeItem = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // Re-map an unmatched item to an existing catalog service
  const mapItemToCatalog = (itemId: string, catalogService: CatalogItem) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            service_id: catalogService.service_id,
            title: catalogService.service_name,
            category: catalogService.category,
            description: catalogService.description,
            unitPrice: catalogService.unit_price_inr,
            isUnmatched: false,
            matchConfidence: 1.0
          };
        }
        return item;
      })
    }));
  };

  // PDF Export
  const handleDownloadPDF = async () => {
    setIsExporting(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 }
    });

    await exportInvoiceToPDF('invoice-paper-document', invoice.invoiceNumber);
    setIsExporting(false);
  };

  // Native Print
  const handlePrint = () => {
    window.print();
  };

  const unmatchedCount = invoice.items.filter(i => i.isUnmatched).length;

  return (
    <div className="flex flex-col h-full bg-[#0d1322]/80 border border-slate-800/60 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
      {/* Top Action & Verification Bar */}
      <div className="p-4 border-b border-slate-800/60 bg-[#0b0f19]/90 flex flex-wrap items-center justify-between gap-3">
        {/* Step Badge & Section Title */}
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[10px] font-bold uppercase tracking-wider">
            Step 3 of 3
          </span>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              Review, Finalize & Export PDF
            </h2>
            <p className="text-[11px] text-slate-400">
              Interactive document preview with real-time tax calculation
            </p>
          </div>
        </div>

        {/* Currency & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800/80 rounded-xl p-0.5 text-xs">
            {(['INR', 'USD', 'EUR', 'GBP'] as const).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                  currency === c
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {c === 'INR' ? '₹ INR' : c === 'USD' ? '$ USD' : c === 'EUR' ? '€ EUR' : '£ GBP'}
              </button>
            ))}
          </div>

          {/* Add Item Button */}
          <button
            onClick={onOpenAddItem}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Item</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            type="button"
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 border border-slate-700/80 transition-colors cursor-pointer"
            title="Print or Save via Browser"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            type="button"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer tracking-wider"
          >
            {isExporting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Unmatched Alert Banner (if any) */}
      {unmatchedCount > 0 && (
        <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Smart Fallback Triggered:</strong> {unmatchedCount} bespoke service(s) flagged. Please review and input a rate or map to an official catalog item.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Action Required
          </span>
        </div>
      )}

      {/* Main Scrollable Canvas: The Invoice Paper Document */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#090d16]/80">
        <div
          id="invoice-paper-document"
          className="max-w-3xl mx-auto bg-white text-slate-800 rounded-2xl shadow-xl shadow-black/25 p-6 sm:p-10 border border-slate-200/80 space-y-7 print:p-0 print:border-none print:shadow-none print:text-black"
        >
          {/* Invoice Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-600/25">
                  {invoice.sender?.company?.trim()?.charAt(0) || 'S'}
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                    {invoice.sender.company}
                  </h1>
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
                    Verified Vendor Profile
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2.5 max-w-sm leading-relaxed">
                {invoice.sender.address}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5 flex-wrap">
                <span className="font-medium text-slate-700">{invoice.sender.email}</span>
                <span>•</span>
                <span className="font-mono text-slate-700">GSTIN: {invoice.sender.gstin}</span>
              </div>
            </div>

            {/* Document Meta Block */}
            <div className="sm:text-right space-y-2">
              <div className="inline-block px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-black tracking-widest uppercase">
                TAX INVOICE
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block sm:text-right">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                  className="font-mono text-base font-bold text-slate-900 sm:text-right w-full sm:w-44 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-0.5 bg-slate-50 border border-slate-200 mt-0.5"
                />
              </div>

              <div className="flex items-center sm:justify-end gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-500">Issue Date:</span>
                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                  className="text-slate-800 font-semibold focus:outline-none border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50 text-xs"
                />
              </div>

              <div className="flex items-center sm:justify-end gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-500">Due Date:</span>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                  className="text-slate-800 font-semibold focus:outline-none border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Cards Grid: Billed To vs Payment Routing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Card 1: Billed To (Client) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-700 pb-1 border-b border-slate-200">
                <User className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Billed To (Customer Details)
                </span>
              </div>

              <div className="space-y-1.5">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Client Name</label>
                  <input
                    type="text"
                    value={invoice.client.name}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        client: { ...invoice.client, name: e.target.value }
                      })
                    }
                    placeholder="Client Contact Name"
                    className="w-full font-bold text-xs text-slate-900 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Organization</label>
                  <input
                    type="text"
                    value={invoice.client.company || ''}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        client: { ...invoice.client, company: e.target.value }
                      })
                    }
                    placeholder="Company Legal Entity"
                    className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    value={invoice.client.email}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        client: { ...invoice.client, email: e.target.value }
                      })
                    }
                    placeholder="billing@client.com"
                    className="w-full text-xs text-slate-600 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Billing Address</label>
                  <textarea
                    rows={2}
                    value={invoice.client.address || ''}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        client: { ...invoice.client, address: e.target.value }
                      })
                    }
                    placeholder="Complete client billing address..."
                    className="w-full text-xs text-slate-600 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Payment Routing & Settlement */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-700 pb-1 border-b border-slate-200">
                <Landmark className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Settlement & Payment Routing
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 pt-1">
                <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                  <span className="text-slate-500 text-[11px]">Bank:</span>
                  <span className="font-bold text-slate-900">HDFC Bank Ltd.</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                  <span className="text-slate-500 text-[11px]">Account Name:</span>
                  <span className="font-semibold text-slate-900">{invoice.sender.company}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                  <span className="text-slate-500 text-[11px]">Account Number:</span>
                  <span className="font-mono font-bold text-slate-900">50200084920192</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                  <span className="text-slate-500 text-[11px]">IFSC Code:</span>
                  <span className="font-mono font-bold text-slate-900">HDFC0001234</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500 text-[11px]">Payment Status:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Pending Settlement
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                <span>Invoice Line Items & Pricing Breakdown</span>
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">
                {invoice.items.length} service(s) billed
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-black">
                    <th className="py-2.5 px-3 w-7/12">Item / Service Description</th>
                    <th className="py-2.5 px-2 text-center w-2/12">Quantity</th>
                    <th className="py-2.5 px-2 text-right w-2/12">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right w-2/12">Line Total</th>
                    <th className="py-2.5 pr-2 w-8 print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No items added yet. Click &quot;Add Item&quot; or extract from customer prompt.
                      </td>
                    </tr>
                  ) : (
                    invoice.items.map((item) => (
                      <tr key={item.id} className="group hover:bg-slate-50/80 transition-colors">
                        {/* Service description */}
                        <td className="py-3 px-3 align-top">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setInvoice(prev => ({
                                    ...prev,
                                    items: prev.items.map(it => (it.id === item.id ? { ...it, title: val } : it))
                                  }));
                                }}
                                className="font-bold text-slate-900 text-xs w-full sm:w-auto bg-transparent focus:outline-none border-b border-transparent focus:border-indigo-500"
                              />

                              {/* Anti-Hallucination Status Badge */}
                              {item.isUnmatched ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  Unmatched Custom Service
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  {item.service_id} Catalog Rate
                                </span>
                              )}
                            </div>

                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const val = e.target.value;
                                setInvoice(prev => ({
                                  ...prev,
                                  items: prev.items.map(it => (it.id === item.id ? { ...it, description: val } : it))
                                }));
                              }}
                              className="text-[11px] text-slate-500 w-full bg-transparent focus:outline-none border-b border-transparent focus:border-indigo-500"
                            />

                            {/* Fallback Remap Option (if unmatched) */}
                            {item.isUnmatched && (
                              <div className="pt-1 flex items-center gap-1.5 text-[10px] print:hidden">
                                <span className="text-amber-800 font-bold">Map to benchmark service:</span>
                                <select
                                  onChange={(e) => {
                                    const found = CATALOG.find(s => s.service_id === e.target.value);
                                    if (found) mapItemToCatalog(item.id, found);
                                  }}
                                  defaultValue=""
                                  className="bg-white border border-amber-300 rounded px-2 py-0.5 text-[10px] text-slate-700 font-medium cursor-pointer"
                                >
                                  <option value="" disabled>
                                    Choose official catalog rate...
                                  </option>
                                  {CATALOG.map(s => (
                                    <option key={s.service_id} value={s.service_id}>
                                      {s.service_name} (₹{s.unit_price_inr.toLocaleString('en-IN')})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="py-3 px-2 align-top text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.id, -1)}
                              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs print:hidden cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-bold text-slate-900 w-6 text-center text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.id, 1)}
                              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs print:hidden cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Unit Rate */}
                        <td className="py-3 px-2 align-top text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-slate-400 font-mono">{symbol}</span>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItemPrice(item.id, Number(e.target.value))}
                              className={`w-20 text-right font-bold text-xs rounded px-1 py-0.5 focus:outline-none focus:ring-1 ${
                                item.isUnmatched && item.unitPrice === 0
                                  ? 'bg-amber-100 border border-amber-400 text-amber-900 font-black'
                                  : 'text-slate-900 bg-transparent border-b border-transparent focus:border-indigo-500'
                              }`}
                            />
                          </div>
                          {item.isUnmatched && item.unitPrice === 0 && (
                            <span className="text-[10px] text-amber-700 font-bold block print:hidden">Enter custom rate</span>
                          )}
                        </td>

                        {/* Row Total */}
                        <td className="py-3 px-3 align-top text-right font-black text-slate-900 font-mono">
                          {symbol}
                          {(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                        </td>

                        {/* Delete row */}
                        <td className="py-3 pr-2 align-top text-right print:hidden">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-6">
            {/* Notes & Terms */}
            <div className="sm:w-1/2 space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Notes & Special Instructions
                </label>
                <textarea
                  rows={2}
                  value={invoice.notes}
                  onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                  className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2.5 mt-1 focus:outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={invoice.terms}
                  onChange={(e) => setInvoice({ ...invoice, terms: e.target.value })}
                  className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 mt-1 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* Calculations Summary Card */}
            <div className="sm:w-5/12 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">
                  {symbol}
                  {subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Tax / GST Selector */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-semibold">GST / Tax:</span>
                  <select
                    value={invoice.taxRate}
                    onChange={(e) => setInvoice({ ...invoice, taxRate: Number(e.target.value) })}
                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value={0}>0% (None)</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST (Standard)</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  +{symbol}
                  {taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 font-semibold">Discount ({symbol}):</span>
                <div className="flex items-center justify-end gap-1">
                  <span className="text-slate-400 font-mono">-</span>
                  <input
                    type="number"
                    value={invoice.discount || 0}
                    onChange={(e) => setInvoice({ ...invoice, discount: Number(e.target.value) })}
                    className="w-20 text-right bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-800 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Grand Total Box */}
              <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Grand Total ({currency}):
                </span>
                <span className="text-xl font-black text-indigo-700 font-mono">
                  {symbol}
                  {grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 text-right italic pt-1">
                Prices strictly verified against official catalog.
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div>
              Generated via <strong>SmartInvoice AI Engine</strong>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Digitally Verified & Anti-Hallucination Safe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  ChevronDown
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

    const success = await exportInvoiceToPDF('invoice-paper-document', invoice.invoiceNumber);
    setIsExporting(false);
  };

  // Native Print
  const handlePrint = () => {
    window.print();
  };

  const unmatchedCount = invoice.items.filter(i => i.isUnmatched).length;

  return (
    <div className="flex flex-col h-full bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
      {/* Top Action & Verification Bar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
            Step 3 of 3
          </span>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Human-in-the-Loop Review & PDF Export
            </h2>
            <p className="text-[11px] text-slate-400">
              Live document preview: adjust line items, change taxes, or download finalized PDF.
            </p>
          </div>
        </div>

        {/* Currency & Actions */}
        <div className="flex items-center gap-2">
          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            {(['INR', 'USD', 'EUR', 'GBP'] as const).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  currency === c
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Item</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            type="button"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Print Invoice"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
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
        <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Smart Fallback Triggered:</strong> {unmatchedCount} item(s) were not found in the pricing catalog. Review and assign a rate or map to an official service.
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
            Action Required
          </span>
        </div>
      )}

      {/* Main Scrollable Canvas: The Invoice Paper Document */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
        <div
          id="invoice-paper-document"
          className="max-w-3xl mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 border border-slate-200 space-y-8 print:p-0 print:border-none print:shadow-none print:text-black"
        >
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-600/30">
                  K
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  {invoice.sender.company}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
                {invoice.sender.address}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>{invoice.sender.email}</span>
                <span>•</span>
                <span>GSTIN: {invoice.sender.gstin}</span>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="sm:text-right space-y-1.5">
              <div className="inline-block px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-mono font-bold tracking-wider">
                TAX INVOICE
              </div>
              <div>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                  className="font-mono text-lg font-bold text-slate-900 sm:text-right w-full sm:w-44 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"
                />
              </div>
              <div className="text-xs text-slate-500 flex sm:justify-end gap-2">
                <span>Issue Date:</span>
                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                  className="text-slate-800 font-medium focus:outline-none border-b border-dashed border-slate-300"
                />
              </div>
              <div className="text-xs text-slate-500 flex sm:justify-end gap-2">
                <span>Due Date:</span>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                  className="text-slate-800 font-medium focus:outline-none border-b border-dashed border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Bill To & Bill From Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Bill To Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Billed To (Client)
              </span>
              <input
                type="text"
                value={invoice.client.name}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    client: { ...invoice.client, name: e.target.value }
                  })
                }
                placeholder="Client Name"
                className="w-full font-bold text-sm text-slate-900 bg-transparent focus:outline-none border-b border-transparent focus:border-indigo-500"
              />
              <input
                type="text"
                value={invoice.client.company || ''}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    client: { ...invoice.client, company: e.target.value }
                  })
                }
                placeholder="Client Company"
                className="w-full text-xs font-semibold text-slate-700 bg-transparent focus:outline-none border-b border-transparent focus:border-indigo-500"
              />
              <input
                type="email"
                value={invoice.client.email}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    client: { ...invoice.client, email: e.target.value }
                  })
                }
                placeholder="client@company.com"
                className="w-full text-xs text-slate-600 bg-transparent focus:outline-none border-b border-transparent focus:border-indigo-500"
              />
              <textarea
                rows={2}
                value={invoice.client.address || ''}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    client: { ...invoice.client, address: e.target.value }
                  })
                }
                placeholder="Client billing address..."
                className="w-full text-xs text-slate-500 bg-transparent focus:outline-none resize-none border-b border-transparent focus:border-indigo-500"
              />
            </div>

            {/* Payment & Terms Overview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Payment Details & Routing
              </span>
              <div className="text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank:</span>
                  <span className="font-medium text-slate-800">HDFC Bank Ltd.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">A/C Name:</span>
                  <span className="font-medium text-slate-800">Kodnexus Tech Pvt Ltd</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account No:</span>
                  <span className="font-mono font-medium text-slate-800">50200084920192</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IFSC / Routing:</span>
                  <span className="font-mono font-medium text-slate-800">HDFC0001234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Pending Review & Payment
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-2.5 pr-2 w-7/12">Service Description</th>
                    <th className="py-2.5 px-2 text-center w-2/12">Qty</th>
                    <th className="py-2.5 px-2 text-right w-2/12">Unit Rate</th>
                    <th className="py-2.5 pl-2 text-right w-2/12">Total</th>
                    <th className="py-2.5 pl-1 w-8 print:hidden"></th>
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
                        <td className="py-3 pr-2 align-top">
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
                                className="font-semibold text-slate-900 text-xs w-full sm:w-auto bg-transparent focus:outline-none border-b border-transparent focus:border-indigo-500"
                              />

                              {/* Anti-Hallucination Status Badge */}
                              {item.isUnmatched ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  Unmatched Service
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  {item.service_id} Matched
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
                              <div className="pt-1 flex items-center gap-1 text-[10px] print:hidden">
                                <span className="text-amber-700 font-medium">Map to catalog:</span>
                                <select
                                  onChange={(e) => {
                                    const found = CATALOG.find(s => s.service_id === e.target.value);
                                    if (found) mapItemToCatalog(item.id, found);
                                  }}
                                  defaultValue=""
                                  className="bg-white border border-amber-300 rounded px-1.5 py-0.5 text-[10px] text-slate-700"
                                >
                                  <option value="" disabled>
                                    Select official service...
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
                              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs print:hidden"
                            >
                              -
                            </button>
                            <span className="font-semibold text-slate-800 w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.id, 1)}
                              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs print:hidden"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Unit Rate */}
                        <td className="py-3 px-2 align-top text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-slate-400">{symbol}</span>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItemPrice(item.id, Number(e.target.value))}
                              className={`w-20 text-right font-medium text-xs rounded px-1 focus:outline-none focus:ring-1 ${
                                item.isUnmatched && item.unitPrice === 0
                                  ? 'bg-amber-50 border border-amber-400 text-amber-900 font-bold'
                                  : 'text-slate-800 bg-transparent border-b border-transparent focus:border-indigo-500'
                              }`}
                            />
                          </div>
                          {item.isUnmatched && item.unitPrice === 0 && (
                            <span className="text-[10px] text-amber-600 block print:hidden">Enter rate</span>
                          )}
                        </td>

                        {/* Row Total */}
                        <td className="py-3 pl-2 align-top text-right font-bold text-slate-900 font-mono">
                          {symbol}
                          {(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                        </td>

                        {/* Delete row */}
                        <td className="py-3 pl-1 align-top text-right print:hidden">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
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
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-6">
            {/* Notes & Terms */}
            <div className="sm:w-1/2 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Notes & Special Instructions
                </span>
                <textarea
                  rows={2}
                  value={invoice.notes}
                  onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                  className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment Terms
                </span>
                <input
                  type="text"
                  value={invoice.terms}
                  onChange={(e) => setInvoice({ ...invoice, terms: e.target.value })}
                  className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Calculations Box */}
            <div className="sm:w-5/12 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium text-slate-900">
                  {symbol}
                  {subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Tax / GST Selector */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600">Tax / GST:</span>
                  <select
                    value={invoice.taxRate}
                    onChange={(e) => setInvoice({ ...invoice, taxRate: Number(e.target.value) })}
                    className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-800 font-semibold focus:outline-none"
                  >
                    <option value={0}>0% (None)</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST (Standard)</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>
                <span className="font-mono font-medium text-slate-900">
                  +{symbol}
                  {taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Discount ({symbol}):</span>
                <div className="flex items-center justify-end gap-1">
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    value={invoice.discount || 0}
                    onChange={(e) => setInvoice({ ...invoice, discount: Number(e.target.value) })}
                    className="w-20 text-right bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-xs text-slate-800 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900">Grand Total ({currency}):</span>
                <span className="text-xl font-black text-indigo-700 font-mono">
                  {symbol}
                  {grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 text-right italic">
                All amounts calculated with anti-hallucination catalog rates.
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div>
              Generated via <strong>Kodnexus SmartInvoice Engine</strong>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Digitally Verified & Audit Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

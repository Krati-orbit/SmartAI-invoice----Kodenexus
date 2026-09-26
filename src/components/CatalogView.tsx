'use client';

import React, { useState } from 'react';
import { CATALOG, CatalogItem } from '@/data/catalog';
import {
  Database,
  Search,
  Tag,
  ShieldCheck,
  Plus,
  Check,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface CatalogViewProps {
  onSelectServiceToInvoice: (service: CatalogItem) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ onSelectServiceToInvoice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(CATALOG.map(item => item.category)))];

  const filtered = CATALOG.filter(item => {
    const matchesSearch =
      item.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.service_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (id: string, name: string) => {
    navigator.clipboard.writeText(`${name} (${id})`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white">Pricing Catalog & Benchmark Rates</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative 15-service catalog from <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">mock_data</code> used by the anti-hallucination engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Anti-Hallucination Safe</span>
          </div>
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog services by name, ID, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Catalog Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.service_id}
            className="group p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-all flex flex-col justify-between shadow-lg backdrop-blur-md"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-indigo-400 border border-slate-700">
                  {item.service_id}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800/80 text-slate-300 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-400" />
                  {item.category}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                {item.service_name}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                {item.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Standard Rate</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  ₹{item.unit_price_inr.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(item.service_id, item.service_name)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  title="Copy details"
                >
                  {copiedId === item.service_id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : 'Copy'}
                </button>
                <button
                  onClick={() => onSelectServiceToInvoice(item)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

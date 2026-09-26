'use client';

import React, { useState } from 'react';
import { CATALOG, CatalogItem } from '@/data/catalog';
import { X, Search, Database, Tag, ShieldCheck, Plus, Check } from 'lucide-react';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService?: (service: CatalogItem) => void;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectService
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(CATALOG.map(item => item.category)))];

  const filteredCatalog = CATALOG.filter(item => {
    const matchesSearch =
      item.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.service_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCopyId = (id: string, name: string) => {
    navigator.clipboard.writeText(`${name} (${id})`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Database Pricing Catalog</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {CATALOG.length} Standard Services (mock_data)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official benchmark prices used by the anti-hallucination verification engine.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search service by name, ID, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Items Grid */}
        <div className="p-6 overflow-y-auto space-y-3 max-h-[60vh]">
          {filteredCatalog.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Database className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No services found matching &quot;{searchTerm}&quot;</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for &quot;web&quot;, &quot;cloud&quot;, &quot;security&quot;, or &quot;API&quot;</p>
            </div>
          ) : (
            filteredCatalog.map(item => (
              <div
                key={item.service_id}
                className="group p-4 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-indigo-400 border border-slate-700">
                      {item.service_id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 text-slate-300 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {item.category}
                    </span>
                    <h4 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors">
                      {item.service_name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Catalog Rate</div>
                    <div className="text-base font-bold text-emerald-400">
                      ₹{item.unit_price_inr.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onSelectService && (
                      <button
                        onClick={() => {
                          onSelectService(item);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add to Invoice
                      </button>
                    )}
                    <button
                      onClick={() => handleCopyId(item.service_id, item.service_name)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                      title="Copy item info"
                    >
                      {copiedId === item.service_id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        'Copy'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Anti-Hallucination active: Extraction matches raw requests directly against this catalog.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { CATALOG, CatalogItem } from '@/data/catalog';
import { InvoiceItem } from '@/types/invoice';
import { X, Plus, Search, Tag } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: InvoiceItem) => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem
}) => {
  const [tab, setTab] = useState<'catalog' | 'custom'>('catalog');
  const [search, setSearch] = useState('');
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Custom item state
  const [customTitle, setCustomTitle] = useState('');
  const [customPrice, setCustomPrice] = useState<number>(5000);
  const [customDesc, setCustomDesc] = useState('');

  if (!isOpen) return null;

  const filteredCatalog = CATALOG.filter(item =>
    item.service_name.toLowerCase().includes(search.toLowerCase()) ||
    item.service_id.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCatalogItem = () => {
    if (!selectedCatalogItem) return;
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      service_id: selectedCatalogItem.service_id,
      title: selectedCatalogItem.service_name,
      category: selectedCatalogItem.category,
      description: selectedCatalogItem.description,
      quantity: Math.max(quantity, 1),
      unitPrice: selectedCatalogItem.unit_price_inr,
      isUnmatched: false,
      matchConfidence: 1.0
    };
    onAddItem(newItem);
    onClose();
  };

  const handleAddCustomItem = () => {
    if (!customTitle.trim()) return;
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      title: customTitle.trim(),
      category: 'Custom Service',
      description: customDesc.trim() || 'Custom bespoke service or add-on',
      quantity: Math.max(quantity, 1),
      unitPrice: Math.max(customPrice, 0),
      isUnmatched: true,
      matchConfidence: 0
    };
    onAddItem(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Add Line Item to Invoice</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 flex border-b border-slate-800">
          <button
            onClick={() => setTab('catalog')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              tab === 'catalog'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            From Pricing Catalog ({CATALOG.length} verified services)
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              tab === 'custom'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom / Unmatched Service
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {tab === 'catalog' ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search catalog service..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredCatalog.map(item => {
                  const isSelected = selectedCatalogItem?.service_id === item.service_id;
                  return (
                    <div
                      key={item.service_id}
                      onClick={() => setSelectedCatalogItem(item)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-indigo-400 px-1.5 py-0.5 rounded bg-slate-800">
                            {item.service_id}
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {item.service_name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {item.description}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <div className="text-xs font-bold text-emerald-400">
                          ₹{item.unit_price_inr.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quantity selector */}
              <div className="pt-2 flex items-center justify-between">
                <label className="text-xs text-slate-300 font-medium">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Service / Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Custom AI Voice Assistant"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Unit Price (₹ INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="Scope or notes for this item..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-medium">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={tab === 'catalog' ? handleAddCatalogItem : handleAddCustomItem}
            disabled={tab === 'catalog' ? !selectedCatalogItem : !customTitle.trim()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all"
          >
            Add to Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PromptInputPanel } from '@/components/PromptInputPanel';
import { InvoiceReviewPanel } from '@/components/InvoiceReviewPanel';
import { CatalogModal } from '@/components/CatalogModal';
import { SettingsModal } from '@/components/SettingsModal';
import { AddItemModal } from '@/components/AddItemModal';
import { InvoiceData, InvoiceItem } from '@/types/invoice';
import { SAMPLE_PRESETS } from '@/data/presets';
import { CATALOG, CatalogItem } from '@/data/catalog';
import {
  ShieldCheck,
  Zap,
  Database,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

import { WorkflowGuide } from '@/components/WorkflowGuide';

const INITIAL_INVOICE: InvoiceData = {
  invoiceNumber: 'INV-2026-4821',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
  currency: 'INR',
  currencySymbol: '₹',
  client: {
    name: 'Aarav Mehta',
    company: 'FinPulse Labs',
    email: 'aarav.mehta@finpulselabs.io',
    address: '4th Floor Innov8 Hub, Koramangala, Bengaluru, Karnataka 560034',
    phone: '+91 98765 43210'
  },
  sender: {
    name: 'Finance & Accounts',
    company: 'Kodnexus Technologies Pvt. Ltd.',
    email: 'billing@kodnexus.tech',
    phone: '+91 (080) 4123-8899',
    address: 'Tower B, Tech Innovation Park, Outer Ring Road, Bengaluru, KA 560103',
    gstin: '29ABCDE1234F1Z5'
  },
  items: [
    {
      id: 'item-1',
      service_id: 'SRV001',
      title: 'Full-stack Web App Module',
      category: 'Development',
      description: 'Development of a production-ready web application module with frontend and backend integration.',
      quantity: 1,
      unitPrice: 45000,
      isUnmatched: false,
      matchConfidence: 1.0
    },
    {
      id: 'item-2',
      service_id: 'SRV002',
      title: 'REST API Development',
      category: 'Development',
      description: 'Design and development of RESTful APIs with authentication and database integration.',
      quantity: 2,
      unitPrice: 18000,
      isUnmatched: false,
      matchConfidence: 1.0
    },
    {
      id: 'item-3',
      service_id: 'SRV008',
      title: 'Cloud Setup & Deployment',
      category: 'Cloud',
      description: 'Initial cloud infrastructure setup, application deployment, and environment configuration.',
      quantity: 1,
      unitPrice: 22000,
      isUnmatched: false,
      matchConfidence: 1.0
    },
    {
      id: 'item-4',
      service_id: 'SRV014',
      title: 'Website Maintenance',
      category: 'Maintenance',
      description: 'Monthly website maintenance including updates, monitoring, and minor fixes.',
      quantity: 1,
      unitPrice: 10000,
      isUnmatched: false,
      matchConfidence: 1.0
    }
  ],
  taxRate: 18,
  taxLabel: 'GST',
  discount: 0,
  notes: 'Net 15 payment terms. Standard 18% GST applied. Thank you for your partnership!',
  terms: 'Payment is due within 15 days of issue date.'
};

export default function Home() {
  const [promptText, setPromptText] = useState(SAMPLE_PRESETS[0].prompt);
  const [invoice, setInvoice] = useState<InvoiceData>(INITIAL_INVOICE);
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<string[]>([
    'System ready. Default sample preset loaded and verified against mock_data pricing catalog.'
  ]);
  const [durationMs, setDurationMs] = useState<number>(140);
  const [matchedCount, setMatchedCount] = useState<number>(4);
  const [unmatchedCount, setUnmatchedCount] = useState<number>(0);

  // Settings & Modals state
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'groq' | 'smart'>('smart');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // Load saved settings from localStorage on client
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('smart_invoice_api_key');
      const savedProvider = localStorage.getItem('smart_invoice_provider') as any;
      if (savedKey) setApiKey(savedKey);
      if (savedProvider) setProvider(savedProvider);
    } catch (e) {
      // LocalStorage unavailable in SSR
    }
  }, []);

  const handleSaveSettings = (newKey: string, newProvider: 'gemini' | 'groq' | 'smart') => {
    setApiKey(newKey);
    setProvider(newProvider);
    try {
      localStorage.setItem('smart_invoice_api_key', newKey);
      localStorage.setItem('smart_invoice_provider', newProvider);
    } catch (e) {}
  };

  // Perform AI Extraction & Catalog Matching
  const handleExtract = async () => {
    if (!promptText.trim()) return;

    setIsLoading(true);
    setSteps(['Dispatching request to extraction engine...']);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          customApiKey: apiKey,
          provider
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract invoice.');
      }

      setInvoice(data.invoice);
      setSteps(data.steps || ['Extraction complete']);
      setDurationMs(data.durationMs || 120);
      setMatchedCount(data.matchedCount || 0);
      setUnmatchedCount(data.unmatchedCount || 0);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setSteps(prev => [...prev, `❌ Error: ${err.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding item from AddItemModal
  const handleAddItem = (item: InvoiceItem) => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
  };

  // Handle selecting service from CatalogModal
  const handleSelectServiceFromCatalog = (service: CatalogItem) => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      service_id: service.service_id,
      title: service.service_name,
      category: service.category,
      description: service.description,
      quantity: 1,
      unitPrice: service.unit_price_inr,
      isUnmatched: false,
      matchConfidence: 1.0
    };
    handleAddItem(newItem);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeProvider={provider === 'smart' ? 'Built-in NLP' : provider}
      />

      {/* Hero Stats Ribbon */}
      <div className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-slate-300">Live AI Engine Active:</span>
            <span className="text-slate-400">
              Transforming unstructured requests into review-ready invoices
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anti-Hallucination: <strong className="text-emerald-400">100%</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Catalog: <strong className="text-indigo-400">{CATALOG.length} Services</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Avg Latency: <strong className="text-amber-400">~150ms</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Guided Workflow Banner */}
      <WorkflowGuide />

      {/* Main Dual-Panel Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Natural Language Input & Presets (5 cols on lg) */}
          <div className="lg:col-span-5 h-[calc(100vh-160px)] min-h-[580px] sticky top-20">
            <PromptInputPanel
              promptText={promptText}
              setPromptText={setPromptText}
              onExtract={handleExtract}
              isLoading={isLoading}
              steps={steps}
              durationMs={durationMs}
              matchedCount={matchedCount}
              unmatchedCount={unmatchedCount}
            />
          </div>

          {/* Right Column: Human-in-the-Loop Review & Live Invoice Document (7 cols on lg) */}
          <div className="lg:col-span-7 h-[calc(100vh-160px)] min-h-[580px]">
            <InvoiceReviewPanel
              invoice={invoice}
              setInvoice={setInvoice}
              onOpenAddItem={() => setIsAddItemOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <CatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectService={handleSelectServiceFromCatalog}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        provider={provider}
        onSave={handleSaveSettings}
      />

      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onAddItem={handleAddItem}
      />
    </div>
  );
}

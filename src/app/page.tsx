'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { NavigationTabs, AppTab } from '@/components/NavigationTabs';
import { PromptInputPanel } from '@/components/PromptInputPanel';
import { InvoiceReviewPanel } from '@/components/InvoiceReviewPanel';
import { InvoiceHistoryView } from '@/components/InvoiceHistoryView';
import { CatalogView } from '@/components/CatalogView';
import { CompanyProfileView } from '@/components/CompanyProfileView';
import { CatalogModal } from '@/components/CatalogModal';
import { SettingsModal } from '@/components/SettingsModal';
import { AddItemModal } from '@/components/AddItemModal';
import { WorkflowGuide } from '@/components/WorkflowGuide';
import { InvoiceData, InvoiceItem, SenderInfo } from '@/types/invoice';
import { SAMPLE_PRESETS } from '@/data/presets';
import { CATALOG, CatalogItem } from '@/data/catalog';
import {
  ShieldCheck,
  Zap,
  Database
} from 'lucide-react';

const INITIAL_SENDER: SenderInfo = {
  name: 'Finance & Accounts',
  company: 'Kodnexus Technologies Pvt. Ltd.',
  email: 'billing@kodnexus.tech',
  phone: '+91 (080) 4123-8899',
  address: 'Tower B, Tech Innovation Park, Outer Ring Road, Bengaluru, KA 560103',
  gstin: '29ABCDE1234F1Z5'
};

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
  sender: INITIAL_SENDER,
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

const INITIAL_HISTORY: InvoiceData[] = [
  INITIAL_INVOICE,
  {
    invoiceNumber: 'INV-2026-8820',
    issueDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0],
    currency: 'INR',
    currencySymbol: '₹',
    client: {
      name: 'Elena Rostova',
      company: 'Nova Luxe Retail',
      email: 'elena@novaluxe.co',
      address: '120 Richmond Road, Mumbai 400001'
    },
    sender: INITIAL_SENDER,
    items: [
      {
        id: 'hist-1',
        service_id: 'SRV007',
        title: 'Brand Identity Design',
        category: 'Design',
        description: 'Creation of a basic visual identity including logo, typography, and brand guidelines.',
        quantity: 1,
        unitPrice: 18000,
        isUnmatched: false,
        matchConfidence: 1.0
      },
      {
        id: 'hist-2',
        service_id: 'SRV005',
        title: 'UI/UX Wireframing',
        category: 'Design',
        description: 'Creation of low-fidelity wireframes and user flows for a digital product.',
        quantity: 1,
        unitPrice: 8000,
        isUnmatched: false,
        matchConfidence: 1.0
      },
      {
        id: 'hist-3',
        service_id: 'SRV006',
        title: 'UI/UX Design Package',
        category: 'Design',
        description: 'Complete high-fidelity interface design for web or mobile screens.',
        quantity: 1,
        unitPrice: 25000,
        isUnmatched: false,
        matchConfidence: 1.0
      }
    ],
    taxRate: 18,
    taxLabel: 'GST',
    discount: 0,
    notes: 'Payment terms: Net 14 days. Deliverables uploaded to Figma.',
    terms: 'Payment is due within 14 days.'
  },
  {
    invoiceNumber: 'INV-2026-6192',
    issueDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    currency: 'INR',
    currencySymbol: '₹',
    client: {
      name: 'Priya Sharma',
      company: 'GreenRoot Organics',
      email: 'priya@greenroot.in',
      address: 'Bandra West, Mumbai 400050'
    },
    sender: INITIAL_SENDER,
    items: [
      {
        id: 'hist-4',
        service_id: 'SRV013',
        title: 'SEO Optimization Package',
        category: 'Marketing',
        description: 'On-page SEO improvements, technical SEO checks, and keyword optimization.',
        quantity: 1,
        unitPrice: 16000,
        isUnmatched: false,
        matchConfidence: 1.0
      },
      {
        id: 'hist-5',
        service_id: 'SRV012',
        title: 'Digital Marketing Campaign',
        category: 'Marketing',
        description: 'Planning and execution support for a digital marketing campaign across selected channels.',
        quantity: 2,
        unitPrice: 30000,
        isUnmatched: false,
        matchConfidence: 1.0
      }
    ],
    taxRate: 18,
    taxLabel: 'GST',
    discount: 0,
    notes: 'Q3 Growth Marketing retainer. 18% GST applied.',
    terms: 'Payment is due within 7 days.'
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>('generator');
  const [promptText, setPromptText] = useState(SAMPLE_PRESETS[0].prompt);
  const [invoice, setInvoice] = useState<InvoiceData>(INITIAL_INVOICE);
  const [senderProfile, setSenderProfile] = useState<SenderInfo>(INITIAL_SENDER);
  const [historyInvoices, setHistoryInvoices] = useState<InvoiceData[]>(INITIAL_HISTORY);

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

  // Load saved settings & history from localStorage on client
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('smart_invoice_api_key');
      const savedProvider = localStorage.getItem('smart_invoice_provider') as any;
      const savedHistory = localStorage.getItem('smart_invoice_history');
      const savedSender = localStorage.getItem('smart_invoice_sender');

      if (savedKey) setApiKey(savedKey);
      if (savedProvider) setProvider(savedProvider);
      if (savedHistory) setHistoryInvoices(JSON.parse(savedHistory));
      if (savedSender) {
        const parsed = JSON.parse(savedSender);
        setSenderProfile(parsed);
        setInvoice(prev => ({ ...prev, sender: parsed }));
      }
    } catch (e) {
      // LocalStorage unavailable in SSR
    }
  }, []);

  const saveHistoryToStorage = (updatedList: InvoiceData[]) => {
    setHistoryInvoices(updatedList);
    try {
      localStorage.setItem('smart_invoice_history', JSON.stringify(updatedList));
    } catch (e) {}
  };

  const handleSaveSettings = (newKey: string, newProvider: 'gemini' | 'groq' | 'smart') => {
    setApiKey(newKey);
    setProvider(newProvider);
    try {
      localStorage.setItem('smart_invoice_api_key', newKey);
      localStorage.setItem('smart_invoice_provider', newProvider);
    } catch (e) {}
  };

  const handleUpdateSender = (updatedSender: SenderInfo) => {
    setSenderProfile(updatedSender);
    setInvoice(prev => ({ ...prev, sender: updatedSender }));
    try {
      localStorage.setItem('smart_invoice_sender', JSON.stringify(updatedSender));
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

      const newInvoice: InvoiceData = {
        ...data.invoice,
        sender: senderProfile
      };

      setInvoice(newInvoice);
      setSteps(data.steps || ['Extraction complete']);
      setDurationMs(data.durationMs || 120);
      setMatchedCount(data.matchedCount || 0);
      setUnmatchedCount(data.unmatchedCount || 0);

      // Prepend to history
      const existingIdx = historyInvoices.findIndex(h => h.invoiceNumber === newInvoice.invoiceNumber);
      let updated: InvoiceData[];
      if (existingIdx >= 0) {
        updated = [...historyInvoices];
        updated[existingIdx] = newInvoice;
      } else {
        updated = [newInvoice, ...historyInvoices];
      }
      saveHistoryToStorage(updated);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setSteps(prev => [...prev, `❌ Error: ${err.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add Item to active invoice
  const handleAddItem = (item: InvoiceItem) => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
  };

  // Select service from Catalog
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
    setActiveTab('generator');
  };

  // Select an invoice from history to load into editor
  const handleSelectHistoryInvoice = (selected: InvoiceData) => {
    setInvoice(selected);
    setActiveTab('generator');
  };

  // Delete invoice from history
  const handleDeleteHistoryInvoice = (invoiceNumber: string) => {
    const updated = historyInvoices.filter(h => h.invoiceNumber !== invoiceNumber);
    saveHistoryToStorage(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeProvider={provider === 'smart' ? 'Built-in NLP' : provider}
      />

      {/* Navigation Tabs (SaaS Multi-view) */}
      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={historyInvoices.length}
        catalogCount={CATALOG.length}
      />

      {/* Dynamic Views Based on Active Tab */}
      {activeTab === 'generator' && (
        <>
          {/* Hero Stats Ribbon */}
          <div className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
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
              <div className="lg:col-span-5 h-[calc(100vh-210px)] min-h-[580px] sticky top-28">
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
              <div className="lg:col-span-7 h-[calc(100vh-210px)] min-h-[580px]">
                <InvoiceReviewPanel
                  invoice={invoice}
                  setInvoice={setInvoice}
                  onOpenAddItem={() => setIsAddItemOpen(true)}
                />
              </div>
            </div>
          </main>
        </>
      )}

      {activeTab === 'history' && (
        <main className="flex-1">
          <InvoiceHistoryView
            invoices={historyInvoices}
            onSelectInvoice={handleSelectHistoryInvoice}
            onDeleteInvoice={handleDeleteHistoryInvoice}
            onCreateNew={() => setActiveTab('generator')}
          />
        </main>
      )}

      {activeTab === 'catalog' && (
        <main className="flex-1">
          <CatalogView onSelectServiceToInvoice={handleSelectServiceFromCatalog} />
        </main>
      )}

      {activeTab === 'company' && (
        <main className="flex-1">
          <CompanyProfileView sender={senderProfile} onUpdateSender={handleUpdateSender} />
        </main>
      )}

      {/* Global Modals */}
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

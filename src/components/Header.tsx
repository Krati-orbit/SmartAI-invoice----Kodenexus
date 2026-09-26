'use client';

import React from 'react';
import { Sparkles, Database, Settings, ShieldCheck, Zap, Menu, History, Building2 } from 'lucide-react';

interface HeaderProps {
  onOpenSideDrawer: () => void;
  onOpenCatalog: () => void;
  onOpenHistory: () => void;
  onOpenCompany: () => void;
  onOpenSettings: () => void;
  activeProvider: string;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSideDrawer,
  onOpenCatalog,
  onOpenHistory,
  onOpenCompany,
  onOpenSettings,
  activeProvider,
  historyCount
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Menu Drawer Trigger */}
        <div className="flex items-center gap-3">
          {/* Side Drawer Menu Trigger Button */}
          <button
            onClick={onOpenSideDrawer}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Open Side Navigation Window"
          >
            <Menu className="w-4 h-4 text-indigo-400" />
            <span className="font-bold">Pages & Apps</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Logo & Project Title */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Kodnexus <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">SmartInvoice</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  AI Build Battle
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden lg:block">
                Natural Language → Anti-Hallucination Pricing → Professional Invoice PDF
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Invoice History Trigger */}
          <button
            onClick={onOpenHistory}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="View Saved Invoices"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Invoices</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
              {historyCount}
            </span>
          </button>

          {/* Pricing Catalog Trigger */}
          <button
            onClick={onOpenCatalog}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Inspect 15 Benchmark Services"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Catalog</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
              15
            </span>
          </button>

          {/* Company Profile Trigger */}
          <button
            onClick={onOpenCompany}
            type="button"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Company GSTIN & Bank Routing"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Profile</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Configure AI API Key (Gemini / Groq)"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
            <span className="hidden xl:inline">AI Settings</span>
          </button>

          {/* Anti-Hallucination Safe Badge */}
          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-medium text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anti-Hallucination Safe</span>
          </div>
        </div>
      </div>
    </header>
  );
};

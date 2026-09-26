'use client';

import React from 'react';
import { Sparkles, Database, Settings, ShieldCheck, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenCatalog: () => void;
  onOpenSettings: () => void;
  activeProvider: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCatalog,
  onOpenSettings,
  activeProvider
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                Kodnexus <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">SmartInvoice</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                AI Build Battle Sprint
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Natural Language → Anti-Hallucination Pricing → Professional Invoice PDF
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Provider Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Engine:</span>
            <span className="font-medium text-slate-200 capitalize">{activeProvider}</span>
          </div>

          {/* Catalog Drawer Trigger */}
          <button
            onClick={onOpenCatalog}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pricing Catalog</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
              15
            </span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Configure AI API Key (Gemini / Groq)"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Settings</span>
          </button>

          {/* Anti-Hallucination Guarantee Badge */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-medium text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anti-Hallucination Safe</span>
          </div>
        </div>
      </div>
    </header>
  );
};

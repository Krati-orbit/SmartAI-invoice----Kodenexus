'use client';

import React, { useState } from 'react';
import {
  FileText,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Info,
  X
} from 'lucide-react';

export const WorkflowGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 py-1 px-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 transition-all cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Show 3-Step Quick Guide</span>
        </button>
      </div>
    );
  }

  const steps = [
    {
      num: '1',
      title: 'Choose or Paste Request',
      desc: 'Pick one of the 4 sample presets on the left, or paste any raw client email / message.',
      icon: FileText,
      accent: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'
    },
    {
      num: '2',
      title: 'AI Extract & Price Lookup',
      desc: 'Click "Generate Structured Invoice". The AI extracts items and automatically locks in verified catalog prices.',
      icon: Cpu,
      accent: 'text-violet-400 border-violet-500/30 bg-violet-500/10'
    },
    {
      num: '3',
      title: 'Review, Adjust & Download',
      desc: 'Edit quantities, adjust GST/taxes, resolve any flagged custom items, then click "Download PDF".',
      icon: ShieldCheck,
      accent: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-indigo-950/40 border border-slate-800 p-4 sm:p-5 backdrop-blur-xl shadow-lg">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Dismiss guide"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            How It Works — 3-Step Guided Workflow
          </h3>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            (Designed for the Kodnexus Build Battle Challenge)
          </span>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${st.accent}`}
                >
                  {st.num}
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{st.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

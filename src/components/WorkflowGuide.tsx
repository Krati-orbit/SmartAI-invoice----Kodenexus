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
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 py-1 px-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 transition-all cursor-pointer font-medium"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Show 3-Step Guided Workflow</span>
        </button>
      </div>
    );
  }

  const steps = [
    {
      num: '01',
      title: 'Input Client Brief',
      subtitle: 'Raw Message or 1-Click Preset',
      desc: 'Select a sample scenario from the left panel, or paste any raw email or chat request.',
      tag: 'Step 1: Input',
      accentBorder: 'border-indigo-500/40 hover:border-indigo-400',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      numBg: 'bg-indigo-600 text-white shadow-indigo-600/30'
    },
    {
      num: '02',
      title: 'AI Extract & Price Lock',
      subtitle: 'Anti-Hallucination Engine',
      desc: 'Click "Generate Structured Invoice". Entities are parsed and locked strictly to catalog prices.',
      tag: 'Step 2: Match',
      accentBorder: 'border-violet-500/40 hover:border-violet-400',
      badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      numBg: 'bg-violet-600 text-white shadow-violet-600/30'
    },
    {
      num: '03',
      title: 'Review, Edit & Export',
      subtitle: 'Human-in-the-Loop + PDF',
      desc: 'Tweak quantities or rates, select GST bracket (0-28%), and download the professional PDF.',
      tag: 'Step 3: Export',
      accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      numBg: 'bg-emerald-600 text-white shadow-emerald-600/30'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 backdrop-blur-xl shadow-xl">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          title="Dismiss guide"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Section Header with clear typography */}
        <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-800/80">
          <div className="h-6 w-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-black tracking-wide text-white uppercase">
            How The Application Works: 3-Step Guided Workflow
          </h2>
          <span className="text-[11px] text-slate-400 hidden sm:inline ml-auto pr-8">
            Natural Language In → Anti-Hallucination Pricing → High-DPI PDF Out
          </span>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((st) => (
            <div
              key={st.num}
              className={`relative flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-950/70 border ${st.accentBorder} transition-all shadow-sm`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-md ${st.numBg}`}
              >
                {st.num}
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs font-bold text-white tracking-tight">
                    {st.title}
                  </h3>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${st.badgeBg}`}>
                    {st.tag}
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-slate-400">
                  {st.subtitle}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

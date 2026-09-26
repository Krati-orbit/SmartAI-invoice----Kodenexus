'use client';

import React from 'react';
import {
  X,
  Sparkles,
  History,
  Database,
  Building2,
  Settings,
  ChevronRight,
  ShieldCheck,
  Zap,
  ExternalLink
} from 'lucide-react';

export type ActiveModal = 'history' | 'catalog' | 'company' | 'settings' | null;

interface SideNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenView: (view: ActiveModal) => void;
  historyCount: number;
  catalogCount: number;
}

export const SideNavigationDrawer: React.FC<SideNavigationDrawerProps> = ({
  isOpen,
  onClose,
  onOpenView,
  historyCount,
  catalogCount
}) => {
  if (!isOpen) return null;

  const navItems = [
    {
      id: null as ActiveModal,
      title: 'AI Invoice Generator',
      desc: 'Main real-time workspace with natural language input & PDF generator',
      icon: Sparkles,
      badge: 'Active Workspace',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'history' as ActiveModal,
      title: 'Invoice History & Archives',
      desc: 'Browse, edit, and export previously generated customer invoices',
      icon: History,
      badge: `${historyCount} Invoices`,
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    },
    {
      id: 'catalog' as ActiveModal,
      title: 'Pricing Catalog (mock_data)',
      desc: 'Official benchmark rates and 15 verified services for anti-hallucination',
      icon: Database,
      badge: `${catalogCount} Services`,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
    },
    {
      id: 'company' as ActiveModal,
      title: 'Company & Settlement Profile',
      desc: 'Configure GSTIN, billing address, bank routing and default payment terms',
      icon: Building2,
      badge: 'GST Ready',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: 'settings' as ActiveModal,
      title: 'AI Engine Settings',
      desc: 'Configure Google Gemini 1.5, Groq Llama 3, or Built-in offline NLP engine',
      icon: Settings,
      badge: 'AI Config',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over panel on the side */}
      <div className="fixed inset-y-0 left-0 max-w-sm w-full bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">SmartInvoice Apps</div>
              <div className="text-[10px] text-slate-400">Navigation & Tools Drawer</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-1">
            Application Views
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  onOpenView(item.id);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/60 hover:border-slate-700 transition-all flex items-start gap-3 group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {item.title}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold shrink-0 ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors shrink-0 mt-2" />
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Anti-Hallucination Safe</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All prices strictly matched against the 15 benchmark services from <code className="text-slate-400">mock_data</code>.
          </p>
        </div>
      </div>
    </div>
  );
};

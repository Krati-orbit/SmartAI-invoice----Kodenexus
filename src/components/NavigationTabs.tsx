'use client';

import React from 'react';
import { Sparkles, History, Database, Building2, Layers } from 'lucide-react';

export type AppTab = 'generator' | 'history' | 'catalog' | 'company';

interface NavigationTabsProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  historyCount: number;
  catalogCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  setActiveTab,
  historyCount,
  catalogCount
}) => {
  const tabs = [
    {
      id: 'generator' as AppTab,
      label: 'AI Invoice Generator',
      icon: Sparkles,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'history' as AppTab,
      label: 'Invoice History',
      icon: History,
      badge: `${historyCount}`,
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    },
    {
      id: 'catalog' as AppTab,
      label: 'Pricing Catalog',
      icon: Database,
      badge: `${catalogCount}`,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
    },
    {
      id: 'company' as AppTab,
      label: 'Company & Bank Profile',
      icon: Building2,
      badge: 'GST',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    }
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-950/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto scrollbar-none py-2" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                      isActive ? 'bg-white/20 text-white border-white/20' : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

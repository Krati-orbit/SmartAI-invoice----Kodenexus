'use client';

import React, { useState } from 'react';
import { SAMPLE_PRESETS } from '@/data/presets';
import { PresetScenario } from '@/types/invoice';
import {
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Terminal,
  FileText,
  ArrowRight,
  Info,
  Check
} from 'lucide-react';

interface PromptInputPanelProps {
  promptText: string;
  setPromptText: (text: string) => void;
  onExtract: () => void;
  isLoading: boolean;
  steps: string[];
  durationMs?: number;
  matchedCount?: number;
  unmatchedCount?: number;
}

export const PromptInputPanel: React.FC<PromptInputPanelProps> = ({
  promptText,
  setPromptText,
  onExtract,
  isLoading,
  steps,
  durationMs,
  matchedCount,
  unmatchedCount
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(SAMPLE_PRESETS[0].id);
  const [showLogs, setShowLogs] = useState(false);

  const handleSelectPreset = (preset: PresetScenario) => {
    setSelectedPresetId(preset.id);
    setPromptText(preset.prompt);
  };

  const handleClear = () => {
    setPromptText('');
    setSelectedPresetId(null);
  };

  const selectedPreset = SAMPLE_PRESETS.find(p => p.id === selectedPresetId);

  return (
    <div className="flex flex-col h-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
      {/* Step Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/90">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
              Step 1 of 3
            </span>
            <h2 className="text-sm font-black text-white uppercase tracking-wide">
              Client Request Input
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Messy email, chat brief, or 1-click test scenario
          </p>
        </div>

        {promptText && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Section 1: Evaluation Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Evaluation Scenario:</span>
          </label>
          <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            Quick 1-Click
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/15 shadow-sm shadow-indigo-500/20 ring-1 ring-indigo-500/60'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-white truncate flex items-center gap-1">
                    {isSelected && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
                    {preset.title}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold shrink-0 ${preset.tagColor}`}>
                    {preset.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {preset.summary}
                </p>
              </button>
            );
          })}
        </div>

        {selectedPreset && (
          <div className="px-3 py-1.5 rounded-lg bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-between text-[11px] text-indigo-300">
            <span className="truncate">
              Loaded: <strong className="text-white">{selectedPreset.title}</strong>
            </span>
            <span className="text-[10px] text-indigo-400 font-semibold shrink-0 ml-2">Click below to parse ↓</span>
          </div>
        )}
      </div>

      {/* Section 2: Textarea for Natural Language Input */}
      <div className="flex-1 min-h-[190px] flex flex-col space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Unstructured Request Brief:</span>
          </label>
          <span className="text-slate-400 font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {promptText.length} characters
          </span>
        </div>

        <div className="relative flex-1 flex flex-col">
          <textarea
            value={promptText}
            onChange={(e) => {
              setPromptText(e.target.value);
              setSelectedPresetId(null);
            }}
            placeholder="Type or paste unstructured customer email, WhatsApp requirements, or message..."
            className="w-full flex-1 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none font-sans leading-relaxed transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Section 3: Action Trigger Button */}
      <div className="space-y-3 pt-1">
        <button
          type="button"
          onClick={onExtract}
          disabled={isLoading || !promptText.trim()}
          className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg tracking-wide uppercase ${
            isLoading || !promptText.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Matching Against Benchmark Catalog...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Step 2: Generate Structured Invoice</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Section 4: Telemetry Pipeline Logs */}
        {steps && steps.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden text-xs shadow-md">
            <button
              type="button"
              onClick={() => setShowLogs(!showLogs)}
              className="w-full px-3 py-2.5 flex items-center justify-between text-slate-300 hover:text-white hover:bg-slate-900/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
                  Pipeline Execution Trace
                </span>
                {durationMs !== undefined && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {durationMs}ms
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {matchedCount !== undefined && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    ✓ {matchedCount} Matched
                  </span>
                )}
                {unmatchedCount !== undefined && unmatchedCount > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                    ⚠ {unmatchedCount} Unmatched
                  </span>
                )}
                {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showLogs && (
              <div className="p-3 border-t border-slate-800/80 space-y-1.5 font-mono text-[11px] text-slate-400 bg-slate-950 max-h-48 overflow-y-auto">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-600 select-none">[{idx + 1}]</span>
                    <span className={step.includes('⚠️') ? 'text-amber-400 font-medium' : step.includes('Matched') ? 'text-emerald-400 font-medium' : 'text-slate-300'}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

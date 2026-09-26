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
  Info
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
    <div className="flex flex-col h-full bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Step Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
              Step 1 of 3
            </span>
            <h2 className="text-sm font-bold text-white">
              Raw Client Request
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Choose a quick scenario below, or paste any client email / brief.
          </p>
        </div>

        {promptText && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded-md hover:bg-slate-800 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Preset Pills with clear explanation */}
      <div className="py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Click a scenario to test instantly:
          </span>
          <span className="text-[10px] text-indigo-400 font-medium">1-Click Presets</span>
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
                    ? 'border-indigo-500 bg-indigo-500/15 shadow-sm shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-semibold text-white truncate">
                    {preset.title}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold shrink-0 ${preset.tagColor}`}>
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
          <div className="px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-between text-[11px] text-indigo-300">
            <span className="truncate">
              Selected: <strong>{selectedPreset.title}</strong>
            </span>
            <span className="text-[10px] text-indigo-400 shrink-0 ml-2">Click &apos;Generate&apos; below ↓</span>
          </div>
        )}
      </div>

      {/* Textarea Input */}
      <div className="flex-1 min-h-[200px] flex flex-col pt-1">
        <label className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
          <span>Unstructured Client Message:</span>
          <span className="text-slate-500 font-mono text-[10px]">{promptText.length} characters</span>
        </label>
        <div className="relative flex-1 flex flex-col">
          <textarea
            value={promptText}
            onChange={(e) => {
              setPromptText(e.target.value);
              setSelectedPresetId(null);
            }}
            placeholder="Type or paste raw client email/message here..."
            className="w-full flex-1 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none font-sans leading-relaxed transition-all"
          />
        </div>
      </div>

      {/* Step 2 Action Button */}
      <div className="pt-4 space-y-3">
        <button
          type="button"
          onClick={onExtract}
          disabled={isLoading || !promptText.trim()}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg ${
            isLoading || !promptText.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing & Matching Catalog Rates...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Step 2: Generate Structured Invoice</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Telemetry & Pipeline Execution Trace */}
        {steps && steps.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setShowLogs(!showLogs)}
              className="w-full px-3 py-2 flex items-center justify-between text-slate-300 hover:text-white hover:bg-slate-900/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-300">AI Extraction Pipeline Trace</span>
                {durationMs !== undefined && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {durationMs}ms
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {matchedCount !== undefined && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-medium">
                    ✓ {matchedCount} matched
                  </span>
                )}
                {unmatchedCount !== undefined && unmatchedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-medium">
                    ⚠ {unmatchedCount} unmatched
                  </span>
                )}
                {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showLogs && (
              <div className="p-3 border-t border-slate-800/80 space-y-1.5 font-mono text-[11px] text-slate-400 bg-slate-950/95 max-h-48 overflow-y-auto">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-600 select-none">[{idx + 1}]</span>
                    <span className={step.includes('⚠️') ? 'text-amber-400' : step.includes('Matched') ? 'text-emerald-400' : 'text-slate-300'}>
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

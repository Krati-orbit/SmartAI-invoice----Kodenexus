'use client';

import React, { useState } from 'react';
import { X, Key, Cpu, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  provider: 'gemini' | 'groq' | 'smart';
  onSave: (apiKey: string, provider: 'gemini' | 'groq' | 'smart') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  provider,
  onSave
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'groq' | 'smart'>(provider);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(inputKey, selectedProvider);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Engine Configuration</h3>
              <p className="text-xs text-slate-400">Configure LLM extraction provider or use offline NLP engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Extraction Engine Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedProvider('smart')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedProvider === 'smart'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-emerald-400">Built-in NLP</div>
                <div className="text-[10px] text-slate-400 mt-1">Zero Key Needed</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProvider('gemini')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedProvider === 'gemini'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-indigo-400">Google Gemini</div>
                <div className="text-[10px] text-slate-400 mt-1">1.5 Flash Model</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProvider('groq')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedProvider === 'groq'
                    ? 'border-violet-500 bg-violet-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-violet-400">Groq Cloud</div>
                <div className="text-[10px] text-slate-400 mt-1">Llama 3 70B</div>
              </button>
            </div>
          </div>

          {/* API Key Input (if LLM selected) */}
          {selectedProvider !== 'smart' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  {selectedProvider === 'gemini' ? 'Google Gemini API Key' : 'Groq API Key'}
                </label>
                <a
                  href={selectedProvider === 'gemini' ? 'https://aistudio.google.com/' : 'https://console.groq.com/'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Get key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder={`Paste your ${selectedProvider.toUpperCase()} key (or leave blank to use env)`}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Key is kept in your browser session for security. Server falls back automatically if limits are met.
              </p>
            </div>
          )}

          {/* Guarantee banner */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">Guaranteed Anti-Hallucination</p>
              <p className="text-slate-400">
                Regardless of the AI model chosen, unit rates are strictly bound to the 15 benchmark services from your pricing catalog.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                Saved!
              </>
            ) : (
              'Save Configuration'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

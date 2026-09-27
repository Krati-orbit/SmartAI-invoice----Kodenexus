'use client';

import React, { useState, useRef, useEffect } from 'react';
import { InvoiceData } from '@/types/invoice';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Zap,
  ChevronDown
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface InvoiceChatbotProps {
  invoice: InvoiceData;
  apiKey: string;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export const InvoiceChatbot: React.FC<InvoiceChatbotProps> = ({
  invoice,
  apiKey,
  isOpenExternal,
  onCloseExternal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync external open state if provided
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  // Initial welcome greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `👋 Hello! I am your **SmartInvoice AI Assistant** powered by Google Gemini.\n\nI have loaded the live context for invoice **${invoice.invoiceNumber}** billed to **${invoice.client?.name || 'Client'}** (Total: **${invoice.currencySymbol || '₹'}${invoice.items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0).toLocaleString('en-IN')}**).\n\nHow can I help you? You can ask me to explain taxes, draft a client email, check line items, or calculate discounts!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [invoice.invoiceNumber]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          invoice,
          customApiKey: apiKey
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch AI reply');
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Sorry, I encountered an issue processing your request: ${err.message}. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat history cleared. I am ready to answer any questions about invoice **${invoice.invoiceNumber}**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseExternal) onCloseExternal();
  };

  const QUICK_QUESTIONS = [
    { label: '🧾 Explain Taxes', query: 'Can you break down the tax calculation and GST on this invoice?' },
    { label: '✉️ Draft Client Email', query: 'Draft a professional payment notification email for this client.' },
    { label: '📅 Due Date & Terms', query: 'What are the payment terms, due date, and bank routing details?' },
    { label: '🔍 Verify Catalog Rates', query: 'Are all line item prices strictly verified against the benchmark catalog?' }
  ];

  return (
    <>
      {/* Floating Action Launcher Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-indigo-400/30 group"
          title="Open Invoice AI Assistant Chatbot"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-900" />
          </div>
          <span className="text-xs font-bold tracking-wide">Ask Invoice AI</span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-500/40 text-indigo-100 uppercase tracking-widest">
            Gemini
          </span>
        </button>
      )}

      {/* Floating Chat Modal Popover */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[94vw] sm:w-[430px] h-[580px] max-h-[85vh] bg-[#0d1322]/95 border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-6 fade-in duration-200 ring-1 ring-white/10">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-800/80 bg-[#0b0f19]/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-sky-400 p-0.5 shadow-md shadow-indigo-500/20">
                <div className="h-full w-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white tracking-tight">SmartInvoice AI Assistant</h3>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Gemini Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-[210px]">
                  Context: <strong className="text-slate-300">{invoice.invoiceNumber}</strong> • {invoice.client.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClose}
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Close chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div className="px-4 py-2 bg-indigo-950/25 border-b border-indigo-500/20 flex items-center justify-between text-[11px] text-indigo-200">
            <span className="truncate">
              Billed: <strong className="text-white">{invoice.client?.company || invoice.client?.name}</strong>
            </span>
            <span className="font-mono font-bold text-emerald-400 shrink-0 ml-2">
              {invoice.currencySymbol}{invoice.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Scrollable Message Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-xs'
                      : 'bg-slate-900/90 border border-slate-800/80 text-slate-200 rounded-bl-xs'
                  }`}
                >
                  {/* Message formatted with markdown whitespace */}
                  <div className="whitespace-pre-wrap font-sans text-xs">
                    {msg.content}
                  </div>

                  {/* Message timestamp & copy action */}
                  <div className="flex items-center justify-between gap-3 pt-1 mt-1 text-[9px] text-slate-400/80 border-t border-white/5">
                    <span>{msg.timestamp}</span>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        type="button"
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white flex items-center gap-1 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" />
                </div>
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl px-3.5 py-2.5 text-xs text-indigo-300 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">Gemini is analyzing invoice...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-[#090d16]/80 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_QUESTIONS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip.query)}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-slate-700/60 text-[10px] text-slate-300 hover:text-indigo-300 font-medium transition-all cursor-pointer whitespace-nowrap"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#0b0f19]/95 border-t border-slate-800/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this invoice..."
              disabled={isLoading}
              className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isLoading || !input.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 hover:scale-105 active:scale-95'
              }`}
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

'use client';

import { useRequestStore } from '@/store/useRequestStore';
import GlassCard from './GlassCard';
import { Clock, CheckCircle, AlertCircle, Terminal, Copy, ClipboardCheck, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
// We'll use a basic theme approach or custom CSS in globals
import 'prismjs/themes/prism-tomorrow.css'; 

export default function ResponsePanel() {
  const { response, error, isLoading, _hasHydrated } = useRequestStore();
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (response && codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [response, isLoading]);

  const handleCopy = () => {
    if (!response) return;
    const text = typeof response.data === 'object' 
      ? JSON.stringify(response.data, null, 2) 
      : response.data;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!_hasHydrated) return null;

  if (isLoading) {
    return (
      <GlassCard className="h-[450px] flex items-center justify-center border-dashed border-white/10 bg-white/[0.02]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-primary/40">
              <Terminal className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <p className="text-sm font-black text-white uppercase tracking-widest">Processing Request</p>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest animate-pulse">Awaiting Server Response...</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="border-rose-500/20 bg-rose-500/5">
        <div className="flex items-center gap-4 text-rose-400 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-lg">Request Failed</h3>
            <p className="text-[10px] text-rose-400/60 font-bold uppercase tracking-widest">Network or Protocol Error</p>
          </div>
        </div>
        <div className="p-6 bg-black/40 rounded-2xl border border-rose-500/10 font-mono text-sm text-rose-300 shadow-inner">
          {error}
        </div>
      </GlassCard>
    );
  }

  if (!response) {
    return (
      <GlassCard className="h-[400px] flex items-center justify-center border-dashed border-white/10 opacity-40">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-white/5">
            <Terminal className="w-10 h-10 text-white/10" />
          </div>
          <h3 className="text-sm font-black text-white/40 uppercase tracking-widest mb-2">Idle Mode</h3>
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest max-w-[200px] leading-relaxed">
            Execute a request to visualize the response payload.
          </p>
        </div>
      </GlassCard>
    );
  }

  const isSuccess = response.status >= 200 && response.status < 300;
  const isJson = typeof response.data === 'object';

  return (
    <GlassCard className="flex flex-col gap-8">
      {/* Metrics Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-2">Status Code</span>
            <div className={cn(
              "flex items-center gap-2.5 font-mono font-black text-xl px-4 py-2 rounded-xl border transition-all shadow-inner",
              isSuccess ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"
            )}>
              {isSuccess ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {response.status}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-2">Latency</span>
            <div className="flex items-center gap-2.5 text-sky-400 font-mono font-black text-xl px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-xl shadow-inner">
              <Clock className="w-5 h-5" />
              {response.time}ms
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest shadow-inner">
          <Code2 className="w-3.5 h-3.5 text-primary" />
          {isJson ? 'JSON Content' : 'Raw Text / HTML'}
        </div>
      </div>

      {/* Response Body Viewport */}
      <div className="flex-1 flex flex-col min-h-[450px]">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Response Payload</span>
          </div>
          <button 
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
              copied 
                ? "bg-emerald-500 border-emerald-500 text-white" 
                : "bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary"
            )}
          >
            {copied ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : (isJson ? 'Copy JSON' : 'Copy Content')}
          </button>
        </div>
        
        <div className="flex-1 bg-[#0f172a] border border-white/10 rounded-[2rem] p-8 font-mono text-sm overflow-auto custom-scrollbar shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <pre className="!bg-transparent !m-0 !p-0 whitespace-pre-wrap break-words">
            <code 
              ref={codeRef} 
              className={cn("language-json whitespace-pre-wrap break-words", !isJson && "language-none")}
            >
              {isJson 
                ? JSON.stringify(response.data, null, 2) 
                : response.data}
            </code>
          </pre>
        </div>
      </div>
    </GlassCard>
  );
}

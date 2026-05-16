'use client';

import RequestPanel from '@/components/RequestPanel';
import ResponsePanel from '@/components/ResponsePanel';
import HistorySidebar from '@/components/HistorySidebar';
import EnvironmentManager from '@/components/EnvironmentManager';
import { Zap, Menu, Layout, Settings, Globe, ChevronRight, ChevronLeft } from 'lucide-react';
import { useRequestStore } from '@/store/useRequestStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function Home() {
  const { isSidebarOpen, setSidebarOpen } = useRequestStore();
  const [isEnvPanelOpen, setEnvPanelOpen] = useState(true);
  const hasHydrated = useHasHydrated();

  // Handle mobile initial state
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
      setEnvPanelOpen(false);
    }
  }, [setSidebarOpen]);

  if (!hasHydrated) return null;

  return (
    <main className="flex h-screen overflow-hidden selection:bg-primary/30 bg-[#020617] text-white">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px] animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      {/* 1. History Sidebar (Left) */}
      <HistorySidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 relative">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-black/20 z-20">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all mr-2 group"
                title="Open History"
              >
                <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight">ApiCred</h1>
                <span className="px-1.5 py-0.5 rounded-md bg-primary/20 text-primary text-[8px] font-black uppercase border border-primary/20">
                  v1.2.0
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">Studio Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              LIVE
            </div>
            <button
              onClick={() => setEnvPanelOpen(!isEnvPanelOpen)}
              className={cn(
                "p-2 rounded-lg transition-all border group",
                isEnvPanelOpen ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 border-white/10 text-white/40 hover:text-white"
              )}
              title={isEnvPanelOpen ? "Close Environments" : "Open Environments"}
            >
              <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 space-y-8 max-w-5xl mx-auto w-full">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Layout className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Request Configuration</h2>
            </div>
            <RequestPanel />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-secondary" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Response Output</h2>
            </div>
            <ResponsePanel />
          </section>

          {/* Page Footer */}
          <footer className="pt-10 pb-6 border-t border-white/5 text-center space-y-2">
            <p className="text-[10px] text-white/60 font-black tracking-widest uppercase">
              Professional Grade API Testing
            </p>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
              v1.2.0 • Multi-Panel Studio • {new Date().toLocaleDateString()}
            </p>
          </footer>
        </div>
      </div>

      {/* 3. Environment Panel (Right) */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-[60] w-80 lg:w-96 bg-slate-950 border-l border-white/10 transition-transform duration-500 ease-in-out lg:static lg:translate-x-0 flex flex-col shrink-0",
        isEnvPanelOpen ? "translate-x-0" : "translate-x-full lg:hidden"
      )}>
        <EnvironmentManager />
      </div>

      {/* Mobile Overlay for Environment Panel */}
      {isEnvPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setEnvPanelOpen(false)}
        />
      )}
    </main>
  );
}

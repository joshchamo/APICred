'use client';

import RequestPanel from '@/components/RequestPanel';
import ResponsePanel from '@/components/ResponsePanel';
import HistorySidebar from '@/components/HistorySidebar';
import EnvironmentManager from '@/components/EnvironmentManager';
import { Zap, Menu } from 'lucide-react';
import { useRequestStore } from '@/store/useRequestStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';

export default function Home() {
  const { isSidebarOpen, setSidebarOpen } = useRequestStore();
  const hasHydrated = useHasHydrated();

  if (!hasHydrated) return null;

  return (
    <main className="flex h-screen overflow-hidden selection:bg-primary/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-accent/10 blur-[120px] animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      <HistorySidebar />

      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        {/* Header */}
        <header className="px-4 lg:px-8 py-6 flex items-center justify-between border-b border-white/5 sticky top-0 z-10 backdrop-blur-md bg-black/10">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all mr-2"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)]">
              <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                ApiCred
              </h1>
              <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
                Professional API Testing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <EnvironmentManager />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              OPERATIONAL
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-white/40">Request Builder</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <RequestPanel />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-white/40">Response Viewer</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <ResponsePanel />
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-auto p-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/20 font-medium tracking-widest uppercase">
            Built with Next.js • Zustand • Tailwind CSS
          </p>
          <p className="text-[8px] text-white/10 mt-2 uppercase tracking-tight">
            v1.0.4 • Last Update: {new Date().toLocaleTimeString()}
          </p>
        </footer>
      </div>
    </main>
  );
}

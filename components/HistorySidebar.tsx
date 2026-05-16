import { useRequestStore, RequestHistoryItem } from '@/store/useRequestStore';
import { History, Trash2, Clock, ExternalLink, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useHasHydrated } from '@/hooks/useHasHydrated';

export default function HistorySidebar() {
  const { history, loadFromHistory, clearHistory, isSidebarOpen, setSidebarOpen } = useRequestStore();
  const hasHydrated = useHasHydrated();

  if (!hasHydrated) return null;

  return (
    <AnimatePresence mode="wait">
      {isSidebarOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed lg:relative z-40 inset-y-0 left-0 border-r border-white/5 flex flex-col h-full bg-black/40 lg:bg-black/20 backdrop-blur-2xl lg:backdrop-blur-xl shadow-2xl lg:shadow-none overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between min-w-[320px]">
            <div className="flex items-center gap-2 text-white/80 font-bold">
              <History className="w-5 h-5 text-primary" />
              History
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={clearHistory}
                className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-rose-400 transition-all"
                title="Clear History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all lg:hidden"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 min-w-[320px]">
            <AnimatePresence mode="popLayout">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-white/20 text-center">
                  <Clock className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs">No history yet</p>
                </div>
              ) : (
                history.map((item) => (
                  <motion.button
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={item.id}
                    onClick={() => {
                      loadFromHistory(item);
                      if (window.innerWidth < 1024) setSidebarOpen(false); // Close on mobile after selection
                    }}
                    className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                        item.method === 'GET' ? "bg-emerald-500/20 text-emerald-400" :
                        item.method === 'POST' ? "bg-blue-500/20 text-blue-400" :
                        "bg-amber-500/20 text-amber-400"
                      )}>
                        {item.method}
                      </span>
                      <span className="text-[10px] text-white/20">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs text-white/60 truncate font-mono mb-2">
                      {item.url}
                    </div>
                    <div className="flex items-center justify-between">
                      {item.status && (
                        <span className={cn(
                          "text-[10px] font-bold",
                          item.status < 300 ? "text-emerald-400/60" : "text-rose-400/60"
                        )}>
                          {item.status}
                        </span>
                      )}
                      <ExternalLink className="w-3 h-3 text-white/10 group-hover:text-primary transition-colors" />
                    </div>
                  </motion.button>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

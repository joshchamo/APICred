import { useRequestStore } from '@/store/useRequestStore';
import GlassCard from './GlassCard';
import { Clock, CheckCircle, AlertCircle, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ResponsePanel() {
  const { response, error, isLoading, _hasHydrated } = useRequestStore();

  if (!_hasHydrated) return null;

  if (isLoading) {
    return (
      <GlassCard className="h-[400px] flex items-center justify-center border-dashed border-white/10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-white/40 animate-pulse font-medium">Awaiting response...</p>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-3 text-red-400 mb-4">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-bold">Request Failed</h3>
        </div>
        <div className="p-4 bg-black/40 rounded-xl border border-red-500/10 font-mono text-sm text-red-300">
          {error}
        </div>
      </GlassCard>
    );
  }

  if (!response) {
    return (
      <GlassCard className="h-[400px] flex items-center justify-center border-dashed border-white/10 opacity-50">
        <div className="text-center">
          <Terminal className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 max-w-[200px]">Send a request to see the response data here.</p>
        </div>
      </GlassCard>
    );
  }

  const isSuccess = response.status >= 200 && response.status < 300;

  return (
    <GlassCard className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold mb-1">Status</span>
            <div className={cn(
              "flex items-center gap-2 font-mono font-bold text-lg",
              isSuccess ? "text-emerald-400" : "text-rose-400"
            )}>
              {isSuccess ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {response.status} {response.statusText}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold mb-1">Time</span>
            <div className="flex items-center gap-2 text-sky-400 font-mono font-bold text-lg">
              <Clock className="w-4 h-4" />
              {response.time}ms
            </div>
          </div>
        </div>

        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-white/40">
          {typeof response.data === 'object' ? 'JSON' : 'TEXT'}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Body</span>
          <button 
            onClick={() => navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))}
            className="text-[10px] text-primary hover:text-white transition-colors"
          >
            Copy JSON
          </button>
        </div>
        <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-6 font-mono text-sm overflow-auto custom-scrollbar">
          <pre className="text-emerald-300/90 whitespace-pre-wrap">
            {typeof response.data === 'object' 
              ? JSON.stringify(response.data, null, 2) 
              : response.data}
          </pre>
        </div>
      </div>
    </GlassCard>
  );
}

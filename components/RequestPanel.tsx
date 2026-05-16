import { useState } from 'react';
import { useRequestStore, HttpMethod } from '@/store/useRequestStore';
import GlassCard from './GlassCard';
import KeyValueEditor from './KeyValueEditor';
import { Send, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHasHydrated } from '@/hooks/useHasHydrated';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
type Tab = 'params' | 'headers' | 'body';

export default function RequestPanel() {
  const { 
    method, setMethod, 
    url, setUrl, 
    headers, addHeader, removeHeader, updateHeader,
    params, addParam, removeParam, updateParam,
    body, setBody,
    sendRequest, isLoading 
  } = useRequestStore();

  const [activeTab, setActiveTab] = useState<Tab>('params');
  const hasHydrated = useHasHydrated();

  if (!hasHydrated) return <GlassCard className="h-[400px] animate-pulse bg-white/5" />;

  return (
    <GlassCard className="flex flex-col gap-6">
      {/* URL Bar */}
      <div className="flex gap-2">
        <div className="relative group min-w-[120px]">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className="w-full appearance-none px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm font-bold text-primary cursor-pointer"
          >
            {METHODS.map((m) => (
              <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 group-hover:text-primary transition-colors">
            ▼
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
            <Globe className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="https://api.example.com/v1/resource"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm transition-all"
          />
        </div>

        <button
          onClick={sendRequest}
          disabled={isLoading || !url}
          className={cn(
            "px-6 py-3 bg-primary rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
            "hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
          )}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send
        </button>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex flex-col min-h-[300px]">
        <div className="flex border-b border-white/5">
          {(['params', 'headers', 'body'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3 text-sm font-medium transition-all relative",
                activeTab === tab ? "text-white" : "text-white/40 hover:text-white/60"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 py-4">
          {activeTab === 'params' && (
            <KeyValueEditor
              items={params}
              onAdd={addParam}
              onRemove={removeParam}
              onUpdate={updateParam}
            />
          )}
          {activeTab === 'headers' && (
            <KeyValueEditor
              items={headers}
              onAdd={addHeader}
              onRemove={removeHeader}
              onUpdate={updateHeader}
            />
          )}
          {activeTab === 'body' && (
            <textarea
              placeholder='{ "key": "value" }'
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-full min-h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary/50 text-sm font-mono custom-scrollbar resize-none"
            />
          )}
        </div>
      </div>
    </GlassCard>
  );
}

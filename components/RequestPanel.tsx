'use client';

import { useState } from 'react';
import { useRequestStore, HttpMethod } from '@/store/useRequestStore';
import GlassCard from './GlassCard';
import KeyValueEditor from './KeyValueEditor';
import { Send, Globe, Layers, Settings2, FileText, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
type Tab = 'params' | 'auth' | 'headers' | 'body';

export default function RequestPanel() {
  const { 
    method, setMethod, 
    url, setUrl, 
    headers, addHeader, removeHeader, updateHeader,
    params, addParam, removeParam, updateParam,
    body, setBody,
    authType, setAuthType,
    bearerToken, setBearerToken,
    sendRequest, isLoading,
    _hasHydrated
  } = useRequestStore();

  const [activeTab, setActiveTab] = useState<Tab>('params');

  if (!_hasHydrated) return <GlassCard className="h-[400px] animate-pulse bg-white/5" />;

  return (
    <GlassCard className="flex flex-col gap-8">
      {/* URL Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative group sm:min-w-[140px]">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className="w-full appearance-none px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-sm font-black text-primary cursor-pointer transition-all hover:bg-white/10"
          >
            {METHODS.map((m) => (
              <option key={m} value={m} className="bg-slate-900 text-white font-bold">{m}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-primary transition-colors scale-75">
            ▼
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors">
            <Globe className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Enter API Endpoint URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
            className="w-full pl-12 pr-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-sm font-medium transition-all hover:bg-white/[0.07]"
          />
        </div>

        <button
          onClick={sendRequest}
          disabled={isLoading || !url}
          className={cn(
            "px-8 py-3.5 bg-primary rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed",
            "shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
          )}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4 fill-current" />
          )}
          Send
        </button>
      </div>

      {/* Modern Tabs */}
      <div className="flex-1 flex flex-col min-h-[350px]">
        <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5 w-fit mb-6">
          {(['params', 'auth', 'headers', 'body'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2",
                activeTab === tab 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-white/30 hover:text-white/60 hover:bg-white/5"
              )}
            >
              {tab === 'params' && <Layers className="w-3.5 h-3.5" />}
              {tab === 'auth' && <KeyRound className="w-3.5 h-3.5" />}
              {tab === 'headers' && <Settings2 className="w-3.5 h-3.5" />}
              {tab === 'body' && <FileText className="w-3.5 h-3.5" />}
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 p-1">
          {activeTab === 'params' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <KeyValueEditor
                items={params}
                onAdd={addParam}
                onRemove={removeParam}
                onUpdate={updateParam}
              />
            </div>
          )}
          {activeTab === 'auth' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
              <div className="flex flex-col gap-2 max-w-sm">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Auth Type</label>
                <div className="relative group">
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value as 'none' | 'bearer')}
                    className="w-full appearance-none px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm font-bold text-white cursor-pointer transition-all hover:bg-white/10"
                  >
                    <option value="none" className="bg-slate-900 text-white font-bold">No Authentication</option>
                    <option value="bearer" className="bg-slate-900 text-white font-bold">Bearer Token</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 scale-75">
                    ▼
                  </div>
                </div>
              </div>

              {authType === 'bearer' ? (
                <div className="space-y-4 max-w-xl animate-in fade-in duration-200">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Bearer Token</label>
                      <span className="text-[8px] text-white/25 uppercase font-bold tracking-widest font-mono">Supports {"{{variables}}"}</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter token value or variable (e.g. {{myToken}})..."
                      value={bearerToken}
                      onChange={(e) => setBearerToken(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm font-medium transition-all shadow-inner"
                    />
                  </div>
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-[10px] text-white/40 leading-relaxed font-bold">
                    This bearer token is automatically injected as the <span className="text-primary font-black">Authorization</span> header before the request is executed. You do not need to set it manually in the Headers tab!
                  </div>
                </div>
              ) : (
                <div className="p-10 border border-dashed border-white/5 bg-white/[0.01] rounded-2xl text-center opacity-30">
                  <KeyRound className="w-10 h-10 mx-auto mb-4 text-white" />
                  <p className="text-xs font-bold uppercase tracking-wider">No authentication required for this request.</p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'headers' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <KeyValueEditor
                items={headers}
                onAdd={addHeader}
                onRemove={removeHeader}
                onUpdate={updateHeader}
              />
            </div>
          )}
          {activeTab === 'body' && (
            <div className="h-full min-h-[250px] animate-in fade-in slide-in-from-bottom-2 duration-300">
              <textarea
                placeholder='{ "key": "value" }'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-full bg-black/40 border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-primary/50 text-sm font-mono custom-scrollbar resize-none shadow-inner"
              />
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

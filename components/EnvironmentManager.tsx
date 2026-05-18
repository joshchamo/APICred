'use client';

import { useState, useEffect } from 'react';
import { useRequestStore, Environment, KeyValue } from '@/store/useRequestStore';
import { Settings, Plus, Trash2, X, Check, ChevronRight, Info, AlertTriangle, ShieldAlert, Globe } from 'lucide-react';
import KeyValueEditor from './KeyValueEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EnvironmentManagerProps {
  isPermanent?: boolean;
}

export default function EnvironmentManager({ isPermanent = false }: EnvironmentManagerProps) {
  const { environments, addEnvironment, removeEnvironment, updateEnvironment, activeEnvId, setActiveEnv, _hasHydrated } = useRequestStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Ensure an environment is selected for editing if they exist
  useEffect(() => {
    if (environments.length > 0) {
      const exists = environments.find(e => e.id === editingId);
      if (!editingId || !exists) {
        setEditingId(environments[0].id);
      }
    }
  }, [environments, editingId]);

  const handleCreateEnv = () => {
    const name = prompt('Enter Environment Name:');
    if (!name) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (environments.some(e => e.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert('An environment with this name already exists.');
      return;
    }
    addEnvironment(trimmedName);
  };

  const selectedEnv = environments.find(e => e.id === editingId) || (environments.length > 0 ? environments[0] : null);

  if (!_hasHydrated) return null;

  return (
    <div className="flex flex-col h-full bg-[#020617]/50">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Environments</h2>
            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Global Variables</p>
          </div>
        </div>
        <button
          onClick={handleCreateEnv}
          className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg transition-all border border-primary/20"
          title="New Environment"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Selector (Horizontal Scroll) */}
      <div className="p-4 border-b border-white/5 bg-black/20">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Saved Profiles</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {environments.map(env => (
            <button
              key={env.id}
              onClick={() => {
                setEditingId(env.id);
                setActiveEnv(env.id); // Sync with active environment for requests
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border flex items-center gap-2",
                activeEnvId === env.id 
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white"
              )}
            >
              {env.name}
              {activeEnvId === env.id && <Check className="w-2.5 h-2.5" />}
            </button>
          ))}
          {environments.length === 0 && (
            <p className="text-[9px] text-white/10 italic p-2">No profiles created.</p>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {selectedEnv ? (
          <div className="space-y-8">
            {/* Identity & Delete */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Active Profile</label>
                <button
                  onClick={() => {
                    if (confirm(`Delete environment "${selectedEnv.name}"?`)) {
                      removeEnvironment(selectedEnv.id);
                      setEditingId(null);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-[9px] font-black rounded-lg transition-all border border-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  DELETE
                </button>
              </div>
              <input
                type="text"
                value={selectedEnv.name}
                onChange={(e) => updateEnvironment(selectedEnv.id, e.target.value, selectedEnv.variables)}
                className="w-full bg-white/5 px-4 py-2.5 rounded-xl text-base font-black text-white focus:outline-none border border-white/10 focus:border-primary/50 transition-all shadow-inner"
              />
            </div>

            {/* Variable List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[9px] font-black text-white/20 uppercase tracking-widest">Variables</h3>
                <span className="text-[8px] text-white/10">{selectedEnv.variables.length} keys</span>
              </div>
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                <KeyValueEditor
                  items={selectedEnv.variables}
                  onAdd={() => {
                    updateEnvironment(selectedEnv.id, selectedEnv.name, [...selectedEnv.variables, { id: Math.random().toString(36).substring(2, 9), key: '', value: '', enabled: true }]);
                  }}
                  onRemove={(id) => {
                    updateEnvironment(selectedEnv.id, selectedEnv.name, selectedEnv.variables.filter(v => v.id !== id));
                  }}
                  onUpdate={(id, field, val) => {
                    const newVars = selectedEnv.variables.map(v => v.id === id ? { ...v, [field]: val } : v);
                    updateEnvironment(selectedEnv.id, selectedEnv.name, newVars);
                  }}
                />
              </div>
            </div>

            {/* Hint */}
            <div className="p-5 bg-primary/5 rounded-[2rem] border border-primary/20 space-y-4 shadow-xl shadow-primary/5">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-primary" />
                <p className="text-xs font-black text-white uppercase tracking-wider">Environment Injection</p>
              </div>
              <p className="text-xs text-white/50 leading-relaxed font-bold">
                Wrap your variable keys in <span className="text-primary font-black">{"{{ ... }}"}</span> to inject them into any request field.
              </p>

              {/* Collapsible Guide */}
              <details className="group border border-white/10 rounded-2xl overflow-hidden bg-black/40 transition-all duration-300">
                <summary className="px-4 py-3 text-[11px] font-black text-white/45 hover:text-white uppercase tracking-widest cursor-pointer select-none flex items-center justify-between transition-colors bg-white/[0.02] hover:bg-white/5">
                  <span>Usage & Examples Guide</span>
                  <span className="transition-transform duration-300 group-open:rotate-180 text-[8px] text-white/30">▼</span>
                </summary>
                <div className="p-5 border-t border-white/5 text-[11px] text-white/40 space-y-5 leading-relaxed font-medium bg-black/25">
                  <div className="space-y-2">
                    <p className="font-black text-white/60 text-[11px] uppercase tracking-wider">Example 1: PokéAPI</p>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1 font-mono text-[11px] text-white/30">
                      <div><span className="text-primary font-bold">Key:</span> baseURL</div>
                      <div><span className="text-primary font-bold">Value:</span> https://pokeapi.co/api/v2</div>
                      <div className="pt-2 border-t border-white/5 text-white/50">
                        <span className="text-emerald-400 font-bold">URL:</span> {"{{baseURL}}"} /pokemon/ditto
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-black text-white/60 text-[11px] uppercase tracking-wider">Example 2: Mock Users API</p>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1 font-mono text-[11px] text-white/30">
                      <div><span className="text-primary font-bold">Key:</span> host</div>
                      <div><span className="text-primary font-bold">Value:</span> https://jsonplaceholder.typicode.com</div>
                      <div><span className="text-primary font-bold">Key:</span> id</div>
                      <div><span className="text-primary font-bold">Value:</span> 1</div>
                      <div className="pt-2 border-t border-white/5 text-white/50">
                        <span className="text-emerald-400 font-bold">URL:</span> {"{{host}}"} /users/ {"{{id}}"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-black text-white/60 text-[11px] uppercase tracking-wider">Example 3: Query Parameter Inject</p>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 font-mono text-[11px] text-white/30">
                      <div><span className="text-primary font-bold">Key:</span> limit</div>
                      <div><span className="text-primary font-bold">Value:</span> 10</div>
                      <div className="pt-2 border-t border-white/5 text-white/50 leading-normal">
                        Use in <span className="text-sky-400 font-bold">Params Tab</span>:<br />
                        <span className="text-white/60">Key:</span> limit $\rightarrow$ <span className="text-white/60">Value:</span> {"{{limit}}"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-black text-white/60 text-[11px] uppercase tracking-wider">Dynamic Variables (Postman Style)</p>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 font-mono text-[11px] text-white/30 leading-normal">
                      <p className="text-[11px] text-white/50 mb-2 font-sans font-bold">Inject mock data directly without setting any keys! Prefix with <span className="text-primary font-black">$</span>:</p>
                      <div className="grid grid-cols-2 gap-1 py-1 border-b border-white/5">
                        <span className="text-primary font-bold">{"{{$randomUUID}}"}</span>
                        <span className="text-white/50 italic">Unique UUID v4</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 py-1 border-b border-white/5">
                        <span className="text-primary font-bold">{"{{$randomEmail}}"}</span>
                        <span className="text-white/50 italic">Mock Email</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 py-1 border-b border-white/5">
                        <span className="text-primary font-bold">{"{{$timestamp}}"}</span>
                        <span className="text-white/50 italic">UNIX Timestamp</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 py-1 border-b border-white/5">
                        <span className="text-primary font-bold">{"{{$randomName}}"}</span>
                        <span className="text-white/50 italic">Full Name</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 py-1 border-b border-white/5">
                        <span className="text-primary font-bold">{"{{$randomInt}}"}</span>
                        <span className="text-white/50 italic">Int [0-999]</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 py-1 border-b border-white/5">
                        <span className="text-primary font-bold">{"{{$randomBool}}"}</span>
                        <span className="text-white/50 italic">true / false</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 py-1">
                        <span className="text-primary font-bold">{"{{$randomPhone}}"}</span>
                        <span className="text-white/50 italic">Phone Number</span>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-20">
            <Globe className="w-12 h-12 mb-4" />
            <p className="text-xs font-bold">No Environment Selected</p>
          </div>
        )}
      </div>

      {/* Global Action Footer */}
      <div className="p-6 border-t border-white/5 bg-black/20">
        <button
          onClick={() => {
            if (confirm('Nuclear Reset: Clear all data and refresh?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="w-full py-3 border border-white/5 hover:border-rose-500/30 rounded-xl text-[9px] font-black text-white/10 hover:text-rose-500 transition-all uppercase tracking-widest"
        >
          Factory Reset App
        </button>
      </div>
    </div>
  );
}

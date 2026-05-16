'use client';

import { useState, useEffect } from 'react';
import { useRequestStore, Environment, KeyValue } from '@/store/useRequestStore';
import { Settings, Plus, Trash2, X, Check, ChevronRight, Info, AlertTriangle } from 'lucide-react';
import KeyValueEditor from './KeyValueEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHasHydrated } from '@/hooks/useHasHydrated';

export default function EnvironmentManager() {
  const [isOpen, setIsOpen] = useState(false);
  const { environments, addEnvironment, removeEnvironment, updateEnvironment, activeEnvId, setActiveEnv } = useRequestStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const hasHydrated = useHasHydrated();

  useEffect(() => {
    console.log('ApiCred Environment Manager v1.0.5 Loaded');
  }, []);

  // Force selection of an environment if none is selected but they exist
  useEffect(() => {
    if (isOpen && environments.length > 0) {
      const exists = environments.find(e => e.id === editingId);
      if (!editingId || !exists) {
        setEditingId(environments[0].id);
      }
    }
  }, [isOpen, environments, editingId]);

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

  if (!hasHydrated) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={activeEnvId || ''}
            onChange={(e) => setActiveEnv(e.target.value || null)}
            className="appearance-none pl-3 pr-8 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/60 focus:outline-none focus:border-primary/40 cursor-pointer hover:bg-white/10 transition-all"
          >
            <option value="" className="bg-slate-900">No Environment</option>
            {environments.map(env => (
              <option key={env.id} value={env.id} className="bg-slate-900">{env.name}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 scale-75">
            ▼
          </div>
        </div>
        
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "p-1.5 rounded-full border transition-all",
            isOpen 
              ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]" 
              : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
          )}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-[#020617] shadow-2xl border-l border-white/10 flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Environments</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Global Variables</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCreateEnv}
                    className="flex items-center gap-2 px-3 py-2 bg-primary rounded-lg text-white text-[10px] font-black tracking-widest hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-4 h-4" />
                    ADD
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                {/* Tabs */}
                <div className="p-5 border-b border-white/5 bg-black/40 shrink-0">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-4">Saved Profiles</span>
                  <div className="flex flex-wrap gap-2">
                    {environments.map(env => (
                      <button
                        key={env.id}
                        onClick={() => setEditingId(env.id)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs font-black transition-all border",
                          editingId === env.id 
                            ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                            : "bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white"
                        )}
                      >
                        {env.name}
                      </button>
                    ))}
                    {environments.length === 0 && (
                      <div className="w-full py-8 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                        <p className="text-[10px] text-white/20 font-bold">No environments found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Editor Section */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gradient-to-b from-transparent to-white/[0.02]">
                  {editingId && environments.find(e => e.id === editingId) ? (
                    <div className="space-y-8 pb-10">
                      {/* Name & Delete */}
                      <div className="space-y-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Profile Name</label>
                          <button
                            onClick={() => {
                              if (confirm('Delete this environment and all its variables?')) {
                                removeEnvironment(editingId);
                                setEditingId(null);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 text-white text-[10px] font-black rounded-lg hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            DELETE PROFILE
                          </button>
                        </div>
                        <input
                          type="text"
                          value={environments.find(e => e.id === editingId)?.name || ''}
                          onChange={(e) => {
                            const env = environments.find(ev => ev.id === editingId);
                            if (env) updateEnvironment(editingId, e.target.value, env.variables);
                          }}
                          className="w-full bg-black/40 px-4 py-3 rounded-xl text-lg font-black text-white focus:outline-none border border-white/10 focus:border-primary/50 transition-all"
                        />
                      </div>

                      {/* Variables List */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Variables</h3>
                        </div>
                        <div className="bg-black/40 rounded-3xl p-4 border border-white/10 shadow-inner">
                          <KeyValueEditor
                            items={environments.find(e => e.id === editingId)?.variables || []}
                            onAdd={() => {
                              const env = environments.find(e => e.id === editingId);
                              if (env) updateEnvironment(editingId, env.name, [...env.variables, { id: Math.random().toString(36).substring(2, 9), key: '', value: '', enabled: true }]);
                            }}
                            onRemove={(id) => {
                              const env = environments.find(e => e.id === editingId);
                              if (env) updateEnvironment(editingId, env.name, env.variables.filter(v => v.id !== id));
                            }}
                            onUpdate={(id, field, val) => {
                              const env = environments.find(e => e.id === editingId);
                              if (env) {
                                const newVars = env.variables.map(v => v.id === id ? { ...v, [field]: val } : v);
                                updateEnvironment(editingId, env.name, newVars);
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className="p-5 bg-primary/10 rounded-3xl border border-primary/20 flex gap-4 shadow-xl shadow-primary/5">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shrink-0">
                          <Info className="w-5 h-5 text-white" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] text-white font-bold tracking-tight">How to use variables:</p>
                          <p className="text-[10px] text-white/50 leading-relaxed">
                            Type <span className="text-primary font-black">{"{{name}}"}</span> in any input field to inject the value from your active environment profile.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center px-10">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center border border-white/10 mb-8 shadow-2xl">
                        <Settings className="w-12 h-12 text-white/5" />
                      </div>
                      <h3 className="text-lg font-black text-white mb-3 tracking-tight">Environment Profiles</h3>
                      <p className="text-xs text-white/30 leading-relaxed mb-10 max-w-[260px]">
                        Switch between development, staging, and production variables with a single click.
                      </p>
                      <button
                        onClick={handleCreateEnv}
                        className="px-12 py-4 bg-primary rounded-2xl text-[10px] font-black tracking-[0.2em] text-white hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all active:scale-95 shadow-2xl shadow-primary/30"
                      >
                        CREATE FIRST PROFILE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

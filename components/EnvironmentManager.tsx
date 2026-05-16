'use client';

import { useState, useEffect } from 'react';
import { useRequestStore, Environment, KeyValue } from '@/store/useRequestStore';
import { Settings, Plus, Trash2, X, Check, ChevronRight, Info } from 'lucide-react';
import KeyValueEditor from './KeyValueEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHasHydrated } from '@/hooks/useHasHydrated';

export default function EnvironmentManager() {
  const [isOpen, setIsOpen] = useState(false);
  const { environments, addEnvironment, removeEnvironment, updateEnvironment, activeEnvId, setActiveEnv } = useRequestStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const hasHydrated = useHasHydrated();

  // Ensure an environment is selected if any exist
  useEffect(() => {
    if (isOpen && environments.length > 0 && !editingId) {
      setEditingId(environments[0].id);
    }
  }, [isOpen, environments, editingId]);

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
              ? "bg-primary/20 border-primary text-primary" 
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
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-[#0f172a] shadow-2xl border-l border-white/10 flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Environments</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Global Variables</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const name = prompt('Environment Name') || 'New Environment';
                      addEnvironment(name);
                    }}
                    className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary transition-all"
                    title="Add Environment"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="p-2 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Container */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Environment Tabs */}
                <div className="p-4 border-b border-white/10 bg-black/20 shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Saved Environments</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {environments.map(env => (
                      <button
                        key={env.id}
                        onClick={() => setEditingId(env.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                          editingId === env.id 
                            ? "bg-primary border-primary text-white" 
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {env.name}
                      </button>
                    ))}
                    {environments.length === 0 && (
                      <div className="w-full py-4 text-center border border-dashed border-white/10 rounded-xl">
                        <p className="text-[10px] text-white/20">No environments found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Editor Section */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  {editingId && environments.find(e => e.id === editingId) ? (
                    <div className="space-y-8 pb-10">
                      {/* Name Input */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Environment Name</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={environments.find(e => e.id === editingId)?.name || ''}
                            onChange={(e) => {
                              const env = environments.find(ev => ev.id === editingId);
                              if (env) updateEnvironment(editingId, e.target.value, env.variables);
                            }}
                            className="flex-1 bg-white/5 px-4 py-2.5 rounded-xl text-lg font-bold focus:outline-none border border-white/10 focus:border-primary/50 transition-all"
                          />
                          <button
                            onClick={() => {
                              if (confirm('Delete this environment?')) {
                                removeEnvironment(editingId);
                                setEditingId(null);
                              }
                            }}
                            className="p-3 text-white/20 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all border border-transparent hover:border-rose-400/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Variables List */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Variables</h3>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-2 border border-white/5">
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

                      {/* Tip */}
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3">
                        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                          Use <span className="text-white font-bold">{"{{variable_name}}"}</span> anywhere in your requests. Values are automatically injected from the active environment.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center px-10">
                      <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 mb-6 shadow-2xl">
                        <Plus className="w-8 h-8 text-white/10" />
                      </div>
                      <h3 className="text-sm font-bold text-white mb-2">Ready to scale?</h3>
                      <p className="text-xs text-white/30 leading-relaxed mb-8">
                        Create environments to manage different sets of variables for development, staging, and production.
                      </p>
                      <button
                        onClick={() => {
                          const name = prompt('Environment Name') || 'New Environment';
                          addEnvironment(name);
                        }}
                        className="px-8 py-3 bg-primary rounded-xl text-xs font-bold text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-95"
                      >
                        Create Your First Environment
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

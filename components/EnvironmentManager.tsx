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

  // Auto-select first environment if editingId is null
  useEffect(() => {
    if (environments.length > 0 && !editingId) {
      setEditingId(environments[0].id);
    }
  }, [environments, editingId]);

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
          title="Manage Environments"
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
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 shadow-2xl border-l border-white/10 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Environments</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Variable Management</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-white/10 rounded-full text-white/20 hover:text-white transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Tabs / List of Environments */}
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Saved Environments</span>
                    <button
                      onClick={() => {
                        const name = prompt('Environment Name') || 'New Environment';
                        const id = Math.random().toString(36).substring(2, 9);
                        addEnvironment(name);
                        setEditingId(id); // Attempt to select it (Zustand might need a tick)
                      }}
                      className="text-[10px] font-bold text-primary hover:text-white transition-colors bg-primary/10 px-2 py-1 rounded"
                    >
                      + ADD NEW
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {environments.map(env => (
                      <button
                        key={env.id}
                        onClick={() => setEditingId(env.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                          editingId === env.id 
                            ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                            : "bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white"
                        )}
                      >
                        {env.name}
                      </button>
                    ))}
                    {environments.length === 0 && (
                      <p className="text-[10px] text-white/20 italic">No environments created yet.</p>
                    )}
                  </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  {editingId ? (
                    <div className="space-y-8">
                      {/* Env Title & Delete */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Name</span>
                          <input
                            type="text"
                            value={environments.find(e => e.id === editingId)?.name || ''}
                            onChange={(e) => {
                              const env = environments.find(ev => ev.id === editingId);
                              if (env) updateEnvironment(editingId, e.target.value, env.variables);
                            }}
                            className="bg-white/5 w-full px-3 py-2 rounded-lg text-lg font-bold focus:outline-none border border-white/10 focus:border-primary/50 transition-all"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Delete this environment?')) {
                              removeEnvironment(editingId);
                              setEditingId(null);
                            }
                          }}
                          className="mt-6 p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Delete Environment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variables Editor */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Global Variables</h3>
                        </div>
                        <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
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
                      
                      {/* Usage Tip */}
                      <div className="p-4 bg-sky-500/5 rounded-2xl border border-sky-500/10 flex gap-3">
                        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-sky-400/80 leading-relaxed font-medium">
                          Defined variables can be injected into any field using the <span className="text-white font-bold">{"{{key}}"}</span> syntax. 
                          <br/>Example: <span className="text-white font-mono">{"{{base_url}}"}</span>/users
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white/20 text-center space-y-6 px-10">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5 animate-pulse">
                        <Settings className="w-10 h-10 opacity-20" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-white/40">No Environment Selected</p>
                        <p className="text-[10px] leading-relaxed">
                          Click on a saved environment above or create a new one to manage your variables.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const name = prompt('Environment Name') || 'New Environment';
                          addEnvironment(name);
                        }}
                        className="px-6 py-2 bg-primary/20 border border-primary/40 rounded-full text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all"
                      >
                        Create First Environment
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

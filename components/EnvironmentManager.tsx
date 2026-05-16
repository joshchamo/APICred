'use client';

import { useState } from 'react';
import { useRequestStore, Environment, KeyValue } from '@/store/useRequestStore';
import { Settings, Plus, Trash2, X, Check, ChevronRight } from 'lucide-react';
import KeyValueEditor from './KeyValueEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHasHydrated } from '@/hooks/useHasHydrated';

export default function EnvironmentManager() {
  const [isOpen, setIsOpen] = useState(false);
  const { environments, addEnvironment, removeEnvironment, updateEnvironment, activeEnvId, setActiveEnv } = useRequestStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const hasHydrated = useHasHydrated();

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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
            />
            
            {/* Side Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Environments</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Global Variables</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                {/* List of Environments */}
                <div className="p-4 space-y-2 border-b border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Saved Environments</span>
                    <button
                      onClick={() => {
                        const name = prompt('Environment Name') || 'New Environment';
                        addEnvironment(name);
                      }}
                      className="text-[10px] font-bold text-primary hover:text-white transition-colors"
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
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                          editingId === env.id 
                            ? "bg-primary border-primary text-white" 
                            : "bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white"
                        )}
                      >
                        {env.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  {editingId ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={environments.find(e => e.id === editingId)?.name || ''}
                          onChange={(e) => {
                            const env = environments.find(ev => ev.id === editingId);
                            if (env) updateEnvironment(editingId, e.target.value, env.variables);
                          }}
                          className="bg-transparent text-xl font-bold focus:outline-none border-b border-transparent focus:border-primary/50 transition-all pb-1 w-full"
                        />
                        <button
                          onClick={() => {
                            if (confirm('Delete this environment?')) {
                              removeEnvironment(editingId);
                              setEditingId(null);
                            }
                          }}
                          className="ml-4 text-white/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Variables</h3>
                        <div className="bg-black/20 rounded-xl p-2 border border-white/5">
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
                      
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-[10px] text-white/40 leading-relaxed italic">
                          Variables defined here can be used in your URL, headers, or body using the <span className="text-primary font-bold">{"{{key}}"}</span> syntax.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white/20 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <Settings className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="text-xs max-w-[200px]">Select an environment to view and edit its global variables.</p>
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

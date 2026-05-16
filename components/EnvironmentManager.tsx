'use client';

import { useState } from 'react';
import { useRequestStore, Environment, KeyValue } from '@/store/useRequestStore';
import { Settings, Plus, Trash2, X, Check } from 'lucide-react';
import GlassCard from './GlassCard';
import KeyValueEditor from './KeyValueEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function EnvironmentManager() {
  const [isOpen, setIsOpen] = useState(false);
  const { environments, addEnvironment, removeEnvironment, updateEnvironment, activeEnvId, setActiveEnv } = useRequestStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeEnv = environments.find(e => e.id === activeEnvId) || null;

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
          className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
          title="Manage Environments"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <GlassCard className="w-full max-w-2xl relative z-10 max-h-[75vh] flex flex-col p-0 overflow-hidden border-white/20">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Environments</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Global Variables Management</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-48 border-r border-white/10 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-white/5">
                  {environments.map(env => (
                    <button
                      key={env.id}
                      onClick={() => setEditingId(env.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all group flex items-center justify-between",
                        editingId === env.id ? "bg-primary text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <span className="truncate">{env.name}</span>
                      {editingId === env.id && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const name = prompt('Environment Name') || 'New Environment';
                      addEnvironment(name);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold text-primary hover:bg-primary/10 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    NEW ENV
                  </button>
                </div>

                {/* Editor */}
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
                          className="bg-transparent text-xl font-bold focus:outline-none border-b border-transparent focus:border-primary/50 transition-all pb-1"
                        />
                        <button
                          onClick={() => {
                            if (confirm('Delete this environment?')) {
                              removeEnvironment(editingId);
                              setEditingId(null);
                            }
                          }}
                          className="text-white/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Variables</h3>
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
                      <p className="text-[10px] text-white/20 leading-relaxed">
                        Tip: Use <span className="text-primary font-bold">{"{{variable_name}}"}</span> in your URL, headers, or body to inject these values dynamically.
                      </p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white/20 text-center">
                      <Settings className="w-12 h-12 mb-4 opacity-10" />
                      <p className="text-xs max-w-[200px]">Select an environment from the sidebar to manage its variables.</p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

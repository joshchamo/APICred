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
    if (isOpen) {
      console.log('ApiCred v1.0.7: Panel Opened. Environments:', environments.length);
      if (environments.length > 0) {
        const currentEnv = environments.find(e => e.id === editingId);
        if (!editingId || !currentEnv) {
          console.log('ApiCred v1.0.7: Auto-selecting first environment:', environments[0].id);
          setEditingId(environments[0].id);
        }
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

  const selectedEnv = environments.find(e => e.id === editingId) || (environments.length > 0 ? environments[0] : null);

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

              {/* Body */}
              <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
                {/* Profile List */}
                <div className="p-5 border-b border-white/5 bg-black/40">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-4">Saved Profiles</span>
                  <div className="flex flex-wrap gap-2">
                    {environments.map(env => (
                      <button
                        key={env.id}
                        onClick={() => {
                          console.log('ApiCred v1.0.6: Selected Env:', env.id);
                          setEditingId(env.id);
                        }}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs font-black transition-all border",
                          (editingId === env.id || (editingId === null && env.id === selectedEnv?.id))
                            ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                            : "bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white"
                        )}
                      >
                        {env.name}
                      </button>
                    ))}
                    {environments.length === 0 && (
                      <div className="w-full py-6 text-center border border-dashed border-white/10 rounded-2xl">
                        <p className="text-[10px] text-white/20">No profiles found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  {selectedEnv ? (
                    <div className="space-y-8 pb-10">
                      {/* Name Section */}
                      <div className="space-y-4 p-5 rounded-3xl bg-white/[0.03] border border-white/5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-2">Profile Name</label>
                            <input
                              type="text"
                              value={selectedEnv.name}
                              onChange={(e) => updateEnvironment(selectedEnv.id, e.target.value, selectedEnv.variables)}
                              className="w-full bg-black/40 px-4 py-3 rounded-xl text-lg font-black text-white focus:outline-none border border-white/10 focus:border-primary/50 transition-all"
                            />
                          </div>
                          <button
                            onClick={() => {
                              if (confirm('Delete this environment and all its variables?')) {
                                removeEnvironment(selectedEnv.id);
                                setEditingId(null);
                              }
                            }}
                            className="mt-6 p-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-xl shadow-rose-500/30 transition-all group"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>

                      {/* Variables Editor */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Environment Variables</h3>
                        </div>
                        <div className="bg-black/40 rounded-3xl p-4 border border-white/10 shadow-inner">
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

                      {/* Info Box */}
                      <div className="p-5 bg-primary/10 rounded-3xl border border-primary/20 flex gap-4 shadow-xl shadow-primary/5">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shrink-0">
                          <Info className="w-5 h-5 text-white" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] text-white font-bold tracking-tight">Pro Tip:</p>
                          <p className="text-[10px] text-white/50 leading-relaxed">
                            Inject these values into any field using <span className="text-primary font-black">{"{{key}}"}</span>. 
                            <br/>Example: <span className="text-white/30 italic">{"{{api_url}}"}</span>/v1/users
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
                        Define sets of variables for different environments and switch between them instantly.
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

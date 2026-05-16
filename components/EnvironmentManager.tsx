'use client';

import { useState, useEffect } from 'react';
import { useRequestStore, Environment, KeyValue } from '@/store/useRequestStore';
import { Settings, Plus, Trash2, X, Check, ChevronRight, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
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
      console.log('ApiCred v1.0.8: Panel Opened');
      if (environments.length > 0 && !editingId) {
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
              ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]" 
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
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-[#020617] shadow-2xl border-l border-white/10 flex flex-col h-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">Environments</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Manage Profiles & Variables</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-3 hover:bg-white/10 rounded-2xl text-white/20 hover:text-white transition-all border border-transparent hover:border-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 space-y-10">
                  
                  {/* Profiles Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black text-white/20 uppercase tracking-widest">Active Profiles</h3>
                      <button
                        onClick={handleCreateEnv}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-white text-[10px] font-black rounded-xl border border-primary/20 transition-all shadow-lg shadow-primary/10"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        NEW PROFILE
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {environments.map(env => (
                        <div key={env.id} className="relative group">
                          <button
                            onClick={() => setEditingId(env.id)}
                            className={cn(
                              "w-full px-4 py-3 rounded-2xl text-xs font-black transition-all border text-left flex items-center justify-between",
                              (editingId === env.id || (editingId === null && env.id === selectedEnv?.id))
                                ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                                : "bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white"
                            )}
                          >
                            <span className="truncate mr-2">{env.name}</span>
                            {(editingId === env.id || (editingId === null && env.id === selectedEnv?.id)) && <Check className="w-3 h-3 shrink-0" />}
                          </button>
                        </div>
                      ))}
                    </div>
                    {environments.length === 0 && (
                      <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
                        <p className="text-xs text-white/20 font-bold mb-4">No profiles created yet</p>
                        <button onClick={handleCreateEnv} className="text-primary text-[10px] font-black underline hover:text-white transition-colors">Create First Profile</button>
                      </div>
                    )}
                  </section>

                  {/* Editor Section */}
                  <AnimatePresence mode="wait">
                    {selectedEnv ? (
                      <motion.section
                        key={selectedEnv.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                      >
                        <div className="h-px bg-white/5" />
                        
                        {/* Profile Identity & Global Delete */}
                        <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Profile Settings</h4>
                            <button
                              onClick={() => {
                                if (confirm('PERMANENTLY DELETE this profile and all its variables?')) {
                                  removeEnvironment(selectedEnv.id);
                                  setEditingId(null);
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white text-[10px] font-black rounded-xl border border-rose-500/20 transition-all shadow-xl shadow-rose-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              DELETE PROFILE
                            </button>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-tighter">Display Name</p>
                            <input
                              type="text"
                              value={selectedEnv.name}
                              onChange={(e) => updateEnvironment(selectedEnv.id, e.target.value, selectedEnv.variables)}
                              className="w-full bg-black/60 px-5 py-4 rounded-2xl text-xl font-black text-white focus:outline-none border border-white/10 focus:border-primary/50 transition-all shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Variables Editor */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global Variables</h4>
                            <span className="text-[9px] text-white/10 font-bold">{selectedEnv.variables.length} Items</span>
                          </div>
                          <div className="bg-black/60 rounded-[2.5rem] p-6 border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
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

                        {/* Usage Guide */}
                        <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 flex gap-5 items-start">
                          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                            <ShieldAlert className="w-6 h-6 text-white" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-white font-black">Injection Syntax</p>
                            <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                              Type <span className="text-primary font-black">{"{{variable_name}}"}</span> anywhere in your requests to inject these values dynamically.
                            </p>
                          </div>
                        </div>
                      </motion.section>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-8 border-t border-white/5 bg-white/[0.02] shrink-0">
                <button
                  onClick={() => {
                    if (confirm('DANGER: This will wipe ALL environment profiles. This action cannot be undone.')) {
                      localStorage.removeItem('api-request-store');
                      window.location.reload();
                    }
                  }}
                  className="w-full py-4 border border-white/5 hover:border-rose-500/50 rounded-2xl text-[9px] font-black text-white/10 hover:text-rose-500 transition-all uppercase tracking-[0.2em]"
                >
                  Clear All Application Data
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

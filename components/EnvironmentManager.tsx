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
          <div className="p-2 bg-primary/20 rounded-lg">
            <Globe className="w-5 h-5 text-primary" />
          </div>
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
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                <p className="text-[10px] text-white font-black">Environment Injection</p>
              </div>
              <p className="text-[9px] text-white/30 leading-relaxed">
                Wrap your variable keys in <span className="text-primary">{"{{ ... }}"}</span> to inject them into any request field.
              </p>
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

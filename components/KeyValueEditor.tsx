import { Plus, Trash2 } from 'lucide-react';
import { KeyValue } from '@/store/useRequestStore';

interface KeyValueEditorProps {
  items: KeyValue[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: 'key' | 'value' | 'enabled', val: string | boolean) => void;
}

export default function KeyValueEditor({ items, onAdd, onRemove, onUpdate }: KeyValueEditorProps) {
  return (
    <div className="space-y-2 mt-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 group">
          <input
            type="checkbox"
            checked={item.enabled}
            onChange={(e) => onUpdate(item.id, 'enabled', e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary"
          />
          <input
            type="text"
            placeholder="Key"
            value={item.key}
            onChange={(e) => onUpdate(item.id, 'key', e.target.value)}
            className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:border-primary/50 text-sm"
          />
          <input
            type="text"
            placeholder="Value"
            value={item.value}
            onChange={(e) => onUpdate(item.id, 'value', e.target.value)}
            className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:border-primary/50 text-sm"
          />
          <button
            onClick={() => onRemove(item.id)}
            className="p-1.5 text-white/20 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors mt-2"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Row
      </button>
    </div>
  );
}

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface KeyValue {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
}

export interface Environment {
  id: string;
  name: string;
  variables: KeyValue[];
}

export interface RequestHistoryItem {
  id: string;
  method: HttpMethod;
  url: string;
  headers: KeyValue[];
  params: KeyValue[];
  body: string;
  timestamp: number;
  status?: number;
  response?: RequestResponse;
}

interface RequestState {
  // Request Config
  method: HttpMethod;
  url: string;
  headers: KeyValue[];
  params: KeyValue[];
  body: string;
  
  // UI State
  isLoading: boolean;
  response: RequestResponse | null;
  error: string | null;
  isSidebarOpen: boolean;
  _hasHydrated: boolean; // Native hydration tracking
  
  // History
  history: RequestHistoryItem[];

  // Environments
  environments: Environment[];
  activeEnvId: string | null;

  // Actions
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setHeaders: (headers: KeyValue[]) => void;
  setParams: (params: KeyValue[]) => void;
  setBody: (body: string) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setHasHydrated: (val: boolean) => void; // Hydration action
  
  addHeader: () => void;
  removeHeader: (id: string) => void;
  updateHeader: (id: string, field: 'key' | 'value' | 'enabled', val: string | boolean) => void;
  
  addParam: () => void;
  removeParam: (id: string) => void;
  updateParam: (id: string, field: 'key' | 'value' | 'enabled', val: string | boolean) => void;

  // Environment Actions
  setActiveEnv: (id: string | null) => void;
  addEnvironment: (name: string) => void;
  removeEnvironment: (id: string) => void;
  updateEnvironment: (id: string, name: string, variables: KeyValue[]) => void;

  sendRequest: () => Promise<void>;
  loadFromHistory: (item: RequestHistoryItem) => void;
  clearHistory: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const replaceVariables = (text: string, env: Environment | null): string => {
  if (!text || !env) return text;
  let result = text;
  env.variables.forEach(v => {
    if (v.enabled && v.key) {
      const regex = new RegExp(`{{${v.key}}}`, 'g');
      result = result.replace(regex, v.value);
    }
  });
  return result;
};

export const useRequestStore = create<RequestState>()(
  persist(
    (set, get) => ({
      method: 'GET',
      url: '',
      headers: [{ id: generateId(), key: 'Content-Type', value: 'application/json', enabled: true }],
      params: [{ id: generateId(), key: '', value: '', enabled: true }],
      body: '',
      isLoading: false,
      response: null,
      error: null,
      isSidebarOpen: true,
      _hasHydrated: false,
      history: [],
      environments: [],
      activeEnvId: null,

      setMethod: (method) => set({ method }),
      setUrl: (url) => set({ url }),
      setHeaders: (headers) => set({ headers }),
      setParams: (params) => set({ params }),
      setBody: (body) => set({ body }),
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),

      addHeader: () => set((state) => ({ 
        headers: [...state.headers, { id: generateId(), key: '', value: '', enabled: true }] 
      })),
      removeHeader: (id) => set((state) => ({ 
        headers: state.headers.filter((h) => h.id !== id) 
      })),
      updateHeader: (id, field, val) => set((state) => ({
        headers: state.headers.map((h) => h.id === id ? { ...h, [field]: val } : h)
      })),

      addParam: () => set((state) => ({ 
        params: [...state.params, { id: generateId(), key: '', value: '', enabled: true }] 
      })),
      removeParam: (id) => set((state) => ({ 
        params: state.params.filter((p) => p.id !== id) 
      })),
      updateParam: (id, field, val) => set((state) => ({
        params: state.params.map((p) => p.id === id ? { ...p, [field]: val } : p)
      })),

      setActiveEnv: (activeEnvId) => set({ activeEnvId }),
      addEnvironment: (name) => set((state) => ({
        environments: [...state.environments, { id: generateId(), name, variables: [{ id: generateId(), key: '', value: '', enabled: true }] }]
      })),
      removeEnvironment: (id) => set((state) => ({
        environments: state.environments.filter(e => e.id !== id),
        activeEnvId: state.activeEnvId === id ? null : state.activeEnvId
      })),
      updateEnvironment: (id, name, variables) => set((state) => ({
        environments: state.environments.map(e => e.id === id ? { ...e, name, variables } : e)
      })),

      sendRequest: async () => {
        const { method, url, headers, params, body, activeEnvId, environments } = get();
        if (!url) return;

        set({ isLoading: true, error: null, response: null });

        const activeEnv = environments.find(e => e.id === activeEnvId) || null;
        const processText = (t: string) => replaceVariables(t, activeEnv);

        const startTime = Date.now();

        try {
          const processedUrl = processText(url);
          const enabledParams = params.filter(p => p.enabled && p.key);
          const queryString = enabledParams.length > 0 
            ? '?' + enabledParams.map(p => {
                const k = processText(p.key);
                const v = processText(p.value);
                return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
              }).join('&')
            : '';
          
          const fullUrl = processedUrl.includes('?') ? `${processedUrl}&${queryString.slice(1)}` : `${processedUrl}${queryString}`;

          const headerObj: Record<string, string> = {};
          headers.filter(h => h.enabled && h.key).forEach(h => {
            headerObj[processText(h.key)] = processText(h.value);
          });

          const processedBody = processText(body);

          const proxyResponse = await fetch('/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetUrl: fullUrl,
              method,
              headers: headerObj,
              body: ['GET', 'HEAD'].includes(method) ? undefined : processedBody
            })
          });

          const result = await proxyResponse.json();
          const endTime = Date.now();

          if (proxyResponse.ok) {
            const newResponse = {
              status: result.status,
              statusText: result.statusText,
              headers: result.headers,
              data: result.data,
              time: endTime - startTime
            };

            set((state) => ({ 
              response: newResponse,
              isLoading: false,
              history: [
                {
                  id: generateId(),
                  method,
                  url,
                  headers: JSON.parse(JSON.stringify(headers)),
                  params: JSON.parse(JSON.stringify(params)),
                  body,
                  timestamp: Date.now(),
                  status: result.status,
                  response: newResponse
                },
                ...state.history.slice(0, 49)
              ]
            }));
          } else {
            set({ error: result.error || 'Failed to execute request', isLoading: false });
          }
        } catch (err: any) {
          set({ error: err.message || 'Network error', isLoading: false });
        }
      },

      loadFromHistory: (item) => {
        set({ 
          method: item.method, 
          url: item.url,
          headers: JSON.parse(JSON.stringify(item.headers || [])),
          params: JSON.parse(JSON.stringify(item.params || [])),
          body: item.body || '',
          response: item.response ? JSON.parse(JSON.stringify(item.response)) : null,
          error: null,
          isLoading: false // Reset loading state when loading from history
        });
      },

      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'apicred-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ 
        method: state.method,
        url: state.url,
        headers: state.headers,
        params: state.params,
        body: state.body,
        history: state.history,
        environments: state.environments,
        activeEnvId: state.activeEnvId,
        isSidebarOpen: state.isSidebarOpen
      }),
    }
  )
);

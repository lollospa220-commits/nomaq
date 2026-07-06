import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type TabId = 'vola-vola' | 'soggiorna' | 'drops' | 'salvati' | 'profilo';

interface AppContextType {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  savedItems: string[];
  toggleSaveItem: (id: string, itemType?: 'flight' | 'hotel') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateUUID = () => {
  // crypto.randomUUID is supported in all modern browsers and produces
  // a cryptographically secure UUID v4 — unlike Math.random().
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return 'session-' + crypto.randomUUID();
  }
  // Fallback for older environments: crypto.getRandomValues
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return 'session-' + hex;
};

export const AppStateProvider: React.FC<{
  children: React.ReactNode;
  initialTab?: TabId;
  initialSavedItems?: string[];
}> = ({ children, initialTab, initialSavedItems }) => {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab || 'vola-vola');
  const [savedItems, setSavedItems] = useState<string[]>(initialSavedItems || []);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    let sid = localStorage.getItem('nomaq_session_id');
    if (!sid) {
      sid = generateUUID();
      localStorage.setItem('nomaq_session_id', sid);
    }
    setSessionId(sid);

    // Carica i preferiti reali salvati nel DB
    fetch(`/api/saved?sessionId=${sid}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const ids = data.map((item: any) => item.item_id);
          setSavedItems(ids);
        }
      })
      .catch((err) => console.error('Error fetching saved items:', err));
  }, []);

  const toggleSaveItem = useCallback(async (id: string, itemType?: 'flight' | 'hotel') => {
    const resolvedType = itemType || (id.startsWith('hotel') ? 'hotel' : 'flight');

    // Aggiorna lo stato UI locale istantaneamente per fluidità
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

    if (!sessionId) return;

    try {
      await fetch('/api/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: id,
          itemType: resolvedType,
          sessionId,
        }),
      });
    } catch (err) {
      console.error('Error syncing saved item to DB:', err);
    }
  }, [sessionId]);

  // value memoizzato: i consumer del context non ri-renderizzano a ogni render
  // del provider (rende efficace React.memo sulle card che usano toggleSaveItem).
  const value = useMemo(
    () => ({ activeTab, setActiveTab, savedItems, toggleSaveItem }),
    [activeTab, savedItems, toggleSaveItem]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

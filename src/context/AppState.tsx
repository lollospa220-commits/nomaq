import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';

export type TabId = 'vola-vola' | 'soggiorna' | 'drops' | 'concierge' | 'profilo';

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

  // Ref specchio di savedItems: consente a toggleSaveItem di leggere lo stato
  // corrente (per il rollback) senza entrare nelle sue deps → l'identità della
  // callback resta stabile e React.memo sulle card resta efficace.
  const savedItemsRef = useRef<string[]>(savedItems);
  useEffect(() => { savedItemsRef.current = savedItems; }, [savedItems]);
  // True dopo il primo toggle utente: evita che l'idratazione iniziale dal DB
  // (che parte al mount) sovrascriva un salvataggio fatto mentre era in volo.
  const hasInteractedRef = useRef(false);

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
        // Non sovrascrivere se l'utente ha già toggolato durante la fetch: lo
        // snapshot del DB sarebbe più vecchio delle sue modifiche → le perderebbe.
        if (Array.isArray(data) && !hasInteractedRef.current) {
          const ids = data.map((item: any) => item.item_id);
          setSavedItems(ids);
        }
      })
      .catch((err) => console.error('Error fetching saved items:', err));
  }, []);

  const toggleSaveItem = useCallback(async (id: string, itemType?: 'flight' | 'hotel') => {
    // Molti id hotel dinamici NON iniziano con "hotel" (ai-hotel-, live-hotel-,
    // fallback-hotel-): un match ampio evita che item_type finisca a 'flight'.
    const resolvedType = itemType || (/hotel/.test(id) ? 'hotel' : 'flight');
    hasInteractedRef.current = true;

    // Snapshot pre-mutazione per l'eventuale rollback.
    const wasSaved = savedItemsRef.current.includes(id);

    // Aggiorna lo stato UI locale istantaneamente per fluidità.
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

    if (!sessionId) return;

    // Ripristina lo stato pre-click se la POST fallisce: senza rollback la UI
    // mostrerebbe un salvataggio (o rimozione) mai persistito, che sparisce/
    // riappare al reload quando si rilegge il DB.
    const rollback = () =>
      setSavedItems((prev) => {
        const has = prev.includes(id);
        if (wasSaved && !has) return [...prev, id];
        if (!wasSaved && has) return prev.filter((item) => item !== id);
        return prev;
      });

    try {
      const res = await fetch('/api/saved', {
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
      if (!res.ok) {
        rollback();
        console.error('Save sync failed:', res.status);
      }
    } catch (err) {
      rollback();
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

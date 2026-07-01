import React, { createContext, useContext, useState, useEffect } from 'react';

export type TabId = 'vola-vola' | 'soggiorna' | 'drops' | 'salvati' | 'profilo';

interface AppContextType {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  savedItems: string[];
  toggleSaveItem: (id: string, itemType?: 'flight' | 'hotel') => void;
  drops: string[];
  addDrop: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateUUID = () => {
  return 'session-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now().toString(36);
};

export const AppStateProvider: React.FC<{
  children: React.ReactNode;
  initialTab?: TabId;
  initialSavedItems?: string[];
}> = ({ children, initialTab, initialSavedItems }) => {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab || 'vola-vola');
  const [savedItems, setSavedItems] = useState<string[]>(initialSavedItems || []);
  const [drops, setDrops] = useState<string[]>([]);
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

  const toggleSaveItem = async (id: string, itemType?: 'flight' | 'hotel') => {
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
  };

  const addDrop = (id: string) => {
    setDrops((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        savedItems,
        toggleSaveItem,
        drops,
        addDrop,
      }}
    >
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

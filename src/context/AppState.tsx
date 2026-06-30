import React, { createContext, useContext, useState } from 'react';

export type TabId = 'vola-vola' | 'soggiorna' | 'drops' | 'salvati' | 'profilo';

interface AppContextType {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  savedItems: string[];
  toggleSaveItem: (id: string) => void;
  drops: string[];
  addDrop: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{
  children: React.ReactNode;
  initialTab?: TabId;
  initialSavedItems?: string[];
}> = ({ children, initialTab, initialSavedItems }) => {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab || 'vola-vola');
  const [savedItems, setSavedItems] = useState<string[]>(initialSavedItems || []);
  const [drops, setDrops] = useState<string[]>([]);

  const toggleSaveItem = (id: string) => {
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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

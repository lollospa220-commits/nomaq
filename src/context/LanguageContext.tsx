import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Lang, TranslationKey } from '@/i18n/translations';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'nomaq_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Server and first client render always use 'it' to avoid hydration mismatch;
  // the stored preference is applied right after mount.
  const [lang, setLangState] = useState<Lang>('it');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'it' || stored === 'en') {
      setLangState(stored);
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable (private mode) — language still switches for the session
    }
  };

  const t = (key: TranslationKey) => translations[lang][key] ?? translations.it[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fail-safe default (e.g. components rendered outside the provider in tests)
    return {
      lang: 'it',
      setLang: () => {},
      t: (key: TranslationKey) => translations.it[key] ?? key,
    };
  }
  return context;
};

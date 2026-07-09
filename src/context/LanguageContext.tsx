import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { translations, Lang, TranslationKey } from '@/i18n/translations';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  // La lingua deriva dal locale dell'URL (Next i18n): coerente tra SSR e client
  // (niente hydration mismatch) e indicizzabile da Google — / = it, /en = en.
  const lang: Lang = router?.locale === 'en' ? 'en' : 'it';

  // Cambiare lingua = navigare allo stesso path nell'altro locale (l'URL è la
  // fonte di verità). scroll:false per non saltare in cima allo switch.
  const setLang = useCallback((next: Lang) => {
    if (!router || next === lang) return;
    router.push(router.asPath, router.asPath, { locale: next, scroll: false });
  }, [router, lang]);

  const t = useCallback(
    (key: TranslationKey) => translations[lang][key] ?? translations.it[key] ?? key,
    [lang]
  );

  // value memoizzato: `t` è consumato da quasi ogni componente → senza memo un
  // render del provider ri-renderizzerebbe l'intero albero anche a lingua invariata.
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fail-safe default (es. componenti resi fuori dal provider nei test)
    return {
      lang: 'it',
      setLang: () => {},
      t: (key: TranslationKey) => translations.it[key] ?? key,
    };
  }
  return context;
};

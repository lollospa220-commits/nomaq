import { useLanguage } from '@/context/LanguageContext';

/* Language Switcher (IT/EN) */
export default function LanguageSwitcher({ isDarkBackground }: { isDarkBackground?: boolean }) {
  const { lang, setLang } = useLanguage();
  return (
    <div
      className="flex items-center gap-0.5 bg-white/85 backdrop-blur-sm border border-slate-200 rounded-full p-0.5 shadow-soft"
      data-testid="language-switcher"
    >
      {(['it', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          data-testid={`lang-${l}`}
          aria-label={l === 'it' ? 'Italiano' : 'English'}
          aria-pressed={lang === l}
          className={`flex items-center justify-center min-w-[40px] px-3 py-2 rounded-full text-[11px] font-bold uppercase transition-all duration-200 ${
            lang === l
              ? 'bg-nomaq-indigo text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

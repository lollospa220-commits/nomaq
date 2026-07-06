import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ThreeSparklesIcon from '@/components/ThreeSparklesIcon';

/* FAQ section */
export default function FaqSection({ isDarkBackground }: { isDarkBackground?: boolean }) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState<number | null>(null);
  const faqs = [
    { q: t('faq1q'), a: t('faq1a') },
    { q: t('faq2q'), a: t('faq2a') },
    { q: t('faq3q'), a: t('faq3a') },
    { q: t('faq4q'), a: t('faq4a') },
    { q: t('faq5q'), a: t('faq5a') },
    { q: t('faq6q'), a: t('faq6a') },
  ];
  return (
    <section className="px-5 lg:px-6 pb-10 mt-2" data-testid="faq-section">
      <div className="flex items-center gap-2 mb-4">
        <ThreeSparklesIcon className={`w-5 h-5 ${isDarkBackground ? 'text-violet-300' : 'text-nomaq-indigo'}`} />
        <h2 className={`text-base lg:text-xl font-bold ${isDarkBackground ? 'text-white text-on-globe' : 'text-nomaq-navy'}`}>{t('faqTitle')}</h2>
      </div>
      <div className="grid gap-3 lg:grid-cols-2 lg:gap-x-6">
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <button
              key={i}
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="nomaq-card backdrop-blur-md text-left p-4 flex items-start gap-3 hover:shadow-card-hover transition-shadow duration-200"
            >
              <span className="w-7 h-7 rounded-full bg-nomaq-lavender text-nomaq-indigo flex items-center justify-center flex-shrink-0 text-xs font-bold">
                Q
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-nomaq-navy leading-snug">{faq.q}</span>
                <span
                  className={`block text-xs text-slate-500 leading-relaxed mt-1 ${isOpen ? '' : 'line-clamp-1'}`}
                >
                  {faq.a}
                </span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Custom404() {
  const { t } = useLanguage();
  return (
    <>
      <Head>
        <title>{`${t('notFoundTitle')} — Nomaq`}</title>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <main className="min-h-screen bg-mesh flex flex-col items-center justify-center p-6 text-center" data-testid="app-root">
        <div className="glass-card max-w-md w-full p-8 rounded-3xl animate-fade-in" data-testid="not-found">
          <div className="w-16 h-16 bg-nomaq-lavender rounded-2xl flex items-center justify-center mx-auto mb-6 text-nomaq-indigo text-2xl font-display">
            404
          </div>
          <h1 className="font-display text-2xl text-nomaq-navy mb-2">
            {t('notFoundTitle')}
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            {t('notFoundBody')}
          </p>
          <Link href="/" className="btn-primary inline-block text-sm py-3 px-6 rounded-xl font-bold text-white">
            {t('notFoundCta')}
          </Link>
        </div>
      </main>
    </>
  );
}

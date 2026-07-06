import React from 'react';
import Link from 'next/link';
import SEO from '@/components/SEO';

const LEGAL_PAGES = [
  { href: '/note-legali', label: 'Note legali' },
  { href: '/termini', label: 'Termini e condizioni' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/cookie-policy', label: 'Cookie policy' },
];

interface LegalLayoutProps {
  title: string;
  description: string;
  current: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function LegalH2({ first, children }: { first?: boolean; children: React.ReactNode }) {
  return (
    <h2 className={`text-base font-bold text-nomaq-navy mb-2 ${first ? 'mt-0' : 'mt-6'}`}>
      {children}
    </h2>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-500 leading-relaxed mb-3">{children}</p>;
}

export function LegalUl({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc pl-5 text-sm text-slate-500 leading-relaxed mb-3 space-y-1">
      {children}
    </ul>
  );
}

export default function LegalLayout({ title, description, current, subtitle, children }: LegalLayoutProps) {
  const otherPages = LEGAL_PAGES.filter((page) => page.href !== current);

  return (
    <>
      <SEO title={`${title} — Nomaq`} description={description} />
      <main className="min-h-screen" data-testid="legal-page">
        <div className="max-w-2xl mx-auto px-5 py-10">
          <Link href="/" className="text-nomaq-indigo font-semibold text-sm">
            ← Torna a Nomaq
          </Link>
          <h1 className="font-display text-display-md text-nomaq-navy mt-6">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          <p className="text-xs text-slate-400 mt-2 mb-6">Ultimo aggiornamento: 3 luglio 2026</p>
          <div className="nomaq-card p-6 lg:p-8">{children}</div>
          <div className="mt-6 text-xs text-slate-400">
            Altri documenti legali:{' '}
            {otherPages.map((page, index) => (
              <React.Fragment key={page.href}>
                {index > 0 && ' · '}
                <Link href={page.href} className="text-nomaq-indigo">
                  {page.label}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

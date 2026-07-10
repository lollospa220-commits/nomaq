import Head from 'next/head';
import SEO from '@/components/SEO';
import React from 'react';
import Image from 'next/image';
import { Share2, ArrowRight, Check, TrendingDown, Bell, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/i18n/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Cosa offre davvero Nomaq — nessuna promessa di funzioni non ancora attive
// (niente monitoraggio 24/7 per-utente né alert via email di price drop: la
// waitlist raccoglie solo l'email per avvisare all'apertura del servizio).
// Testi via chiavi i18n: risolti con t() in render (IT/EN da locale URL).
const FEATURES: { icon: React.ElementType; titleKey: TranslationKey; descKey: TranslationKey; color: string }[] = [
  { icon: TrendingDown, titleKey: 'wlFeat1Title', descKey: 'wlFeat1Desc', color: '#4F46E5' },
  { icon: MapPin, titleKey: 'wlFeat2Title', descKey: 'wlFeat2Desc', color: '#3B82F6' },
  { icon: Bell, titleKey: 'wlFeat3Title', descKey: 'wlFeat3Desc', color: '#7C3AED' },
];

export default function WaitlistPage() {
  const { t, lang } = useLanguage();
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [count, setCount] = React.useState(0); // Solo il conteggio reale dal DB, nessuna inflazione

  React.useEffect(() => {
    // Recupera il numero reale di iscritti salvati nel database
    fetch('/api/waitlist')
      .then((res) => res.json())
      .then((data) => {
        if (data.count !== undefined) {
          setCount(data.count); // Mostra solo i dati reali
        }
      })
      .catch(() => {
        // Fallimento silenzioso se DB non connesso, resta a 0
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) { setError(t('waitlistErrEmpty')); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) { setError(t('waitlistErrInvalid')); return; }

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('waitlistErrGeneric'));
        return;
      }
      setSubmitted(true);
      setEmail(trimmed);
      setCount((prev) => prev + 1);
    } catch (err) {
      setError(t('waitlistErrConn'));
    }
  };

  const handleShare = () => {
    const shareText = t('wlShareText');
    const shareUrl = 'https://nomaq.app';
    if (navigator.share) {
      navigator.share({ title: t('wlShareTitle'), text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <SEO title={t('wlSeoTitle')} description={t('wlSeoDesc')} />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#4F46E5" />
      </Head>

      <main
        className="min-h-screen bg-mesh font-sans"
        data-testid="waitlist-page"
      >
        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }}
            />
            <div
              className="absolute top-1/2 -left-20 w-60 h-60 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #4F46E5 0%, transparent 70%)' }}
            />
          </div>

          <div className="max-w-md mx-auto px-5 pt-12 pb-8 relative">
            {/* Logo + switcher lingua — width/height espliciti per riservare lo spazio (niente CLS) */}
            <div className="flex items-center justify-between mb-10">
              <Image
                src="/images/logo.png"
                alt="Nomaq"
                width={168}
                height={56}
                priority
                className="h-14 w-auto object-contain"
              />
              <LanguageSwitcher isDarkBackground={false} />
            </div>

            {/* Live counter badge — solo conteggio reale; niente badge se 0. Lo
                slot riserva sempre l'altezza così l'apparizione post-fetch del
                badge non spinge giù headline e form (niente CLS). */}
            <div className="min-h-[36px] mb-6">
              {count > 0 && (
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-nomaq-indigo"
                  style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.15)' }}
                >
                  <span className="w-2 h-2 bg-nomaq-indigo rounded-full animate-pulse" />
                  {count.toLocaleString(lang === 'en' ? 'en-GB' : 'it-IT')} {count === 1 ? t('wlCountOne') : t('wlCountMany')}
                </div>
              )}
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl text-nomaq-navy leading-tight mb-4">
              {t('wlHeadlineA')}<br />
              <span className="text-gradient-violet">
                {t('wlHeadlineB')}
              </span>
            </h1>
            <p className="text-slate-500 text-base leading-relaxed mb-8">
              {t('wlSubtitle')}
            </p>

            {/* Main CTA Form */}
            <div className="nomaq-card rounded-3xl overflow-hidden shadow-soft">
              {!submitted ? (
                <form
                  data-testid="waitlist-form"
                  onSubmit={handleSubmit}
                  className="p-5"
                >
                  <div className="mb-3">
                    <label htmlFor="waitlist-email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                      {t('wlEmailLabel')}
                    </label>
                    <input
                      type="email"
                      id="waitlist-email"
                      data-testid="waitlist-email-input"
                      placeholder={t('wlEmailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl text-nomaq-navy text-sm placeholder-slate-400 transition-all"
                      style={{
                        background: '#F5F3FF',
                        border: '1.5px solid rgba(15,23,42,0.08)',
                        outline: 'none',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#4F46E5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.12)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(15,23,42,0.08)'; e.target.style.boxShadow = 'none'; }}
                    />
                    {error && (
                      <p data-testid="waitlist-error" className="text-red-500 text-xs font-medium mt-2 px-1">{error}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    id="waitlist-submit-btn"
                    data-testid="waitlist-submit"
                    className="w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 bg-gradient-indigo shadow-button"
                  >
                    {t('wlSubmit')} <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-3">
                    {t('wlReassurance')}
                  </p>
                </form>
              ) : (
                <div className="p-6 text-center" data-testid="waitlist-success" style={{ animation: 'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-nomaq-mint" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-display text-xl text-nomaq-navy mb-2">{t('wlSuccessTitle')}</h3>
                  <p className="text-slate-500 text-sm mb-4">
                    {t('wlSuccessPre')} <span className="font-semibold text-nomaq-navy">{email}</span> {t('wlSuccessPost')}
                  </p>

                  {/* Share CTA */}
                  <button
                    id="share-btn"
                    data-testid="share-button"
                    onClick={handleShare}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{ border: '2px solid #4F46E5', color: '#4F46E5', background: 'transparent' }}
                  >
                    <Share2 className="w-4 h-4" />
                    {copied ? t('linkCopied') : t('wlShareBtn')}
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-3">
                    {t('wlShareHint')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="px-5 py-6 max-w-md mx-auto">
          <h2 className="font-display text-2xl text-nomaq-navy mb-5 text-center">
            {t('wlWhatPre')} <span className="text-gradient-violet">Nomaq</span> {t('wlWhatPost')}
          </h2>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, titleKey, descKey, color }, idx) => (
              <div
                key={idx}
                className="nomaq-card flex gap-4 p-5 rounded-2xl"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} strokeWidth={2} />
                </div>
                <div>
                  <div className="font-bold text-nomaq-navy text-sm mb-1">{t(titleKey)}</div>
                  <div className="text-slate-500 text-xs leading-relaxed">{t(descKey)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="px-5 py-8 pb-16 max-w-md mx-auto text-center">
          <div className="rounded-3xl p-6 bg-gradient-indigo shadow-button">
            <div className="text-white/80 text-sm font-medium mb-1">{t('wlBottomEyebrow')}</div>
            <div className="text-white font-display text-xl mb-4">{t('wlBottomTitle')}</div>
            <Link
              href="#waitlist-email"
              className="inline-flex items-center gap-2 bg-white text-nomaq-indigo font-bold text-sm px-6 py-3.5 rounded-2xl transition-all"
              style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.15)' }}
            >
              {t('wlBottomCta')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-slate-400 text-xs mt-6">
            © 2026 Nomaq ·{' '}
            <Link href="/privacy" className="underline hover:text-nomaq-navy">{t('footerPrivacy')}</Link> ·{' '}
            <Link href="/termini" className="underline hover:text-nomaq-navy">{t('footerTerms')}</Link> ·{' '}
            <Link href="/cookie-policy" className="underline hover:text-nomaq-navy">{t('footerCookies')}</Link>
          </p>
        </section>
      </main>
    </>
  );
}

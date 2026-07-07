import Head from 'next/head';
import SEO from '@/components/SEO';
import React from 'react';
import { Share2, ArrowRight, Check, TrendingDown, Bell, MapPin } from 'lucide-react';
import Link from 'next/link';

// Cosa offre davvero Nomaq — nessuna promessa di funzioni non ancora attive
// (niente monitoraggio 24/7 per-utente né alert via email di price drop: la
// waitlist raccoglie solo l'email per avvisare all'apertura del servizio).
const FEATURES = [
  {
    icon: TrendingDown,
    title: 'Cali di prezzo',
    desc: 'Il Radar confronta le tariffe dei nostri partner ed evidenzia quelle più basse e i cali che rileva.',
    color: '#4F46E5',
  },
  {
    icon: MapPin,
    title: 'Voli e soggiorni',
    desc: 'Voli e strutture dai partner selezionati, con prezzi indicativi da confrontare. Il prezzo finale è sul sito del partner.',
    color: '#3B82F6',
  },
  {
    icon: Bell,
    title: 'Ti avvisiamo all’apertura',
    desc: 'Lascia la tua email: ti scriviamo appena Nomaq è disponibile. Gratis, zero spam, cancellati quando vuoi.',
    color: '#7C3AED',
  },
];

export default function WaitlistPage() {
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
    if (!trimmed) { setError('Inserisci la tua email per continuare'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) { setError('Formato email non valido'); return; }

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
        setError(data.error || 'Si è verificato un errore');
        return;
      }
      setSubmitted(true);
      setEmail(trimmed);
      setCount((prev) => prev + 1);
    } catch (err) {
      setError('Impossibile connettersi al server. Riprova.');
    }
  };

  const handleShare = () => {
    const shareText = 'Sto aspettando Nomaq: confronta tariffe di voli e hotel e pianifica il viaggio con l’AI. Entra in lista d’attesa!';
    const shareUrl = 'https://nomaq.app';
    if (navigator.share) {
      navigator.share({ title: 'Nomaq — Voli e hotel al prezzo giusto', text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <SEO
        title="Nomaq — Entra in lista d'attesa"
        description="Nomaq confronta tariffe indicative di voli e hotel dai partner selezionati e aiuta a pianificare il viaggio con l'AI. Lascia la tua email e ti avvisiamo all'apertura."
      />
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
            {/* Logo */}
            <div className="flex items-center mb-10">
              <img
                src="/images/logo.png"
                alt="Nomaq"
                className="h-14 w-auto object-contain"
                loading="eager"
              />
            </div>

            {/* Live counter badge — solo conteggio reale; niente badge se 0 */}
            {count > 0 && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold text-nomaq-indigo"
                style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.15)' }}
              >
                <span className="w-2 h-2 bg-nomaq-indigo rounded-full animate-pulse" />
                {count.toLocaleString()} {count === 1 ? 'persona già in lista' : 'persone già in lista'}
              </div>
            )}

            {/* Headline */}
            <h1 className="font-display text-4xl text-nomaq-navy leading-tight mb-4">
              Voli e hotel,<br />
              <span className="text-gradient-violet">
                al prezzo giusto.
              </span>
            </h1>
            <p className="text-slate-500 text-base leading-relaxed mb-8">
              Nomaq confronta le tariffe di voli e hotel dai partner selezionati e ti aiuta a pianificare il viaggio con l&rsquo;AI. Lascia la tua email: ti avvisiamo appena apriamo.
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
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                      La tua email
                    </label>
                    <input
                      type="email"
                      id="waitlist-email"
                      data-testid="waitlist-email-input"
                      placeholder="la.tua@email.com"
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
                    Entra in lista d&rsquo;attesa <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-3">
                    Gratis. Zero spam. Cancellati quando vuoi.
                  </p>
                </form>
              ) : (
                <div className="p-6 text-center" data-testid="waitlist-success" style={{ animation: 'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-nomaq-mint" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-display text-xl text-nomaq-navy mb-2">Sei dentro! 🎉</h3>
                  <p className="text-slate-500 text-sm mb-4">
                    Ti scriveremo a <span className="font-semibold text-nomaq-navy">{email}</span> appena Nomaq è disponibile.
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
                    {copied ? '✓ Link copiato!' : 'Condividi Nomaq'}
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-3">
                    Aiutaci a spargere la voce
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="px-5 py-6 max-w-md mx-auto">
          <h2 className="font-display text-2xl text-nomaq-navy mb-5 text-center">
            Cosa fa <span className="text-gradient-violet">Nomaq</span>
          </h2>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }, idx) => (
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
                  <div className="font-bold text-nomaq-navy text-sm mb-1">{title}</div>
                  <div className="text-slate-500 text-xs leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="px-5 py-8 pb-16 max-w-md mx-auto text-center">
          <div className="rounded-3xl p-6 bg-gradient-indigo shadow-button">
            <div className="text-white/80 text-sm font-medium mb-1">Nomaq sta arrivando.</div>
            <div className="text-white font-display text-xl mb-4">Sii tra i primi a provarlo.</div>
            <Link
              href="#waitlist-email"
              className="inline-flex items-center gap-2 bg-white text-nomaq-indigo font-bold text-sm px-6 py-3.5 rounded-2xl transition-all"
              style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.15)' }}
            >
              Entra gratis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-slate-400 text-xs mt-6">
            © 2026 Nomaq ·{' '}
            <Link href="/privacy" className="underline hover:text-nomaq-navy">Privacy</Link> ·{' '}
            <Link href="/termini" className="underline hover:text-nomaq-navy">Termini</Link> ·{' '}
            <Link href="/cookie-policy" className="underline hover:text-nomaq-navy">Cookie</Link>
          </p>
        </section>
      </main>
    </>
  );
}

import Head from 'next/head';
import React from 'react';
import { Zap, Share2, ArrowRight, Check, Star, TrendingDown, Bell, MapPin, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const SOCIAL_PROOF = [
  { avatar: '👩‍💼', name: 'Sara M.', city: 'Milano', saved: '€312', trip: 'Bali' },
  { avatar: '👨‍🎤', name: 'Luca T.', city: 'Roma', saved: '€189', trip: 'Tokyo' },
  { avatar: '👩‍🍳', name: 'Elena R.', city: 'Napoli', saved: '€97', trip: 'Lisbona' },
];

const FEATURES = [
  {
    icon: TrendingDown,
    title: 'Radar in Tempo Reale',
    desc: 'Monitoriamo 2.000+ rotte 24/7. Quando il prezzo crolla, ti avvisiamo prima di chiunque altro.',
    color: '#FF6B00',
  },
  {
    icon: Bell,
    title: 'Alert Personalizzati',
    desc: 'Scegli le destinazioni del cuore. Ti mandiamo solo drop che interessano davvero a te.',
    color: '#e05b7b',
  },
  {
    icon: MapPin,
    title: '500+ Destinazioni',
    desc: 'Da Bali a New York, Maldive o Parigi. Il mondo intero, a portata di notifica.',
    color: '#3a6fbf',
  },
];

const STATS = [
  { value: '€247', label: 'risparmio medio a persona' },
  { value: '2.847', label: 'in lista d\'attesa' },
  { value: '94%', label: 'degli utenti trova un drop in 7 giorni' },
];

export default function WaitlistPage() {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [count] = React.useState(2847 + Math.floor(Math.random() * 50));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) { setError('Inserisci la tua email per continuare'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) { setError('Formato email non valido'); return; }
    setSubmitted(true);
    setEmail(trimmed);
  };

  const handleShare = () => {
    const shareText = 'Ho trovato un\'app che mi avvisa quando i prezzi dei voli crollano 🔥 Unisciti alla lista d\'attesa!';
    const shareUrl = 'https://nomaq.app';
    if (navigator.share) {
      navigator.share({ title: 'Nomaq — Vola al Prezzo Giusto', text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Head>
        <title>Nomaq — Entra in lista d'attesa. Vola al prezzo giusto.</title>
        <meta name="description" content="Nomaq rileva i crolli di prezzo su voli e hotel in tempo reale. Unisciti a 2.847 viaggiatori che risparmiano in media €247 a viaggio." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" />
        <meta name="theme-color" content="#FF6B00" />
        <meta property="og:title" content="Nomaq — Vola al Prezzo Giusto" />
        <meta property="og:description" content="L'app che ti avvisa quando i prezzi crollano. Sii il primo a saperlo." />
        <meta property="og:image" content="https://nomaq.app/og.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <main
        className="min-h-screen bg-off-white font-sans"
        style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
        data-testid="waitlist-page"
      >
        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #FF6B00 0%, transparent 70%)' }}
            />
            <div
              className="absolute top-1/2 -left-20 w-60 h-60 rounded-full opacity-5"
              style={{ background: 'radial-gradient(circle, #FF6B00 0%, transparent 70%)' }}
            />
          </div>

          <div className="max-w-md mx-auto px-5 pt-12 pb-8 relative">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8533)', boxShadow: '0 4px 16px rgba(255,107,0,0.35)' }}
              >
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black text-anthracite-grey tracking-tight">nomaq</span>
            </div>

            {/* Live counter badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold text-electric-orange"
              style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.15)' }}
            >
              <span className="w-2 h-2 bg-electric-orange rounded-full animate-pulse" />
              {count.toLocaleString()} persone già in lista
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-black text-anthracite-grey leading-tight mb-4">
              Vola di più.<br />
              <span style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8533)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Spendi meno.
              </span>
            </h1>
            <p className="text-anthracite-grey/60 text-base leading-relaxed mb-8">
              Nomaq monitorizza 2.000+ rotte in tempo reale e ti avvisa nel momento esatto in cui il prezzo crolla. Il tuo prossimo viaggio costerà molto meno.
            </p>

            {/* Main CTA Form */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 8px 40px rgba(30,30,36,0.1)' }}
            >
              {!submitted ? (
                <form
                  data-testid="waitlist-form"
                  onSubmit={handleSubmit}
                  className="p-5"
                >
                  <div className="mb-3">
                    <label className="text-xs font-semibold text-anthracite-grey/60 uppercase tracking-wider mb-2 block">
                      La tua email
                    </label>
                    <input
                      type="email"
                      id="waitlist-email"
                      data-testid="waitlist-email-input"
                      placeholder="la.tua@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl text-anthracite-grey text-sm placeholder-anthracite-grey/30 transition-all"
                      style={{
                        background: '#F8F8FA',
                        border: '1.5px solid rgba(30,30,36,0.08)',
                        outline: 'none',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#FF6B00'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,0,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(30,30,36,0.08)'; e.target.style.boxShadow = 'none'; }}
                    />
                    {error && (
                      <p data-testid="waitlist-error" className="text-red-500 text-xs font-medium mt-2 px-1">{error}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    id="waitlist-submit-btn"
                    data-testid="waitlist-submit"
                    className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
                    style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8533)', boxShadow: '0 4px 20px rgba(255,107,0,0.35)' }}
                  >
                    Attiva il mio Radar <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-xs text-anthracite-grey/30 mt-3">
                    Gratis. Zero spam. Cancellati quando vuoi.
                  </p>
                </form>
              ) : (
                <div className="p-6 text-center" data-testid="waitlist-success" style={{ animation: 'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-500" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-black text-anthracite-grey mb-2">Sei dentro! 🎉</h3>
                  <p className="text-anthracite-grey/60 text-sm mb-4">
                    Ti avvisiamo su <span className="font-semibold text-anthracite-grey">{email}</span> appena il prezzo crolla.
                  </p>

                  {/* Share CTA */}
                  <button
                    id="share-btn"
                    data-testid="share-button"
                    onClick={handleShare}
                    className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all"
                    style={{ border: '2px solid #FF6B00', color: '#FF6B00', background: 'transparent' }}
                  >
                    <Share2 className="w-4 h-4" />
                    {copied ? '✓ Link copiato!' : 'Flexa il tuo Drop 🔥'}
                  </button>
                  <p className="text-center text-xs text-anthracite-grey/30 mt-3">
                    Più persone inviti, prima sali in lista
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF ── */}
        <section className="px-5 py-6 max-w-md mx-auto">
          <p className="text-xs font-semibold text-anthracite-grey/40 uppercase tracking-wider mb-4 text-center">
            Già in lista
          </p>
          <div className="space-y-3">
            {SOCIAL_PROOF.map((person, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: 'white', boxShadow: '0 2px 12px rgba(30,30,36,0.05)' }}
              >
                <div className="text-2xl">{person.avatar}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-anthracite-grey">{person.name}</div>
                  <div className="text-xs text-anthracite-grey/50">{person.city}</div>
                </div>
                <div className="text-right">
                  <div className="text-electric-orange font-black text-sm">{person.saved} risparmiati</div>
                  <div className="text-xs text-anthracite-grey/40">{person.trip}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="px-5 py-6 max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((stat, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-4 text-center"
                style={{ background: 'white', boxShadow: '0 2px 12px rgba(30,30,36,0.05)' }}
              >
                <div
                  className="text-2xl font-black mb-1"
                  style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8533)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  {stat.value}
                </div>
                <div className="text-[10px] text-anthracite-grey/50 font-medium leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="px-5 py-6 max-w-md mx-auto">
          <h2 className="text-xl font-black text-anthracite-grey mb-5 text-center">
            Come funziona il <span style={{ color: '#FF6B00' }}>Radar</span>
          </h2>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-5 rounded-2xl"
                style={{ background: 'white', boxShadow: '0 2px 12px rgba(30,30,36,0.05)' }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} strokeWidth={2} />
                </div>
                <div>
                  <div className="font-black text-anthracite-grey text-sm mb-1">{title}</div>
                  <div className="text-anthracite-grey/60 text-xs leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="px-5 py-8 pb-16 max-w-md mx-auto text-center">
          <div
            className="rounded-3xl p-6"
            style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8533)', boxShadow: '0 8px 30px rgba(255,107,0,0.4)' }}
          >
            <div className="text-white/80 text-sm font-medium mb-1">Non aspettare il prezzo giusto.</div>
            <div className="text-white font-black text-xl mb-4">Lascia che te lo diciamo noi.</div>
            <Link
              href="#waitlist-email"
              className="inline-flex items-center gap-2 bg-white text-electric-orange font-black text-sm px-6 py-3.5 rounded-2xl transition-all"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
            >
              Inizia gratis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-anthracite-grey/30 text-xs mt-6">
            © 2024 Nomaq · Privacy · Termini
          </p>
        </section>
      </main>
    </>
  );
}

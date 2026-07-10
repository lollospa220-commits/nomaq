import React from 'react';
import { User, ArrowRight, Sparkles, Calendar, Settings, Tag, LogOut, CheckCircle2, Share2, PartyPopper } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export default function ProfiloView({
  initialCount,
}: {
  initialCount?: number;
} = {}) {
  const { t, lang } = useLanguage();
  const { user, profile, signIn, signUp, signOut } = useAuth();

  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [count, setCount] = React.useState(initialCount ?? 0);

  // Auth form state
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin');
  const [authName, setAuthName] = React.useState('');
  const [authEmail, setAuthEmail] = React.useState('');
  const [authPassword, setAuthPassword] = React.useState('');
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [authInfo, setAuthInfo] = React.useState<string | null>(null);
  const [authBusy, setAuthBusy] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/waitlist')
      .then((res) => res.json())
      .then((data) => {
        if (data.count !== undefined) {
          setCount(data.count);
        }
      })
      .catch(() => { });
  }, []);

  const mapAuthError = (msg: string): string => {
    const m = msg.toLowerCase();
    if (msg === 'AUTH_UNAVAILABLE') return t('authUnavailable');
    if (m.includes('invalid login credentials')) return t('errInvalidCredentials');
    if (m.includes('already registered') || m.includes('already exists')) return t('errUserExists');
    if (m.includes('password') && (m.includes('at least') || m.includes('6'))) return t('errPasswordShort');
    if (m.includes('email not confirmed')) return t('errEmailNotConfirmed');
    return msg || t('errGeneric');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthInfo(null);
    const em = authEmail.trim();
    if (!em || !authPassword || (authMode === 'signup' && !authName.trim())) {
      setAuthError(t('errRequiredFields'));
      return;
    }
    setAuthBusy(true);
    try {
      if (authMode === 'signin') {
        const { error: err } = await signIn(em, authPassword);
        if (err) setAuthError(mapAuthError(err));
      } else {
        const { error: err, needsConfirmation } = await signUp(authName.trim(), em, authPassword);
        if (err) {
          setAuthError(mapAuthError(err));
        } else if (needsConfirmation) {
          setAuthInfo(t('confirmEmailSent'));
          setAuthMode('signin');
          setAuthPassword('');
        }
      }
    } catch {
      setAuthError(t('errGeneric'));
    } finally {
      setAuthBusy(false);
    }
  };

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
    if (navigator.share) {
      // .catch: annullando lo share sheet nativo la Promise rigetta con
      // AbortError; senza gestione è un unhandled rejection a ogni "annulla".
      navigator.share({ title: 'Nomaq Drop', text: 'Ho trovato un\'offerta pazzesca su Nomaq!', url: 'https://nomaq.app' }).catch(() => {});
    } else if (navigator.clipboard) {
      // Mostra "copiato" solo a scrittura riuscita; guardia su clipboard assente
      // (contesti non sicuri/webview) per non lanciare un TypeError sincrono.
      navigator.clipboard.writeText('https://nomaq.app')
        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
        .catch(() => {});
    }
  };

  /* ── Logged-in profile ── */
  if (user) {
    const displayName =
      profile?.full_name || user.user_metadata?.full_name || user.email || '';
    const initial = (displayName.trim().charAt(0) || '?').toUpperCase();
    const memberSince = profile?.created_at
      ? new Date(profile.created_at).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', {
          month: 'long',
          year: 'numeric',
        })
      : null;

    return (
      <div className="px-5 pb-4 space-y-5 animate-fade-in" data-testid="profile-view">
        <div className="pt-2 flex items-center gap-2">
          <User className="w-6 h-6 text-nomaq-indigo" strokeWidth={1.5} />
          <h1 className="font-display text-display-lg text-nomaq-navy">{t('yourProfile')}</h1>
        </div>

        {/* Profile card */}
        <div className="nomaq-card backdrop-blur-md p-5" data-testid="profile-card">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-nomaq-violet to-nomaq-indigo flex items-center justify-center flex-shrink-0 shadow-soft">
                <span className="text-white text-2xl font-bold">{initial}</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-nomaq-navy truncate" data-testid="profile-name">
                {displayName}
              </h2>
              <p className="text-sm text-slate-500 truncate" data-testid="profile-email">{user.email}</p>
              {memberSince && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {t('memberSince')} {memberSince}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="nomaq-pill text-xs"><Calendar className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> {t('pillEarlyAccess')}</span>
          <span className="nomaq-pill text-xs"><Settings className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> {t('pillAI')}</span>
          <span className="nomaq-pill text-xs"><Tag className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> {t('pillDeals')}</span>
        </div>

        {/* Logout */}
        <button
          data-testid="logout-button"
          onClick={() => signOut()}
          className="w-full py-3 rounded-xl text-nomaq-coral font-semibold text-sm flex items-center justify-center gap-2 border-2 border-nomaq-coral/20 hover:bg-red-50 transition-all active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          {t('logout')}
        </button>
      </div>
    );
  }

  /* ── Not logged in: auth + waitlist ──
     Rendered even while the session is loading so SSR always contains the
     waitlist form for crawlers and first paint. */
  return (
    <div className="px-5 pb-4 space-y-5 animate-fade-in" data-testid="profile-view">
      {/* Auth Card */}
      <div className="nomaq-card backdrop-blur-md p-5 mt-2">
        <div className="text-center mb-4">
          <h2 className="font-display text-xl text-nomaq-navy mb-1 flex items-center justify-center gap-2">
            <User className="w-5 h-5 text-nomaq-indigo" />
            {authMode === 'signin' ? t('authSignInTitle') : t('authSignUpTitle')}
          </h2>
          <p className="text-slate-500 text-xs">
            {authMode === 'signin' ? t('authSignInSubtitle') : t('authSignUpSubtitle')}
          </p>
        </div>

        <form data-testid="auth-form" onSubmit={handleAuthSubmit} className="space-y-3">
          {authMode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('fullNameLabel')}</label>
              <input
                type="text"
                data-testid="auth-name-input"
                placeholder={t('fullNamePlaceholder')}
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                autoComplete="name"
                className="w-full bg-white/70 backdrop-blur-sm border border-white/70 rounded-xl px-4 py-3 text-nomaq-navy text-sm placeholder-slate-400 focus:outline-none focus:border-nomaq-indigo focus:ring-2 focus:ring-nomaq-indigo/20 transition-all"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('emailLabel')}</label>
            <input
              type="email"
              data-testid="auth-email-input"
              placeholder="you@example.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-white/70 backdrop-blur-sm border border-white/70 rounded-xl px-4 py-3 text-nomaq-navy text-sm placeholder-slate-400 focus:outline-none focus:border-nomaq-indigo focus:ring-2 focus:ring-nomaq-indigo/20 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('passwordLabel')}</label>
            <input
              type="password"
              data-testid="auth-password-input"
              placeholder={t('passwordPlaceholder')}
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
              className="w-full bg-white/70 backdrop-blur-sm border border-white/70 rounded-xl px-4 py-3 text-nomaq-navy text-sm placeholder-slate-400 focus:outline-none focus:border-nomaq-indigo focus:ring-2 focus:ring-nomaq-indigo/20 transition-all"
            />
          </div>

          {authError && (
            <div data-testid="auth-error" className="text-red-500 text-xs font-medium px-1">{authError}</div>
          )}
          {authInfo && (
            <div data-testid="auth-info" className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-700 text-xs font-medium">
              {authInfo}
            </div>
          )}

          <button
            type="submit"
            data-testid="auth-submit"
            disabled={authBusy}
            className="btn-primary w-full !rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
          >
            {authBusy
              ? t('authWorking')
              : (
                <>
                  {authMode === 'signin' ? t('signInBtn') : t('signUpBtn')} <ArrowRight className="w-4 h-4" />
                </>
              )}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            data-testid="auth-toggle-mode"
            onClick={() => {
              setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
              setAuthError(null);
              setAuthInfo(null);
            }}
            className="text-xs text-slate-500"
          >
            {authMode === 'signin' ? t('noAccount') : t('haveAccount')}{' '}
            <span className="text-nomaq-indigo font-semibold">
              {authMode === 'signin' ? t('signUpBtn') : t('signInBtn')}
            </span>
          </button>
        </div>
      </div>

      {/* Waitlist Hero */}
      <div className="flex flex-col items-center pt-2 mb-2 text-center">
        <h1 className="font-display text-display-md text-nomaq-navy leading-tight mb-3 flex items-center justify-center gap-2">
          <span>{t('waitlistHeroA')}<br />{t('waitlistHeroB')}</span><Sparkles className="w-6 h-6 text-nomaq-indigo" />
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          {t('waitlistSub')}
        </p>
      </div>

      {/* Form Card */}
      <div className="nomaq-card backdrop-blur-md p-5">
        <form data-testid="waitlist-form" onSubmit={handleSubmit} className="space-y-3">
          {!submitted ? (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('emailAddress')}</label>
                <input
                  type="email"
                  data-testid="waitlist-email-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/70 backdrop-blur-sm border border-white/70 rounded-xl px-4 py-3 text-nomaq-navy text-sm placeholder-slate-400 focus:outline-none focus:border-nomaq-indigo focus:ring-2 focus:ring-nomaq-indigo/20 transition-all"
                />
              </div>
              {error && (
                <div data-testid="waitlist-error" className="text-red-500 text-xs font-medium px-1">{error}</div>
              )}
              <button
                type="submit"
                data-testid="waitlist-submit"
                className="btn-primary w-full !rounded-xl flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 mr-1" /> {t('joinWaitlist')} <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div data-testid="waitlist-success" className="animate-bounce-in bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <div className="flex justify-center mb-1"><PartyPopper className="w-6 h-6 text-emerald-500" /></div>
                <div className="text-emerald-700 font-bold text-sm">{t('youreIn')}</div>
                <div className="text-emerald-600 text-xs mt-1">{email}</div>
              </div>
              <button
                data-testid="share-button"
                onClick={handleShare}
                className="w-full py-3 rounded-xl text-nomaq-indigo font-semibold text-sm flex items-center justify-center gap-2 border-2 border-nomaq-indigo/20 hover:bg-nomaq-lavender transition-all"
              >
                <Share2 className="w-4 h-4" />
                {copied ? t('linkCopied') : t('shareDrop')}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Early members note */}
      <div className="flex justify-center text-center">
        <p className="text-slate-500 text-xs leading-relaxed flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> {t('earlyMembers')}
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="nomaq-pill text-xs"><Calendar className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> {t('pillEarlyAccess')}</span>
        <span className="nomaq-pill text-xs"><Settings className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> {t('pillAI')}</span>
        <span className="nomaq-pill text-xs"><Tag className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> {t('pillDeals')}</span>
      </div>

      {/* No spam footer */}
      <div className="flex justify-center text-center pb-2">
        <p className="text-slate-400 text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {t('noSpam')}</p>
      </div>

      {/* Counter */}
      <div className="text-center">
        <span className="text-slate-400 text-xs">
          {String(count).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : '.')} {t('travelersJoined')}
        </span>
      </div>
    </div>
  );
}

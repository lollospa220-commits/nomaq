import React from 'react';
import LegalLayout, { LegalH2, LegalP, LegalUl } from '../components/LegalLayout';

// Unica fonte dati per la tabella cookie: su desktop resta tabella, su mobile
// diventa card impilate (la tabella a 4 colonne costringeva allo scroll
// orizzontale sui telefoni).
const COOKIES = [
  {
    nome: 'Cookie di sessione Supabase',
    finalita: "Tecnico — mantiene l'utente collegato all'account",
    durata: 'Sessione',
    origine: 'Prima parte',
  },
  {
    nome: 'Preferenza lingua (local storage)',
    finalita: 'Tecnico — memorizza la lingua scelta (IT/EN)',
    durata: 'Persistente',
    origine: 'Prima parte',
  },
  {
    nome: 'nomaq_session_id (local storage)',
    finalita: 'Funzionale — identificativo anonimo che collega i preferiti salvati',
    durata: 'Persistente',
    origine: 'Prima parte',
  },
  {
    nome: 'nomaq_cookie_notice (local storage)',
    finalita: "Funzionale — memorizza la chiusura dell'avviso cookie",
    durata: 'Persistente',
    origine: 'Prima parte',
  },
  {
    nome: 'Vercel Web Analytics',
    finalita: 'Statistico SENZA cookie — misura aggregata e anonima del traffico',
    durata: 'Identificativo eliminato entro 24 h',
    origine: 'Terza parte (Vercel)',
  },
];

export default function CookiePolicy() {
  return (
    <LegalLayout
      title="Cookie policy"
      description="Cookie policy di Nomaq: cookie e identificatori tecnici utilizzati dal sito, statistiche senza cookie, cookie di terze parti e come gestirli dal proprio browser."
      current="/cookie-policy"
    >
      <LegalH2 first>4.1 Cosa sono i cookie</LegalH2>
      <LegalP>
        I cookie sono piccoli file di testo che i siti visitati inviano al terminale dell'utente,
        dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla visita
        successiva. Analoghe finalità possono essere svolte da altri identificatori memorizzati nel
        browser (es. local storage).
      </LegalP>

      <LegalH2>4.2 Cookie e identificatori utilizzati da Nomaq</LegalH2>
      <LegalP>
        Nomaq utilizza esclusivamente cookie e identificatori tecnici/funzionali, necessari al
        funzionamento del Sito. Ai sensi dell'art. 122 del Codice Privacy italiano, i cookie tecnici
        non richiedono il consenso preventivo dell'utente.
      </LegalP>
      {/* Mobile: card impilate (niente scroll orizzontale) */}
      <div className="lg:hidden my-4 space-y-3">
        {COOKIES.map((c) => (
          <div key={c.nome} className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm">
            <p className="font-semibold text-nomaq-navy">{c.nome}</p>
            <p className="text-slate-600 mt-1">{c.finalita}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
              <span><span className="font-semibold">Durata:</span> {c.durata}</span>
              <span><span className="font-semibold">Origine:</span> {c.origine}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Desktop: tabella classica */}
      <div className="hidden lg:block overflow-x-auto my-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="py-2 pr-4 font-semibold">Nome</th>
              <th className="py-2 pr-4 font-semibold">Tipo / finalità</th>
              <th className="py-2 pr-4 font-semibold">Durata</th>
              <th className="py-2 font-semibold">Origine</th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            {COOKIES.map((c, i) => (
              <tr key={c.nome} className={i < COOKIES.length - 1 ? 'border-b border-slate-100' : ''}>
                <td className="py-2 pr-4">{c.nome}</td>
                <td className="py-2 pr-4">{c.finalita}</td>
                <td className="py-2 pr-4">{c.durata}</td>
                <td className="py-2">{c.origine}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <LegalP>
        Nomaq utilizza inoltre <strong>Vercel Web Analytics</strong>, uno strumento di misurazione
        statistica del traffico che NON installa cookie né altri identificatori sul dispositivo
        dell'utente: i visitatori sono conteggiati tramite un identificativo aggregato e temporaneo
        derivato dalla richiesta HTTP, eliminato entro 24 ore, senza profilazione individuale né
        incrocio con altri trattamenti; per questo lo strumento non richiede consenso preventivo.
        Vercel Inc. ha sede negli Stati Uniti (aderente all'EU-US Data Privacy Framework). Nomaq
        non utilizza cookie di profilazione o di marketing propri. Qualora in futuro venissero
        introdotti strumenti che richiedono il consenso, la presente informativa sarà aggiornata e
        il consenso sarà raccolto tramite apposito banner.
      </LegalP>

      <LegalH2>4.3 Cookie di terze parti</LegalH2>
      <LegalP>
        Cliccando su un'offerta, l'utente viene reindirizzato a siti di partner terzi (es.
        Kiwi.com, Booking.com), che possono installare propri cookie secondo le
        rispettive cookie policy, indipendenti da Nomaq. Tali cookie sono impostati solo dopo il
        reindirizzamento e sulle pagine dei partner. Si consiglia di consultare le informative sulla
        privacy e sui cookie di tali siti.
      </LegalP>

      <LegalH2>4.4 Come gestire i cookie</LegalH2>
      <LegalP>
        L'utente può gestire o disabilitare i cookie tramite le impostazioni del proprio browser.
        Si segnala che la disabilitazione dei cookie tecnici potrebbe impedire il corretto
        funzionamento di alcune funzionalità del Sito (es. login).
      </LegalP>
    </LegalLayout>
  );
}

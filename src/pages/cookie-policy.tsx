import React from 'react';
import LegalLayout, { LegalH2, LegalP, LegalUl } from '../components/LegalLayout';

export default function CookiePolicy() {
  return (
    <LegalLayout
      title="Cookie policy"
      description="Cookie policy di Nomaq: cookie tecnici utilizzati dal sito, cookie di terze parti e come gestirli dal proprio browser."
      current="/cookie-policy"
    >
      <LegalH2 first>4.1 Cosa sono i cookie</LegalH2>
      <LegalP>
        I cookie sono piccoli file di testo che i siti visitati inviano al terminale dell'utente,
        dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla visita
        successiva.
      </LegalP>

      <LegalH2>4.2 Cookie utilizzati da Nomaq</LegalH2>
      <LegalP>
        Nomaq utilizza attualmente solo cookie tecnici, necessari al funzionamento del Sito, tra
        cui:
      </LegalP>
      <LegalUl>
        <li>
          cookie di sessione/autenticazione, gestiti tramite Supabase, per mantenere l'utente
          collegato al proprio account;
        </li>
        <li>
          cookie/local storage per memorizzare la preferenza di lingua (Italiano/Inglese)
          selezionata dall'utente.
        </li>
      </LegalUl>
      <LegalP>
        Ai sensi dell'art. 122 del Codice Privacy italiano, i cookie tecnici non richiedono il
        consenso preventivo dell'utente.
      </LegalP>
      <LegalP>
        Allo stato attuale Nomaq non utilizza cookie di profilazione, analytics o marketing propri.
        Qualora in futuro venissero introdotti strumenti di questo tipo, la presente informativa
        dovrà essere aggiornata e sarà necessario richiedere il consenso dell'utente tramite
        apposito banner, come previsto dalla normativa.
      </LegalP>

      <LegalH2>4.3 Cookie di terze parti</LegalH2>
      <LegalP>
        Cliccando su un'offerta, l'utente viene reindirizzato a siti di partner terzi (es.
        Kiwi.com, Booking.com), che possono installare propri cookie secondo le rispettive cookie
        policy, indipendenti da Nomaq. Si consiglia di consultare le informative sulla privacy e
        sui cookie di tali siti.
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

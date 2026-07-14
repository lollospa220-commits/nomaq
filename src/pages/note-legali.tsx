import React from 'react';
import LegalLayout, { LegalH2, LegalP } from '../components/LegalLayout';
import { SITE_HOST } from '@/utils/siteUrl';

export default function NoteLegali() {
  return (
    <LegalLayout
      title="Note legali"
      description="Note legali di Nomaq: gestore del sito, hosting, proprietà intellettuale e limitazione di responsabilità sui contenuti."
      current="/note-legali"
    >
      <LegalH2 first>1.1 Gestore del sito</LegalH2>
      <LegalP>
        Il sito web {SITE_HOST} ("Nomaq" o il "Sito") è gestito da un team di sviluppo indipendente
        ("il team di Nomaq", "noi"), attualmente non costituito in forma societaria. Contatti:{' '}
        <a href="mailto:nomaq061@gmail.com" className="text-nomaq-indigo font-semibold">
          nomaq061@gmail.com
        </a>
        .
      </LegalP>
      <LegalP>
        In attesa della costituzione della società che gestirà il servizio, il Sito è riferibile
        alla persona fisica responsabile del progetto, contattabile all'indirizzo email sopra
        indicato. Ragione sociale, sede legale, Partita IVA, Codice Fiscale e numero REA verranno
        inseriti in questa sezione non appena disponibili.
      </LegalP>

      <LegalH2>1.2 Hosting</LegalH2>
      <LegalP>
        Il Sito è ospitato su infrastruttura fornita da Vercel Inc., 340 S Lemon Ave #4133, Walnut,
        CA 91789, Stati Uniti.
      </LegalP>

      <LegalH2>1.3 Proprietà intellettuale</LegalH2>
      <LegalP>
        Il nome "Nomaq", il logo, il design dell'interfaccia e i contenuti originali del Sito sono
        di proprietà del team di Nomaq o concessi in licenza, salvo diversa indicazione. È vietata
        la riproduzione, distribuzione, modifica o pubblicazione non autorizzata dei contenuti del
        Sito.
      </LegalP>

      <LegalH2>1.4 Limitazione di responsabilità sui contenuti</LegalH2>
      <LegalP>
        Le informazioni pubblicate sul Sito (prezzi, disponibilità, orari, descrizioni di voli e
        strutture ricettive) provengono in parte da fornitori terzi e da un motore di intelligenza
        artificiale, e hanno natura puramente indicativa. Nomaq non garantisce l'esattezza, la
        completezza o l'aggiornamento di tali informazioni.
      </LegalP>
    </LegalLayout>
  );
}

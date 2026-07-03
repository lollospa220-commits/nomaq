import React from 'react';
import LegalLayout, { LegalH2, LegalP, LegalUl } from '../components/LegalLayout';

export default function Privacy() {
  return (
    <LegalLayout
      title="Informativa sulla privacy"
      description="Informativa sulla privacy di Nomaq ai sensi degli artt. 13-14 del GDPR: dati raccolti, finalità, destinatari e diritti dell'interessato."
      subtitle={'ai sensi degli artt. 13-14 del Regolamento UE 2016/679 ("GDPR")'}
      current="/privacy"
    >
      <LegalH2 first>3.1 Titolare del trattamento</LegalH2>
      <LegalP>
        Il trattamento dei dati raccolti tramite il Sito nomaq.app è effettuato da "il team di
        Nomaq" (di seguito "Nomaq" o il "Titolare"). Contatto:{' '}
        <a href="mailto:nomaq061@gmail.com" className="text-nomaq-indigo font-semibold">
          nomaq061@gmail.com
        </a>
        .
      </LegalP>
      <LegalP>
        Al momento Nomaq non è costituita come società e non dispone di dati fiscali (ragione
        sociale, Partita IVA, sede legale). Tali dati verranno aggiunti a questa informativa non
        appena disponibili.
      </LegalP>

      <LegalH2>3.2 Dati raccolti e finalità del trattamento</LegalH2>
      <LegalP>a) Dati forniti volontariamente dall'utente</LegalP>
      <LegalUl>
        <li>
          Dati di registrazione/account (es. nome, indirizzo email, password) — raccolti per creare
          e gestire l'account utente tramite il fornitore di autenticazione e database Supabase;
        </li>
        <li>
          Preferenze e contenuti salvati (es. voli e strutture salvate nei preferiti) — per la
          funzione di salvataggio personale;
        </li>
        <li>
          Testo delle richieste inserite nella barra di ricerca o nel pianificatore di viaggio AI —
          per generare risultati e itinerari personalizzati tramite il servizio di intelligenza
          artificiale DeepSeek.
        </li>
      </LegalUl>
      <LegalP>b) Dati raccolti automaticamente</LegalP>
      <LegalUl>
        <li>
          Dati tecnici e di navigazione (indirizzo IP, tipo di browser, pagine visitate, data e ora
          di accesso) — per il funzionamento tecnico del Sito, la sicurezza e la diagnosi di
          eventuali problemi.
        </li>
      </LegalUl>

      <LegalH2>3.3 Base giuridica del trattamento</LegalH2>
      <LegalUl>
        <li>
          Esecuzione di un contratto o di misure precontrattuali (art. 6.1.b GDPR): per
          l'erogazione delle funzionalità richieste (account, ricerca, salvataggio preferiti);
        </li>
        <li>
          Consenso dell'interessato (art. 6.1.a GDPR): ove richiesto, ad esempio per comunicazioni
          facoltative;
        </li>
        <li>
          Legittimo interesse del Titolare (art. 6.1.f GDPR): per la sicurezza del Sito e la
          prevenzione di abusi.
        </li>
      </LegalUl>

      <LegalH2>3.4 Destinatari dei dati e responsabili esterni del trattamento</LegalH2>
      <LegalP>
        Per erogare il servizio, Nomaq si avvale dei seguenti fornitori terzi, che possono trattare
        i dati in qualità di responsabili del trattamento o titolari autonomi secondo le rispettive
        policy:
      </LegalP>
      <LegalUl>
        <li>Supabase Inc. — database e servizio di autenticazione account;</li>
        <li>Vercel Inc. — hosting dell'applicazione web;</li>
        <li>
          DeepSeek — elaborazione delle richieste in linguaggio naturale per la ricerca e la
          pianificazione di viaggio via AI (viene trasmesso il testo digitato dall'utente);
        </li>
        <li>Duffel Ltd — ricerca e reperimento di offerte voli;</li>
        <li>RapidAPI / TripAdvisor — ricerca di strutture ricettive;</li>
        <li>
          Travelpayouts, Kiwi.com, Booking.com — gestione dei link di affiliazione e tracciamento
          dei click a fini di attribuzione della commissione, quando l'utente viene reindirizzato
          al sito del partner.
        </li>
      </LegalUl>
      <LegalP>
        Questi fornitori possono avere sede o server anche al di fuori dello Spazio Economico
        Europeo (in particolare negli Stati Uniti). In tal caso, il trasferimento avviene sulla
        base di garanzie adeguate previste dal GDPR (es. Clausole Contrattuali Standard della
        Commissione Europea).
      </LegalP>

      <LegalH2>3.5 Periodo di conservazione</LegalH2>
      <LegalP>
        I dati dell'account sono conservati per la durata del rapporto con l'utente (finché
        l'account resta attivo) e cancellati su richiesta. I dati tecnici di navigazione sono
        conservati per il tempo necessario alle finalità di sicurezza, salvo periodi più lunghi
        richiesti dalla legge.
      </LegalP>

      <LegalH2>3.6 Diritti dell'interessato</LegalH2>
      <LegalP>
        L'utente può in qualsiasi momento esercitare i diritti previsti dagli artt. 15-22 GDPR:
        accesso ai dati, rettifica, cancellazione, limitazione del trattamento, portabilità dei
        dati, opposizione al trattamento. Le richieste possono essere inviate a{' '}
        <a href="mailto:nomaq061@gmail.com" className="text-nomaq-indigo font-semibold">
          nomaq061@gmail.com
        </a>
        . L'utente ha inoltre diritto di proporre reclamo al Garante per la Protezione dei Dati
        Personali (
        <a
          href="https://www.garanteprivacy.it"
          target="_blank"
          rel="noopener noreferrer"
          className="text-nomaq-indigo font-semibold"
        >
          www.garanteprivacy.it
        </a>
        ).
      </LegalP>

      <LegalH2>3.7 Minori</LegalH2>
      <LegalP>
        Il Sito non è destinato a minori di 16 anni e Nomaq non raccoglie consapevolmente dati di
        minori.
      </LegalP>

      <LegalH2>3.8 Sicurezza dei dati</LegalH2>
      <LegalP>
        Nomaq adotta misure tecniche e organizzative ragionevoli per proteggere i dati da accessi
        non autorizzati, perdita o distruzione.
      </LegalP>

      <LegalH2>3.9 Modifiche all'informativa</LegalH2>
      <LegalP>
        La presente informativa può essere aggiornata; la data di ultimo aggiornamento è indicata
        in calce al documento.
      </LegalP>
    </LegalLayout>
  );
}

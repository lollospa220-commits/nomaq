import React from 'react';
import LegalLayout, { LegalH2, LegalP, LegalUl } from '../components/LegalLayout';

export default function Privacy() {
  return (
    <LegalLayout
      title="Informativa sulla privacy"
      description="Informativa sulla privacy di Nomaq ai sensi degli artt. 13-14 del GDPR: dati raccolti, finalità, destinatari, trasferimenti extra-UE e diritti dell'interessato."
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
        In attesa della costituzione della società che gestirà il servizio, il trattamento è
        riferibile alla persona fisica responsabile del progetto, contattabile all'indirizzo sopra
        indicato. Ragione sociale, sede legale e Partita IVA verranno aggiunti a questa informativa
        non appena disponibili.
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
          Indirizzo email fornito per l'iscrizione alla lista d'attesa (waitlist) — per informare
          l'utente sull'apertura del servizio e inviargli gli aggiornamenti richiesti (base
          giuridica: consenso, art. 6.1.a GDPR);
        </li>
        <li>
          Testo delle richieste inserite nella barra di ricerca o nel pianificatore/Concierge di
          viaggio AI — per generare risultati e itinerari tramite il servizio di intelligenza
          artificiale Mistral (con sede nell'Unione Europea). Si raccomanda comunque di non inserire
          dati personali non necessari nel testo delle richieste.
        </li>
      </LegalUl>
      <LegalP>b) Dati raccolti automaticamente</LegalP>
      <LegalUl>
        <li>
          Dati tecnici e di navigazione (indirizzo IP, tipo di browser, pagine visitate, data e ora
          di accesso) — per il funzionamento tecnico del Sito, la sicurezza e la diagnosi di
          eventuali problemi;
        </li>
        <li>
          Dati statistici aggregati e anonimi di navigazione (pagine viste, provenienza, tipo di
          dispositivo e browser, area geografica) raccolti tramite Vercel Web Analytics SENZA
          cookie, per misurare l'utilizzo del Sito e migliorarne le prestazioni; non profilano
          l'utente e non sono usati per finalità di marketing.
        </li>
      </LegalUl>

      <LegalH2>3.3 Base giuridica del trattamento</LegalH2>
      <LegalUl>
        <li>
          Esecuzione di un contratto o di misure precontrattuali (art. 6.1.b GDPR): per
          l'erogazione delle funzionalità richieste (account, ricerca, salvataggio preferiti);
        </li>
        <li>
          Consenso dell'interessato (art. 6.1.a GDPR): per l'iscrizione alla waitlist e per
          eventuali comunicazioni facoltative;
        </li>
        <li>
          Esecuzione del servizio e legittimo interesse (artt. 6.1.b e 6.1.f GDPR): per
          l'elaborazione del testo digitato dall'utente tramite il servizio di intelligenza
          artificiale Mistral (con sede nell'Unione Europea), al fine di fornire i risultati e gli
          itinerari richiesti;
        </li>
        <li>
          Legittimo interesse del Titolare (art. 6.1.f GDPR): per la sicurezza del Sito, la
          prevenzione di abusi e la misurazione statistica aggregata e anonima del traffico.
        </li>
      </LegalUl>

      <LegalH2>3.4 Destinatari dei dati, responsabili esterni e trasferimenti extra-UE</LegalH2>
      <LegalP>
        Per erogare il servizio, Nomaq si avvale dei seguenti fornitori terzi, che possono trattare
        i dati in qualità di responsabili del trattamento o titolari autonomi secondo le rispettive
        policy:
      </LegalP>
      <LegalUl>
        <li>Supabase Inc. — database e servizio di autenticazione account (USA);</li>
        <li>Vercel Inc. — hosting dell'applicazione web (USA);</li>
        <li>
          Vercel Inc. — analisi statistica aggregata e anonima del traffico (Vercel Web Analytics,
          senza cookie: i visitatori sono conteggiati tramite un identificativo temporaneo derivato
          dalla richiesta ed eliminato entro 24 ore; USA);
        </li>
        <li>
          Mistral AI SAS — elaborazione delle richieste in linguaggio naturale per la ricerca e la
          pianificazione di viaggio via AI: viene trasmesso il testo digitato dall'utente (Francia,
          Unione Europea);
        </li>
        <li>
          Duffel Ltd — reperimento di dati e offerte di volo lato server; NON è una piattaforma di
          prenotazione verso cui l'utente viene reindirizzato (Regno Unito);
        </li>
        <li>RapidAPI / TripAdvisor — ricerca di strutture ricettive (USA);</li>
        <li>
          Travelpayouts, Kiwi.com, Booking.com — gestione dei link di affiliazione e
          tracciamento dei click a fini di attribuzione della commissione, quando l'utente viene
          reindirizzato al sito del partner.
        </li>
      </LegalUl>
      <LegalP>
        <strong>Trasferimenti verso Paesi terzi.</strong> Alcuni di questi fornitori hanno sede o
        server al di fuori dello Spazio Economico Europeo. Per i fornitori con sede negli Stati Uniti
        (es. Vercel, Supabase, RapidAPI/TripAdvisor) il trasferimento avviene sulla base
        dell'adesione all'EU-US Data Privacy Framework, ove applicabile, e/o delle Clausole
        Contrattuali Standard della Commissione Europea; per Duffel (Regno Unito) si applica la
        decisione di adeguatezza della Commissione. Il servizio di intelligenza artificiale Mistral
        ha sede in Francia (Unione Europea) e non comporta pertanto alcun trasferimento al di fuori
        dello Spazio Economico Europeo. Si raccomanda comunque di non inserire dati personali non
        necessari nel testo inviato all'AI. È possibile ottenere copia delle garanzie adottate
        contattando il Titolare.
      </LegalP>

      <LegalH2>3.5 Periodo di conservazione</LegalH2>
      <LegalP>
        I dati dell'account sono conservati per la durata del rapporto con l'utente (finché
        l'account resta attivo) e cancellati su richiesta. I dati tecnici di navigazione sono
        conservati per il tempo necessario alle finalità di sicurezza, salvo periodi più lunghi
        richiesti dalla legge. Il testo delle richieste inviato all'AI è trattato per il tempo
        necessario a generare la risposta e non è conservato da Nomaq per finalità ulteriori. I dati
        di Vercel Web Analytics sono aggregati e l'identificativo temporaneo è eliminato entro 24
        ore. L'email della waitlist è conservata fino all'apertura del servizio o alla richiesta di
        cancellazione/revoca del consenso da parte dell'utente.
      </LegalP>

      <LegalH2>3.6 Diritti dell'interessato</LegalH2>
      <LegalP>
        L'utente può in qualsiasi momento esercitare i diritti previsti dagli artt. 15-22 GDPR:
        accesso ai dati, rettifica, cancellazione, limitazione del trattamento, portabilità dei
        dati, opposizione al trattamento, nonché il diritto di revocare in qualsiasi momento il
        consenso prestato (art. 7, par. 3 GDPR), senza pregiudicare la liceità del trattamento
        effettuato prima della revoca. Le richieste possono essere inviate a{' '}
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

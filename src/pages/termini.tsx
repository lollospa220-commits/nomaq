import React from 'react';
import LegalLayout, { LegalH2, LegalP, LegalUl } from '../components/LegalLayout';

export default function Termini() {
  return (
    <LegalLayout
      title="Termini e condizioni d'uso"
      description="Termini e condizioni d'uso di Nomaq: oggetto del servizio, ruolo di intermediario, link di affiliazione, funzionalità AI e limitazioni di responsabilità."
      current="/termini"
    >
      <LegalH2 first>2.1 Oggetto del servizio</LegalH2>
      <LegalP>
        Nomaq è un motore di ricerca e comparazione (metasearch) per voli e strutture ricettive,
        che integra strumenti di intelligenza artificiale per aiutare l'utente a pianificare un
        viaggio. Nomaq non è un'agenzia di viaggio, un vettore aereo o una struttura ricettiva, e
        non vende direttamente biglietti, soggiorni o pacchetti.
      </LegalP>

      <LegalH2>2.2 Ruolo di intermediario e partner terzi</LegalH2>
      <LegalP>
        Quando l'utente seleziona un'offerta, Nomaq lo reindirizza a piattaforme terze partner (a
        titolo esemplificativo: Kiwi.com per i voli, Booking.com per le strutture)
        presso le quali avviene l'eventuale acquisto o prenotazione. Il contratto di viaggio si
        conclude esclusivamente tra l'utente e il fornitore terzo, alle condizioni generali,
        tariffe e politiche di cancellazione da questo stabilite. Nomaq non è parte di tale
        contratto e non è responsabile per l'esecuzione del servizio, la sua qualità, né per
        eventuali variazioni di prezzo o disponibilità successive al reindirizzamento.
      </LegalP>

      <LegalH2>2.3 Link di affiliazione e monetizzazione</LegalH2>
      <LegalP>
        Alcuni link presenti sul Sito sono link di affiliazione, generati tramite il network
        Travelpayouts per Kiwi.com e Booking.com: se l'utente conclude una prenotazione
        dopo aver cliccato su tali link, Nomaq può percepire una commissione dal partner, senza
        alcun costo aggiuntivo per l'utente.
      </LegalP>

      <LegalH2>2.3-bis Come selezioniamo e ordiniamo i risultati</LegalH2>
      <LegalP>
        La comparazione di Nomaq è limitata alle offerte dei partner con cui collabora (attualmente
        Kiwi.com per i voli, Booking.com per le strutture) e non copre l'intero mercato.
        I risultati sono ordinati principalmente per prezzo; la relazione di affiliazione non altera
        tale ordinamento. Alcune sezioni (es. "Selezionati per te") sono selezioni curate in base
        all'origine e alle date scelte dall'utente. I prezzi mostrati sono indicativi, provengono
        dalla cache dei partner e non costituiscono quotazioni in tempo reale garantite: il prezzo
        definitivo, le tasse e la disponibilità sono confermati sul sito del partner al momento
        della prenotazione.
      </LegalP>

      <LegalH2>2.4 Funzionalità basate su intelligenza artificiale</LegalH2>
      <LegalP>
        Il Sito utilizza un servizio di intelligenza artificiale di terze parti (DeepSeek) per
        interpretare richieste in linguaggio naturale e suggerire itinerari, voli e strutture. Le
        risposte generate dall'AI possono contenere imprecisioni o errori e non costituiscono
        consulenza di viaggio professionale, né garanzia di disponibilità o prezzo. Si raccomanda
        di verificare sempre i dettagli finali (prezzo, orari, documenti di viaggio richiesti) sul
        sito del fornitore terzo prima di concludere l'acquisto.
      </LegalP>

      <LegalH2>2.5 Account utente</LegalH2>
      <LegalP>
        Alcune funzionalità (es. salvataggio dei preferiti, cronologia ricerche) richiedono la
        creazione di un account. L'utente è responsabile della riservatezza delle proprie
        credenziali e di ogni attività effettuata tramite il proprio account.
      </LegalP>

      <LegalH2>2.6 Uso consentito</LegalH2>
      <LegalP>È vietato:</LegalP>
      <LegalUl>
        <li>utilizzare il Sito per finalità illecite;</li>
        <li>tentare di accedere senza autorizzazione a sistemi, account o dati altrui;</li>
        <li>
          effettuare scraping automatizzato, estrazione massiva di dati o utilizzo di bot senza
          autorizzazione scritta;
        </li>
        <li>interferire con il normale funzionamento del Sito.</li>
      </LegalUl>

      <LegalH2>2.7 Limitazione di responsabilità</LegalH2>
      <LegalP>
        Nei limiti consentiti dalla legge applicabile, Nomaq non è responsabile per danni diretti o
        indiretti derivanti dall'uso del Sito, da informazioni inesatte fornite da terzi o generate
        dall'intelligenza artificiale, o dalla temporanea indisponibilità del Sito per manutenzione
        o cause di forza maggiore.
      </LegalP>

      <LegalH2>2.8 Modifiche ai Termini</LegalH2>
      <LegalP>
        Nomaq si riserva il diritto di modificare i presenti Termini in qualsiasi momento; le
        modifiche saranno pubblicate su questa pagina con indicazione della data di aggiornamento.
      </LegalP>

      <LegalH2>2.9 Legge applicabile e foro competente</LegalH2>
      <LegalP>
        I presenti Termini sono regolati dalla legge italiana. Per le controversie con utenti che
        rivestono la qualifica di consumatori, è competente il foro del luogo di residenza o
        domicilio del consumatore, ai sensi del Codice del Consumo (D.Lgs. 206/2005). Per ogni
        altra controversia si applicano le norme generali di procedura civile.
      </LegalP>

      <LegalH2>2.10 Contatti</LegalH2>
      <LegalP>
        Per qualsiasi domanda relativa ai presenti Termini:{' '}
        <a href="mailto:nomaq061@gmail.com" className="text-nomaq-indigo font-semibold">
          nomaq061@gmail.com
        </a>
        .
      </LegalP>
    </LegalLayout>
  );
}

# Original User Request

## Initial Request — 2026-06-30T11:38:17Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Nomaq è un prototipo ad alta fedeltà di un'applicazione web mobile-first (React/Next.js) per il travel booking. È caratterizzata da un feed ispirazionale immersivo (stile TikTok) e un "radar" (Drops) che avvisa l'utente tramite notifiche simulate quando i prezzi di voli e hotel scendono sotto una certa soglia. Il progetto include anche una landing page per la waitlist e l'implementazione del brand design. I dati del backend saranno mockati per questa fase demo.

Working directory: ~/teamwork_projects/nomaq
Integrity mode: development

## Requirements

### R1. Frontend Web App (Mobile-First)
Creare l'interfaccia utente principale utilizzando React/Next.js con uno stile "Glassmorphism". L'app deve avere una Bottom Navigation Bar con 5 sezioni (Vola Vola, Soggiorna, Drops, Salvati, Profilo) e implementare il layout "Feed Ispirazionale" a scorrimento verticale.

### R2. Funzionalità "Drops" e Salvataggi (Mock)
Implementare la logica client-side con dati finti per simulare: il salvataggio di una rotta nel feed, la visualizzazione delle rotte in "Salvati", e l'arrivo di una notifica (simulata nella UI) quando un prezzo crolla, visibile nella sezione "Drops".

### R3. Landing Page Waitlist (Shareability)
Creare una route separata per la Landing Page di pre-lancio che consenta agli utenti di inserire un'email per iscriversi alla lista d'attesa. Deve includere un elemento di UI per la condivisione "Flexa il tuo Drop".

### R4. Brand Design System
Implementare il design system definito: Sfondo Bianco Puro, Pulsanti e CTA in Arancione Elettrico, Testi in Grigio Antracite.

## Acceptance Criteria

### Struttura e Navigazione
- [ ] Il progetto Next.js/React compila ed esegue senza errori.
- [ ] Un test automatizzato o un controllo manuale programmabile verifica che la Bottom Navigation Bar sia presente e che contenga esattamente le 5 sezioni richieste (Vola Vola, Soggiorna, Drops, Salvati, Profilo).
- [ ] Il click su ciascuna icona della nav bar cambia correttamente la vista/schermata mostrata.

### Logica "Drops"
- [ ] L'utente può cliccare un pulsante "Salva/Cuore" nel feed ispirazionale e ritrovare l'elemento nella pagina "Salvati".
- [ ] Esiste un pulsante o un meccanismo di debug nella UI per innescare un "Price Drop" finto, che aggiorna lo stato e mostra una notifica visiva nell'app.

### Landing Page
- [ ] La landing page contiene un form email funzionante (che previene il default al submit) e mostra un messaggio di successo.
- [ ] La landing page include un pulsante di condivisione social visibile.

### Design
- [ ] I file CSS o Tailwind config includono le variabili di colore specifiche (Bianco, Arancione Elettrico, Grigio Antracite) e vengono usate nei pulsanti principali.

---
*Next: se approvi questo prompt, lancia il team di agenti! (Puoi rispondere "approvato", "vai", "lancialo")*

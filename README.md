# 🚀 Come avviare Nomaq in locale

## 1. Installa Node.js (se non lo hai già)

Scarica e installa da [nodejs.org](https://nodejs.org) — versione LTS consigliata (v20+).

Oppure con Homebrew:
```bash
brew install node
```

---

## 2. Apri il terminale nella cartella del progetto

Puoi aprire questa cartella in VS Code e poi usare il terminale integrato.

**Cartella del progetto:**
```
/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq
```

Per aprirla in VS Code:
```bash
code /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq
```

---

## 3. Installa le dipendenze

```bash
cd /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq
npm install
```

---

## 4. Avvia il server di sviluppo

```bash
npm run dev
```

L'app sarà disponibile su: **http://localhost:3000**

---

## 5. Pagine principali

| URL | Sezione |
|-----|---------|
| `http://localhost:3000` | Home / Feed "Vola Vola" |
| `http://localhost:3000/soggiorna` | Feed Hotel |
| `http://localhost:3000/drops` | Radar Drops |
| `http://localhost:3000/salvati` | Preferiti |
| `http://localhost:3000/profilo` | Profilo |
| `http://localhost:3000/waitlist` | **Landing Page** |

---

## 6. Come testare i "Drops"

1. Vai su `http://localhost:3000/drops`
2. Clicca il pulsante **"Simula un Price Drop"**
3. Vedrai apparire il drop nel radar e un toast di notifica

Per vedere l'app come su mobile: apri Chrome DevTools → Toggle device toolbar → seleziona iPhone 14.

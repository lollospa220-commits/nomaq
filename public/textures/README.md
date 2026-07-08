# Texture del globo

`earth-night.jpg` — mappa notturna della Terra ("Black Marble", luci notturne).

- **Fonte immagine**: NASA Earth Observatory / Visible Earth ("Earth at Night").
  Le immagini NASA sono di **pubblico dominio** (non soggette a copyright);
  la NASA chiede solo di non usarle in modo da implicare un suo endorsement.
- **Provenienza del file**: copiato da `node_modules/three-globe/example/img/`
  (pacchetto `three-globe` di Vasco Asturiano, licenza MIT), che ridistribuisce
  la stessa immagine NASA nei propri esempi.
- **Perché self-hostata**: la Content-Security-Policy di produzione
  (`img-src` in `next.config.js`) non consente CDN esterne come unpkg.com,
  e servirla in prima parte evita richieste di terze parti dal browser
  dell'utente (privacy) e dipendenze di runtime da CDN.

Nota cache: gli asset in `/textures` sono serviti con cache immutabile di 1 anno
(vedi `headers()` in `next.config.js`) — se sostituisci la texture, cambia nome al file.

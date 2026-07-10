# Texture del globo

`earth-night-2k.jpg` — mappa notturna della Terra ("Black Marble", luci notturne).
Ridimensionata a 2048×1024 (~196 KB) dall'originale 4096×2048 (~698 KB): a video
il globo è ~800px e scurito, il 4K era impercettibile ma pesava sul download.

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

Nota cache: il file è **importato come modulo** in `GlobeGL.tsx`
(`import earthTexture from '@/assets/earth-night-2k.jpg'`), quindi Turbopack lo
emette sotto `/_next/static/media/…<hash>.jpg` e Vercel lo serve con
`Cache-Control: public, max-age=31536000, immutable`. L'hash di contenuto busta
la cache in automatico: se sostituisci la texture NON serve rinominarla a mano.
(I file in `/public` non ottengono l'immutable: Vercel ne gestisce la cache
ignorando gli header custom — motivo per cui la texture vive qui e non lì.)

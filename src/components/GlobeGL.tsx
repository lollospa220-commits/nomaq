import React from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three';

/**
 * Globo WebGL (Globe.gl / three.js) in stile "dark mode premium":
 * - texture terrestre scura (self-hostata in /public/textures)
 * - illuminazione con "alba" al polo nord: DirectionalLight caldo dall'alto +
 *   sprite radiale additivo → orizzonte luminoso, resto in ombra
 * - archi rotta viola sottili con particelle in transito (arcDashAnimateTime)
 * - anelli pulsanti sulle città, auto-rotazione lenta sull'asse Y
 * - pointer-events:none, non blocca la UI. Rispetta prefers-reduced-motion.
 *
 * Montato via next/dynamic ssr:false → chunk separato caricato dopo il first paint.
 */

type LL = { lat: number; lng: number };

const C: Record<string, LL> = {
  london: { lat: 51.5, lng: -0.13 }, paris: { lat: 48.86, lng: 2.35 },
  rome: { lat: 41.9, lng: 12.5 }, madrid: { lat: 40.4, lng: -3.7 },
  lisbon: { lat: 38.72, lng: -9.14 }, moscow: { lat: 55.75, lng: 37.62 },
  cairo: { lat: 30.05, lng: 31.24 }, casablanca: { lat: 33.57, lng: -7.59 },
  lagos: { lat: 6.45, lng: 3.4 }, nairobi: { lat: -1.29, lng: 36.82 },
  joburg: { lat: -26.2, lng: 28.05 }, capetown: { lat: -33.9, lng: 18.6 },
  newyork: { lat: 40.71, lng: -74.0 }, toronto: { lat: 43.65, lng: -79.38 },
  saopaulo: { lat: -23.55, lng: -46.63 }, buenosaires: { lat: -34.6, lng: -58.38 },
  dubai: { lat: 25.2, lng: 55.27 },
};

const POINTS = Object.values(C);

const PAIRS: [keyof typeof C, keyof typeof C][] = [
  ['london', 'newyork'], ['paris', 'saopaulo'], ['madrid', 'buenosaires'],
  ['lisbon', 'newyork'], ['rome', 'cairo'], ['paris', 'lagos'],
  ['london', 'lagos'], ['cairo', 'joburg'], ['rome', 'capetown'],
  ['casablanca', 'saopaulo'], ['newyork', 'london'], ['toronto', 'paris'],
  ['dubai', 'nairobi'], ['madrid', 'casablanca'], ['lagos', 'joburg'],
];
const ARCS = PAIRS.map(([a, b]) => ({
  startLat: C[a].lat, startLng: C[a].lng, endLat: C[b].lat, endLng: C[b].lng,
}));



export default function GlobeGL() {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const globe: any = new Globe(el)
      .width(el.clientWidth)
      .height(el.clientHeight)
      .backgroundColor('rgba(0,0,0,0)')
      // Texture self-hostata (vedi public/textures/README.md): la CSP di prod
      // (img-src) non consente unpkg.com — da CDN la texture veniva bloccata
      // in produzione. In locale si evita anche la dipendenza da rete esterna.
      .globeImageUrl('/textures/earth-night.jpg')
      .showAtmosphere(true)
      .atmosphereColor('#8b7ff0')
      .atmosphereAltitude(0.22)
      .arcsData(ARCS)
      .arcColor(() => ['rgba(196,181,253,0.9)', 'rgba(124,58,237,0.28)'])
      .arcStroke(0.45)
      .arcAltitudeAutoScale(0.5)
      .arcDashLength(0.4)
      .arcDashGap(0.7)
      .arcDashInitialGap(() => Math.random())
      .arcDashAnimateTime(reduced ? 0 : 4500)
      .pointsData(POINTS)
      .pointColor(() => '#c4b5fd')
      .pointAltitude(0.006)
      .pointRadius(0.26)
      .ringsData(reduced ? [] : POINTS)
      .ringColor(() => (t: number) => `rgba(167,139,250,${1 - t})`)
      .ringMaxRadius(3)
      .ringPropagationSpeed(1.4)
      .ringRepeatPeriod(1700);

    // Inquadratura: Europa/Africa in vista, zoom all'indietro per vedere l'intero globo girare
    globe.pointOfView({ lat: 22, lng: 8, altitude: 2.2 }, 0);

    // Controlli: niente interazione utente, solo auto-rotazione lenta
    const controls = globe.controls();
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 0.45;

    // Per performance estreme e caricamento rapido limitiamo il pixel ratio a 1
    // (o al max 1.25 su schermi molto densi) per alleggerire GPU e batteria.
    globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));

    // Illuminazione: alba calda dall'alto, resto in ombra
    const amb = new THREE.AmbientLight(0xffffff, 0.22);
    const dir = new THREE.DirectionalLight(0xfff0e0, 2.3);
    dir.position.set(0.35, 1, 0.45);
    globe.lights([amb, dir]);



    // Resize
    const ro = new ResizeObserver(() => {
      if (!ref.current) return;
      globe.width(ref.current.clientWidth).height(ref.current.clientHeight);
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      controls.autoRotate = false;
      if (typeof globe.pauseAnimation === 'function') globe.pauseAnimation();

      try { globe.renderer().dispose(); } catch { /* noop */ }
      while (el.firstChild) el.removeChild(el.firstChild);
    };
  }, []);

  // Aggiungiamo un background scuro al canvas container così il globo scuro
  // non fluttua sul body chiaro, creando il look "dark mode premium".
  return <div ref={ref} className="fixed inset-0 w-screen h-screen -z-50 pointer-events-none bg-[#0a0a1a]" aria-hidden="true" />;
}

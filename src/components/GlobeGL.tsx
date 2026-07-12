import React from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three';

/**
 * Globo WebGL fotorealistico — tarato sul mockup di riferimento:
 * Europa/Mediterraneo/Africa al centro, Americhe in ombra a sinistra,
 * atmosfera blu tenue, rotte bianche sottili, auto-rotazione cinematica.
 */

type LL = { lat: number; lng: number };

const C: Record<string, LL> = {
  london: { lat: 51.5, lng: -0.13 }, paris: { lat: 48.86, lng: 2.35 },
  rome: { lat: 41.9, lng: 12.5 }, madrid: { lat: 40.4, lng: -3.7 },
  cairo: { lat: 30.05, lng: 31.24 }, dubai: { lat: 25.2, lng: 55.27 },
  lagos: { lat: 6.45, lng: 3.4 }, nairobi: { lat: -1.29, lng: 36.82 },
  newyork: { lat: 40.71, lng: -74.0 }, saopaulo: { lat: -23.55, lng: -46.63 },
  tokyo: { lat: 35.68, lng: 139.69 }, singapore: { lat: 1.35, lng: 103.82 },
  sydney: { lat: -33.87, lng: 151.21 }, mumbai: { lat: 19.08, lng: 72.88 },
};

const POINTS = Object.values(C);

const PAIRS: [keyof typeof C, keyof typeof C][] = [
  ['london', 'newyork'], ['paris', 'dubai'], ['rome', 'cairo'],
  ['madrid', 'saopaulo'], ['london', 'dubai'], ['paris', 'lagos'],
  ['newyork', 'london'], ['dubai', 'mumbai'], ['tokyo', 'sydney'],
  ['singapore', 'rome'], ['cairo', 'nairobi'], ['paris', 'newyork'],
];
const ARCS = PAIRS.map(([a, b]) => ({
  startLat: C[a].lat, startLng: C[a].lng, endLat: C[b].lat, endLng: C[b].lng,
}));

const DAY_NIGHT_SHADER = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec3 sunDirection;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      float intensity = dot(normalize(vNormal), normalize(sunDirection));
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);

      float blend = smoothstep(-0.06, 0.2, intensity);
      vec4 color = mix(nightColor * 1.22, dayColor, blend);

      float oceanSpec = pow(max(intensity, 0.0), 10.0) * 0.28;
      float rim = pow(1.0 - abs(intensity), 3.0) * 0.04;
      color.rgb += vec3(oceanSpec + rim);

      gl_FragColor = color;
    }
  `,
};

function povForWidth(w: number) {
  if (w < 480) return { lat: 18, lng: 8, altitude: 1.28 };
  if (w < 768) return { lat: 20, lng: 10, altitude: 1.42 };
  if (w < 1280) return { lat: 22, lng: 12, altitude: 1.55 };
  return { lat: 24, lng: 14, altitude: 1.68 };
}

export default function GlobeGL() {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loader = new THREE.TextureLoader();

    let disposed = false;
    let rafId = 0;
    let clouds: THREE.Mesh | null = null;
    let cloudMat: THREE.MeshPhongMaterial | null = null;
    let globeMaterial: THREE.ShaderMaterial | null = null;
    let dayTex: THREE.Texture | null = null;
    let nightTex: THREE.Texture | null = null;
    let cloudTex: THREE.Texture | null = null;

    const globe: any = new Globe(el)
      .width(el.clientWidth)
      .height(el.clientHeight)
      .backgroundColor('rgba(0,0,0,0)')
      .backgroundImageUrl('/textures/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#72c4ff')
      .atmosphereAltitude(0.16)
      .arcsData(ARCS)
      .arcColor(() => ['rgba(255,255,255,0.78)', 'rgba(255,255,255,0.12)'])
      .arcStroke(0.28)
      .arcAltitudeAutoScale(0.38)
      .arcDashLength(0.42)
      .arcDashGap(0.58)
      .arcDashInitialGap(() => Math.random())
      .arcDashAnimateTime(reduced ? 0 : 5200)
      .pointsData(POINTS)
      .pointColor(() => 'rgba(255,255,255,0.95)')
      .pointAltitude(0.007)
      .pointRadius(0.18);

    const applyPov = () => {
      const pov = povForWidth(el.clientWidth);
      globe.pointOfView(pov, 0);
    };
    applyPov();

    const controls = globe.controls();
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 0.22;

    const renderer = globe.renderer();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const amb = new THREE.AmbientLight(0xa8d4ff, 0.28);
    const dir = new THREE.DirectionalLight(0xfff8f0, 0.95);
    dir.position.set(6, 2.5, 3);
    globe.lights([amb, dir]);

    Promise.all([
      loader.loadAsync('/textures/earth-day.jpg'),
      loader.loadAsync('/textures/earth-night.jpg'),
      loader.loadAsync('/textures/earth-clouds.png'),
    ]).then(([day, night, cloudsMap]) => {
      if (disposed) {
        day.dispose();
        night.dispose();
        cloudsMap.dispose();
        return;
      }

      dayTex = day;
      nightTex = night;
      cloudTex = cloudsMap;
      day.anisotropy = renderer.capabilities.getMaxAnisotropy();
      night.anisotropy = renderer.capabilities.getMaxAnisotropy();

      globeMaterial = new THREE.ShaderMaterial({
        uniforms: {
          dayTexture: { value: day },
          nightTexture: { value: night },
          sunDirection: { value: new THREE.Vector3(0.94, 0.14, 0.3).normalize() },
        },
        vertexShader: DAY_NIGHT_SHADER.vertexShader,
        fragmentShader: DAY_NIGHT_SHADER.fragmentShader,
      });
      globe.globeMaterial(globeMaterial);

      const radius = globe.getGlobeRadius();
      const scene = globe.scene();
      cloudMat = new THREE.MeshPhongMaterial({
        map: cloudsMap,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      });
      clouds = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.008, 64, 64), cloudMat);
      scene.add(clouds);

      const animate = () => {
        if (disposed) return;
        if (clouds && !reduced) clouds.rotation.y += 0.00014;
        rafId = requestAnimationFrame(animate);
      };
      animate();
    }).catch(() => {
      globe.globeImageUrl('/textures/earth-day.jpg');
    });

    const ro = new ResizeObserver(() => {
      if (!ref.current) return;
      globe.width(ref.current.clientWidth).height(ref.current.clientHeight);
      applyPov();
    });
    ro.observe(el);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      controls.autoRotate = false;
      if (typeof globe.pauseAnimation === 'function') globe.pauseAnimation();

      if (clouds) {
        globe.scene().remove(clouds);
        clouds.geometry.dispose();
      }
      cloudMat?.dispose();
      globeMaterial?.dispose();
      dayTex?.dispose();
      nightTex?.dispose();
      cloudTex?.dispose();

      try {
        const r = globe.renderer();
        r.dispose();
        r.forceContextLoss();
      } catch { /* noop */ }
      try { globe._destructor?.(); } catch { /* noop */ }
      while (el.firstChild) el.removeChild(el.firstChild);
    };
  }, []);

  return (
    <>
      <div
        ref={ref}
        className="fixed inset-0 w-screen h-screen -z-50 pointer-events-none"
        style={{ transform: 'translateY(-4%) scale(1.04)' }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 -z-[49] pointer-events-none"
        aria-hidden="true"
        style={{
          background: [
            'radial-gradient(ellipse 90% 70% at 50% 38%, transparent 35%, rgba(3,5,12,0.55) 100%)',
            'linear-gradient(to bottom, rgba(3,5,12,0.15) 0%, transparent 28%, transparent 62%, rgba(3,5,12,0.45) 100%)',
          ].join(', '),
        }}
      />
    </>
  );
}
/*
 * Artwork layers for the Tirthankara scene. Images come from
 * Data/Images/Atmosphere, optimised into public/assets/scene.
 */
import type { CSSProperties } from 'react';
import type { ColourKey } from '../../data/tirthankaras';

const BASE = import.meta.env.BASE_URL;
export const SCENE = (name: string) => `${BASE}assets/scene/${name}.webp`;

/** Morning sky photo with drifting clouds (shared by all scenes). */
export function Sky() {
  return (
    <div className="sky" aria-hidden="true">
      <img className="sky-img" src={SCENE('sky')} alt="" draggable={false} />
      {[1, 2, 3, 4].map(i => (
        <img key={i} className={`cloud cloud--${i}`} src={SCENE('cloud')} alt="" draggable={false} />
      ))}
    </div>
  );
}

/** A few small birds gliding across the sky. */
export function Birds() {
  const birds = [
    { top: 12, dur: 26, delay: -4, scale: 1 },
    { top: 16, dur: 26, delay: -3.2, scale: 0.8 },
    { top: 10, dur: 26, delay: -2.6, scale: 0.7 },
    { top: 24, dur: 34, delay: -18, scale: 0.9 },
    { top: 21, dur: 34, delay: -17, scale: 0.65 },
    { top: 8, dur: 40, delay: -30, scale: 0.55 }
  ];
  return (
    <div className="birds" aria-hidden="true">
      {birds.map((b, i) => (
        <span key={i} className="bird"
          style={{ top: `${b.top}%`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`, ['--bs' as string]: b.scale }}>
          <svg viewBox="0 0 40 16"><path d="M1 9 Q10 0 20 9 Q30 0 39 9 Q30 4 20 12 Q10 4 1 9Z" /></svg>
        </span>
      ))}
    </div>
  );
}

/**
 * How the single stone figure is tinted to each Tirthankara's body colour:
 * a colour overlay masked to the figure, plus an optional filter.
 */
const TINT: Record<ColourKey, { color?: string; blend?: string; opacity?: number; filter?: string }> = {
  golden: { color: '#f0b445', blend: 'soft-light', opacity: 0.85, filter: 'sepia(0.35) saturate(1.25) brightness(1.08)' },
  red: { color: '#c4462c', blend: 'color', opacity: 0.5 },
  white: { filter: 'saturate(0.05) brightness(1.5) contrast(0.88)' },
  blue: { color: '#3d63cc', blend: 'color', opacity: 0.5 },
  dark: { color: '#1f2852', blend: 'multiply', opacity: 0.62, filter: 'brightness(0.92)' },
  green: { color: '#2f9a6b', blend: 'color', opacity: 0.48 }
};

/** Seated Tirthankara (stone figure) with halo, tinted to the body colour. */
export function Figure({ colour }: { colour: ColourKey }) {
  const t = TINT[colour];
  const src = SCENE('figure');
  return (
    <div className="figure" style={{ '--fig-filter': t.filter ?? 'none' } as CSSProperties}>
      <span className="figure-halo" />
      <img className="figure-img" src={src} alt="" draggable={false} />
      {t.color && (
        <span
          className="figure-tint"
          style={{
            background: t.color,
            mixBlendMode: t.blend as CSSProperties['mixBlendMode'],
            opacity: t.opacity,
            WebkitMaskImage: `url(${src})`,
            maskImage: `url(${src})`
          }}
        />
      )}
    </div>
  );
}

/*
 * Artwork layers for the Tirthankara scene. Images come from
 * Data/Images/Atmosphere, optimised into public/assets/scene.
 */
import type { ColourKey } from '../../data/tirthankaras';
import { ART_EXT } from '../../lib/format';

const BASE = import.meta.env.BASE_URL;
export const SCENE = (name: string) => `${BASE}assets/scene/${name}.${ART_EXT}`;

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
 * Seated Tirthankara with halo, in the body colour. Each colour is a
 * pre-rendered image (scripts baked the old CSS blend/mask tint), so phones
 * draw a plain picture instead of blend modes and masks.
 */
export function Figure({ colour }: { colour: ColourKey }) {
  return (
    <div className="figure">
      <span className="figure-halo" />
      <img className="figure-img" src={SCENE(`figure-${colour}`)} alt="" draggable={false} />
    </div>
  );
}

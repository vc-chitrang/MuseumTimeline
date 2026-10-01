import type { CSSProperties } from 'react';
import { COLOURS, type ColourKey, type Tirthankara } from '../data/tirthankaras';
import { shade } from '../lib/color';

/**
 * Shared SVG defs: a seated-meditation silhouette and one body gradient per
 * colour. Rendered once; every portrait references it with <use>.
 * Placeholder artwork until real Tirthankara images are supplied.
 */
export function PortraitSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {(Object.keys(COLOURS) as ColourKey[]).map(key => (
          <linearGradient key={key} id={`body-${key}`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor={shade(COLOURS[key].hex, 45)} />
            <stop offset="1" stopColor={shade(COLOURS[key].hex, -25)} />
          </linearGradient>
        ))}
        <symbol id="figure" viewBox="0 0 200 222">
          <rect x="75" y="50" width="7" height="24" rx="3.5" />
          <rect x="118" y="50" width="7" height="24" rx="3.5" />
          <ellipse cx="100" cy="56" rx="21" ry="25" />
          <path d="M92 76h16v12H92z" />
          <path d="M100 84C76 84 62 92 58 110L52 162Q100 184 148 162L142 110C138 92 124 84 100 84Z" />
          <path d="M16 188Q30 152 100 158Q170 152 184 188Q184 208 100 208Q16 208 16 188Z" />
          <path d="M79 52Q80 30 100 30Q120 30 121 52Q110 41 100 41Q90 41 79 52Z" fill="currentColor" />
          <circle cx="100" cy="29" r="7" fill="currentColor" />
          <ellipse cx="100" cy="168" rx="25" ry="8" fill="#fff" opacity=".28" />
          <path d="M100 113l7 8-7 8-7-8z" fill="#fff" opacity=".45" />
        </symbol>
      </defs>
    </svg>
  );
}

export function Portrait({ t }: { t: Tirthankara }) {
  const hex = COLOURS[t.colour].hex;
  // Navy backdrop with a soft halo in the Tirthankara's body colour.
  const style = { '--halo': hex } as CSSProperties;
  return (
    <span className="portrait" style={style}>
      <svg viewBox="0 0 200 222" aria-hidden="true">
        <use href="#figure" fill={`url(#body-${t.colour})`} color={shade(hex, -50)} />
      </svg>
    </span>
  );
}

export function Emblem({ t }: { t: Tirthankara }) {
  return (
    <span className={`emblem${t.glyph ? ' is-glyph' : ''}${t.tint ? ' is-tint' : ''}`} aria-hidden="true">
      {t.icon}
    </span>
  );
}

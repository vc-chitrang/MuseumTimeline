/*
 * Illustrated layers for the Tirthankara scene: sky, birds, hills, temple
 * arch, seated figure, pedestal and foreground flora. Pure SVG/CSS so it stays
 * crisp at any tablet resolution. The figure is placeholder artwork until real
 * Tirthankara imagery is supplied.
 */
import { useId } from 'react';
import { shade } from '../../lib/color';

/** Morning sky with sun glow and drifting clouds (shared by all scenes). */
export function Sky() {
  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-sun" />
      <div className="cloud cloud--1" />
      <div className="cloud cloud--2" />
      <div className="cloud cloud--3" />
      <div className="cloud cloud--4" />
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

export function Hills({ tone }: { tone: 'far' | 'near' }) {
  const far = tone === 'far';
  return (
    <svg className={`hills hills--${tone}`} viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">
      <path
        d={far
          ? 'M0 150 C80 90 150 110 220 80 C300 45 360 95 430 70 C520 35 590 90 660 60 C740 30 820 85 900 65 C950 55 980 70 1000 75 V220 H0Z'
          : 'M0 160 C60 130 120 150 180 128 C250 104 300 140 370 120 C450 98 520 140 600 118 C680 96 740 135 820 115 C900 96 960 125 1000 118 V220 H0Z'}
        fill={far ? '#a9c8c2' : '#7fab84'}
      />
      {!far && Array.from({ length: 46 }, (_, i) => {
        // Tree-line bumps along the near hills.
        const x = i * 22 + ((i * 37) % 11);
        const y = 128 + Math.sin(i * 0.7) * 10;
        const r = 9 + ((i * 13) % 7);
        return <circle key={i} cx={x} cy={y} r={r} fill={i % 3 ? '#6f9e76' : '#5f8f69'} />;
      })}
    </svg>
  );
}

/** Carved sandstone temple arch with a cusped opening (viewBox 600 × 700). */
export function TempleArch() {
  const id = useId().replace(/:/g, '');
  const cx = 300, cy = 372, R = 172, lobes = 9;
  // Cusped (multifoil) arch: small arcs between points on a semicircle.
  let arch = `M128 652 L128 ${cy}`;
  for (let i = 0; i < lobes; i++) {
    const a1 = Math.PI + (Math.PI * (i + 1)) / lobes;
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    const chord = 2 * R * Math.sin(Math.PI / lobes / 2);
    arch += ` A${(chord * 0.62).toFixed(1)} ${(chord * 0.62).toFixed(1)} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  arch += ' L472 652 Z';

  const rosettes = Array.from({ length: 9 }, (_, i) => 70 + i * 57.5);
  return (
    <svg className="temple-svg" viewBox="0 0 600 700" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}stone`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4dfb8" />
          <stop offset="0.55" stopColor="#e2bf8c" />
          <stop offset="1" stopColor="#c99b63" />
        </linearGradient>
        <linearGradient id={`${id}pillar`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c99b63" />
          <stop offset="0.35" stopColor="#f3dcb2" />
          <stop offset="0.7" stopColor="#e0bb85" />
          <stop offset="1" stopColor="#b58652" />
        </linearGradient>
        <radialGradient id={`${id}niche`} cx="50%" cy="38%" r="70%">
          <stop offset="0" stopColor="#9a6c40" />
          <stop offset="0.6" stopColor="#6d4826" />
          <stop offset="1" stopColor="#4a2f17" />
        </radialGradient>
        <linearGradient id={`${id}shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.25" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Crown (shikhara) with kalash finial */}
      <path d="M70 150 C110 92 190 56 300 44 C410 56 490 92 530 150 Z" fill={`url(#${id}stone)`} stroke="#b88a55" strokeWidth="3" />
      <path d="M118 150 C150 108 215 82 300 74 C385 82 450 108 482 150" fill="none" stroke="#c99b63" strokeWidth="4" />
      <path d="M170 150 C195 122 240 104 300 99 C360 104 405 122 430 150" fill="none" stroke="#c99b63" strokeWidth="3" />
      {[0, 1, 2, 3, 4, 5, 6].map(i => <circle key={i} cx={150 + i * 50} cy={136 - Math.sin((i / 6) * Math.PI) * 26} r="5" fill="#b88a55" />)}
      <ellipse cx="300" cy="40" rx="22" ry="9" fill="#d6ad72" />
      <path d="M284 38 C284 18 316 18 316 38 Z" fill="#e8c27f" stroke="#b88a55" strokeWidth="2" />
      <path d="M300 4 L306 20 L294 20 Z" fill="#d6a752" />

      {/* Lintel with rosettes */}
      <rect x="22" y="146" width="556" height="54" rx="4" fill={`url(#${id}stone)`} stroke="#b88a55" strokeWidth="3" />
      <rect x="22" y="146" width="556" height="10" fill="#f6e4c1" opacity="0.7" />
      {rosettes.map(x => (
        <g key={x}>
          <circle cx={x} cy="178" r="12" fill="#e9ca97" stroke="#b88a55" strokeWidth="2" />
          <circle cx={x} cy="178" r="5" fill="#c3925a" />
        </g>
      ))}

      {/* Niche and frame wall */}
      <path d={arch} fill={`url(#${id}niche)`} />
      <path d={`M40 200 H560 V652 H40 Z ${arch}`} fillRule="evenodd" fill={`url(#${id}stone)`} />
      <path d={arch} fill="none" stroke="#f5e2bd" strokeWidth="9" />
      <path d={arch} fill="none" stroke="#a87a47" strokeWidth="3" transform="translate(0 4)" opacity="0.7" />
      <path d={arch} fill={`url(#${id}shade)`} />

      {/* Pillars */}
      {[40, 472].map(x => (
        <g key={x}>
          <rect x={x - 6} y="200" width="100" height="26" fill="#e3c08c" stroke="#b88a55" strokeWidth="2" />
          <rect x={x} y="226" width="88" height="398" fill={`url(#${id}pillar)`} stroke="#b88a55" strokeWidth="2" />
          {[0, 1, 2, 3].map(k => <line key={k} x1={x + 18 + k * 17} y1="250" x2={x + 18 + k * 17} y2="596" stroke="#b88a55" strokeWidth="2" opacity="0.55" />)}
          {[300, 430, 560].map(y => (
            <g key={y}>
              <rect x={x - 2} y={y} width="92" height="14" fill="#ead0a3" stroke="#b88a55" strokeWidth="1.5" />
              <circle cx={x + 44} cy={y + 7} r="4" fill="#b88a55" />
            </g>
          ))}
          <rect x={x - 8} y="618" width="104" height="34" fill="#d9b27c" stroke="#b88a55" strokeWidth="2" />
        </g>
      ))}

      {/* Plinth steps */}
      <rect x="10" y="652" width="580" height="24" fill="#e6c590" stroke="#b88a55" strokeWidth="2" />
      <rect x="0" y="676" width="600" height="24" fill="#d4ab74" stroke="#b88a55" strokeWidth="2" />
    </svg>
  );
}

/** Seated figure in samadhi (padmasana, dhyana mudra) with halo. viewBox 400 × 430. */
export function SeatedFigure({ colour }: { colour: string }) {
  const id = useId().replace(/:/g, '');
  const light = shade(colour, 55), mid = shade(colour, 18), dark = shade(colour, -28), line = shade(colour, -45);
  return (
    <svg className="figure-svg" viewBox="0 0 400 430" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}halo`}>
          <stop offset="0" stopColor="#fff6d6" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#f8d98a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f2c25a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}body`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.55" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>

      {/* Halo (bhamandal) */}
      <circle cx="200" cy="104" r="104" fill={`url(#${id}halo)`} />
      <circle cx="200" cy="104" r="78" fill="none" stroke="#f3cf73" strokeWidth="3" opacity="0.8" />
      <circle cx="200" cy="104" r="86" fill="none" stroke="#f3cf73" strokeWidth="1.5" strokeDasharray="3 7" opacity="0.8" />

      <g fill={`url(#${id}body)`} stroke={line} strokeWidth="1.2" strokeOpacity="0.35">
        {/* Legs crossed in padmasana */}
        <path d="M30 372 C34 320 96 300 200 304 C304 300 366 320 370 372 C372 402 320 414 200 414 C80 414 28 402 30 372Z" />
        {/* Torso and arms */}
        <path d="M200 160 C160 160 128 170 112 196 C100 216 98 246 96 276 C94 304 102 330 128 340 L272 340 C298 330 306 304 304 276 C302 246 300 216 288 196 C272 170 240 160 200 160Z" />
        {/* Neck */}
        <path d="M184 140 H216 V168 H184Z" />
        {/* Ears */}
        <path d="M150 96 C140 96 138 140 150 150 C156 154 160 146 158 128 Z" />
        <path d="M250 96 C260 96 262 140 250 150 C244 154 240 146 242 128 Z" />
        {/* Head */}
        <ellipse cx="200" cy="104" rx="46" ry="54" />
      </g>
      {/* Hair curls and ushnisha */}
      <path d="M154 96 C154 56 176 44 200 44 C224 44 246 56 246 96 C236 78 220 70 200 70 C180 70 164 78 154 96Z" fill={shade(colour, -40)} />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={162 + (i % 7) * 12.5} cy={i < 7 ? 70 : 58} r="5.5" fill={shade(colour, -52)} opacity="0.75" />
      ))}
      <ellipse cx="200" cy="44" rx="16" ry="12" fill={shade(colour, -45)} />

      {/* Serene face: closed eyes, brows, nose, lips */}
      <g fill="none" stroke={line} strokeWidth="2.4" strokeLinecap="round" opacity="0.7">
        <path d="M176 104 Q184 110 192 104" />
        <path d="M208 104 Q216 110 224 104" />
        <path d="M172 94 Q184 88 194 93" opacity="0.6" />
        <path d="M206 93 Q216 88 228 94" opacity="0.6" />
        <path d="M200 106 L197 124 Q200 128 204 125" opacity="0.6" />
        <path d="M190 136 Q200 141 210 136" />
      </g>
      {/* Neck folds, chest srivatsa, hands in dhyana mudra, soles */}
      <g fill="none" stroke={line} strokeWidth="1.6" opacity="0.4">
        <path d="M186 150 Q200 155 214 150" />
        <path d="M186 158 Q200 163 214 158" />
      </g>
      <path d="M200 222 l9 11 -9 11 -9 -11z" fill={light} stroke={line} strokeOpacity="0.4" />
      <path d="M150 334 C150 310 250 310 250 334 C250 352 150 352 150 334Z" fill={light} stroke={line} strokeOpacity="0.35" />
      <path d="M160 330 C175 322 225 322 240 330" fill="none" stroke={line} strokeWidth="1.5" opacity="0.4" />
      <ellipse cx="128" cy="356" rx="30" ry="12" fill={light} stroke={line} strokeOpacity="0.3" transform="rotate(-12 128 356)" />
      <ellipse cx="272" cy="356" rx="30" ry="12" fill={light} stroke={line} strokeOpacity="0.3" transform="rotate(12 272 356)" />
    </svg>
  );
}

/** Stepped pedestal (simhasana) the figure sits on. viewBox 500 × 120. */
export function Pedestal() {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="pedestal-svg" viewBox="0 0 500 120" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf3e2" />
          <stop offset="1" stopColor="#d9c7a6" />
        </linearGradient>
      </defs>
      <rect x="40" y="0" width="420" height="26" rx="4" fill={`url(#${id}p)`} stroke="#b9a07a" strokeWidth="2" />
      <rect x="64" y="26" width="372" height="50" fill="#efe3cb" stroke="#b9a07a" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x={84 + i * 56} y="36" width="40" height="30" rx="4" fill="none" stroke="#c2aa82" strokeWidth="2" />)}
      <rect x="20" y="76" width="460" height="44" rx="4" fill={`url(#${id}p)`} stroke="#b9a07a" strokeWidth="2" />
    </svg>
  );
}

/** Bushes and flowers framing the bottom corners. */
export function Foliage({ side }: { side: 'left' | 'right' }) {
  const leaves = Array.from({ length: 34 }, (_, i) => {
    const x = (i * 53) % 300, y = 60 + ((i * 29) % 140);
    return { x, y, r: 26 + ((i * 17) % 22), c: ['#4f8a4c', '#5f9a55', '#3f7a43', '#6aa85d'][i % 4] };
  });
  const flowers = Array.from({ length: 16 }, (_, i) => ({ x: 20 + ((i * 71) % 260), y: 70 + ((i * 43) % 120), c: i % 3 ? '#f7b6c8' : '#fff4d6' }));
  return (
    <svg className={`foliage foliage--${side}`} viewBox="0 0 320 220" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      {leaves.map((l, i) => <ellipse key={i} cx={l.x} cy={l.y} rx={l.r} ry={l.r * 0.8} fill={l.c} />)}
      {flowers.map((f, i) => (
        <g key={i}>
          <circle cx={f.x} cy={f.y} r="7" fill={f.c} />
          <circle cx={f.x} cy={f.y} r="2.6" fill="#f1c84b" />
        </g>
      ))}
    </svg>
  );
}

/**
 * Positions of map overlays, in map-image pixels, for each map mode and
 * screen shape.
 *
 * Moksha: Sammed Shikharji (20 Tirthankaras) is a ring of portraits over the
 * Bay of Bengal joined to its summit by a light beam; the other four sit next
 * to their own pin.
 *
 * Birth: portraits sit on an ellipse around the Gangetic plain, ordered by the
 * direction of their birthplace so leader lines don't cross.
 *
 * "wide" suits landscape screens; "tall" stretches both arrangements
 * vertically so portrait tablets and phones get bigger, uncrowded portraits.
 */
import { PLACES, TIRTHANKARAS, placeOf, type Mode, type PlaceKey } from '../data/tirthankaras';
import { project, type Point } from './projection';

export const SMALL_CIRCLE_SIZE = 50; // screen px at zoom 1 (before phone scaling)
export const LARGE_CIRCLE_SIZE = 68;

export type Shape = 'wide' | 'tall';
export type LabelSide = 'top' | 'bottom' | 'left' | 'right';

export interface CircleLayout extends Point {
  id: number;
  size: number;
  /** Part of the Sammed Shikharji ring (moksha mode). */
  ring: boolean;
  /** Name always visible (otherwise only when zoomed in or selected). */
  labelAlways: boolean;
  labelSide: LabelSide;
  /** Push a top/bottom label further out (staggers neighbouring names). */
  labelFar: boolean;
  /** Intro animation delay (s). */
  delay: number;
}

/** Ellipse the Sammed Shikharji portraits sit on. */
export interface Ring extends Point { rx: number; ry: number }

export interface ModeLayout {
  circles: CircleLayout[];
  /** Region that must be visible when the view is reset. */
  bounds: { x: number; y: number; w: number; h: number };
  /** Moksha mode only. */
  ring?: Ring;
}

/** Stagger neighbouring top / bottom labels (circles given in ring order). */
function stagger(circles: CircleLayout[]): CircleLayout[] {
  circles.forEach((c, i) => {
    const prev = circles[i - 1];
    const vertical = c.labelSide === 'top' || c.labelSide === 'bottom';
    c.labelFar = vertical && !!prev && prev.labelSide === c.labelSide && !prev.labelFar;
  });
  return circles;
}

function sideFor(angle: number): LabelSide {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  // Only portraits near the very top / bottom get stacked labels; the rest go
  // sideways so neighbouring names never collide.
  return cos > 0.3 ? 'right' : cos < -0.3 ? 'left' : sin < 0 ? 'top' : 'bottom';
}

function boundsOf(pts: Point[], pad: number) {
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const x = Math.min(...xs) - pad, y = Math.min(...ys) - pad;
  return { x, y, w: Math.max(...xs) + pad - x, h: Math.max(...ys) + pad - y };
}

// Moksha ----------------------------------------------------------------------

const MOKSHA: Record<Shape, { ring: Ring; ringSize: number; singles: Partial<Record<PlaceKey, Point>> }> = {
  wide: {
    ring: { ...project(14.5, 88.5), rx: 390, ry: 390 },
    ringSize: SMALL_CIRCLE_SIZE,
    singles: { ashtapad: { x: 760, y: 300 }, champapuri: { x: 1580, y: 470 }, pavapuri: { x: 1010, y: 455 }, girnar: { x: 250, y: 965 } }
  },
  tall: {
    ring: { ...project(11.8, 87.6), rx: 360, ry: 590 },
    ringSize: 39,
    singles: { ashtapad: { x: 610, y: 290 }, champapuri: { x: 1560, y: 470 }, pavapuri: { x: 980, y: 420 }, girnar: { x: 430, y: 1080 } }
  }
};

function mokshaLayout(shape: Shape): ModeLayout {
  const { ring: R, ringSize, singles: S } = MOKSHA[shape];
  const shikharji = PLACES.shikharji;
  const ringIds = TIRTHANKARAS.filter(t => t.moksha === 'shikharji').map(t => t.id);

  // Leave a gap in the ring where the beam leaves towards the summit marker.
  const beamAngle = Math.atan2((shikharji.y - R.y) / R.ry, (shikharji.x - R.x) / R.rx);
  const gap = (34 * Math.PI) / 180;
  const step = (2 * Math.PI - gap) / (ringIds.length - 1);

  const ring = ringIds.map((id, i): CircleLayout => {
    const a = beamAngle + gap / 2 + i * step;
    return {
      id, ring: true, size: ringSize, labelAlways: false, labelSide: sideFor(a), labelFar: false,
      x: R.x + R.rx * Math.cos(a),
      y: R.y + R.ry * Math.sin(a),
      delay: 1.7 + i * 0.05
    };
  });

  const singles = TIRTHANKARAS.filter(t => t.moksha !== 'shikharji').map((t, i): CircleLayout => ({
    id: t.id, ring: false, size: LARGE_CIRCLE_SIZE, labelAlways: true, labelSide: 'bottom', labelFar: false,
    ...(S[t.moksha] as Point),
    delay: 1.5 + i * 0.12
  }));

  const circles = [...stagger(ring), ...singles].sort((a, b) => a.id - b.id);
  const pins = Object.values(PLACES).filter(p => TIRTHANKARAS.some(t => t.moksha === p.key));
  return { circles, ring: R, bounds: boundsOf([...circles, ...pins], 120) };
}

// Birth -----------------------------------------------------------------------

const BIRTH: Record<Shape, Ring> = {
  wide: { ...project(26.1, 82.6), rx: 660, ry: 430 },
  tall: { ...project(24.6, 82.4), rx: 480, ry: 610 }
};

function birthLayout(shape: Shape): ModeLayout {
  const E = BIRTH[shape];
  const n = TIRTHANKARAS.length;
  const step = (2 * Math.PI) / n;

  // Direction of each birthplace from the centre; ties keep Tirthankara order.
  const items = TIRTHANKARAS.map(t => {
    const p = PLACES[t.birth];
    return { id: t.id, angle: Math.atan2((p.y - E.y) / E.ry, (p.x - E.x) / E.rx) };
  }).sort((a, b) => a.angle - b.angle || a.id - b.id);

  // Rotate the evenly spaced slots to best match the real directions.
  let sx = 0, sy = 0;
  items.forEach((it, i) => { sx += Math.cos(it.angle - i * step); sy += Math.sin(it.angle - i * step); });
  const offset = Math.atan2(sy, sx);

  const circles = items.map((it, i): CircleLayout => {
    const a = offset + i * step;
    return {
      id: it.id, ring: false, size: SMALL_CIRCLE_SIZE, labelAlways: false, labelSide: sideFor(a), labelFar: false,
      x: E.x + E.rx * Math.cos(a),
      y: E.y + E.ry * Math.sin(a),
      delay: 1.5 + ((it.id - 1) * 0.05)
    };
  });

  return {
    circles: stagger(circles).sort((a, b) => a.id - b.id),
    bounds: { x: E.x - E.rx - 110, y: E.y - E.ry - 110, w: (E.rx + 110) * 2, h: (E.ry + 110) * 2 }
  };
}

export const LAYOUTS: Record<Shape, Record<Mode, ModeLayout>> = {
  wide: { moksha: mokshaLayout('wide'), birth: birthLayout('wide') },
  tall: { moksha: mokshaLayout('tall'), birth: birthLayout('tall') }
};

/** Portrait screens (phones, portrait tablets) use the tall arrangement. */
export const shapeFor = (width: number, height: number): Shape => (width / height < 0.85 ? 'tall' : 'wide');

/** Place a Tirthankara's portrait points to in the given mode. */
export const anchorFor = (mode: Mode, id: number) => PLACES[placeOf(TIRTHANKARAS[id - 1], mode)];

/** Quadratic curve from a marker to its portrait, bowed for a softer look. */
export function leaderPath(from: Point, to: Point, bow = 0.18): string {
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  const dx = to.x - from.x, dy = to.y - from.y;
  const cx = mx - dy * bow, cy = my + dx * bow;
  return `M${from.x.toFixed(1)} ${from.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

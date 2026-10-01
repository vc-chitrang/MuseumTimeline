/**
 * Positions of map overlays, in map-image pixels, for each map mode.
 *
 * Moksha: Sammed Shikharji (20 Tirthankaras) is a ring of portraits over the
 * Bay of Bengal joined to its summit by a light beam; the other four sit next
 * to their own pin.
 *
 * Birth: portraits sit on an ellipse around the Gangetic plain, ordered by the
 * direction of their birthplace so leader lines don't cross.
 */
import { PLACES, TIRTHANKARAS, placeOf, type Mode, type PlaceKey } from '../data/tirthankaras';
import { project, type Point } from './projection';

export const SMALL_CIRCLE_SIZE = 50; // screen px at zoom 1
export const LARGE_CIRCLE_SIZE = 68;

export const HUB: Point = project(14.5, 88.5);
export const RING_RADIUS = 390;

export type LabelSide = 'top' | 'bottom' | 'left' | 'right';

export interface CircleLayout extends Point {
  id: number;
  size: number;
  /** Part of the Sammed Shikharji ring (moksha mode). */
  ring: boolean;
  /** Name always visible (otherwise only when zoomed in or selected). */
  labelAlways: boolean;
  labelSide: LabelSide;
  /** Intro animation delay (s). */
  delay: number;
}

export interface ModeLayout {
  circles: CircleLayout[];
  /** Region that must be visible when the view is reset. */
  bounds: { x: number; y: number; w: number; h: number };
}

function sideFor(angle: number): LabelSide {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return cos > 0.55 ? 'right' : cos < -0.55 ? 'left' : sin < 0 ? 'top' : 'bottom';
}

// Moksha ----------------------------------------------------------------------

/** Hand-placed portraits for the Tirthankaras not at Sammed Shikharji. */
const MOKSHA_SINGLES: Partial<Record<PlaceKey, Point>> = {
  ashtapad: { x: 760, y: 300 },
  champapuri: { x: 1580, y: 470 },
  pavapuri: { x: 1060, y: 520 },
  girnar: { x: 250, y: 965 }
};

function mokshaLayout(): ModeLayout {
  const shikharji = PLACES.shikharji;
  const ringIds = TIRTHANKARAS.filter(t => t.moksha === 'shikharji').map(t => t.id);

  // Leave a gap in the ring where the beam leaves towards the summit marker.
  const beamAngle = Math.atan2(shikharji.y - HUB.y, shikharji.x - HUB.x);
  const gap = (34 * Math.PI) / 180;
  const step = (2 * Math.PI - gap) / (ringIds.length - 1);

  const ring = ringIds.map((id, i): CircleLayout => {
    const a = beamAngle + gap / 2 + i * step;
    return {
      id, ring: true, size: SMALL_CIRCLE_SIZE, labelAlways: false, labelSide: sideFor(a),
      x: HUB.x + RING_RADIUS * Math.cos(a),
      y: HUB.y + RING_RADIUS * Math.sin(a),
      delay: 1.7 + i * 0.05
    };
  });

  const singles = TIRTHANKARAS.filter(t => t.moksha !== 'shikharji').map((t, i): CircleLayout => ({
    id: t.id, ring: false, size: LARGE_CIRCLE_SIZE, labelAlways: true, labelSide: 'bottom',
    ...(MOKSHA_SINGLES[t.moksha] as Point),
    delay: 1.5 + i * 0.12
  }));

  return {
    circles: [...ring, ...singles].sort((a, b) => a.id - b.id),
    bounds: { x: 150, y: 215, w: 1700, h: 1395 }
  };
}

// Birth -----------------------------------------------------------------------

const BIRTH_CENTRE: Point = project(26.1, 82.6);
const BIRTH_RX = 660;
const BIRTH_RY = 430;

function birthLayout(): ModeLayout {
  const n = TIRTHANKARAS.length;
  const step = (2 * Math.PI) / n;

  // Direction of each birthplace from the centre; ties keep Tirthankara order.
  const items = TIRTHANKARAS.map(t => {
    const p = PLACES[t.birth];
    return { id: t.id, angle: Math.atan2((p.y - BIRTH_CENTRE.y) / BIRTH_RY, (p.x - BIRTH_CENTRE.x) / BIRTH_RX) };
  }).sort((a, b) => a.angle - b.angle || a.id - b.id);

  // Rotate the evenly spaced slots to best match the real directions.
  let sx = 0, sy = 0;
  items.forEach((it, i) => { sx += Math.cos(it.angle - i * step); sy += Math.sin(it.angle - i * step); });
  const offset = Math.atan2(sy, sx);

  const circles = items.map((it, i): CircleLayout => {
    const a = offset + i * step;
    return {
      id: it.id, ring: false, size: SMALL_CIRCLE_SIZE, labelAlways: false, labelSide: sideFor(a),
      x: BIRTH_CENTRE.x + BIRTH_RX * Math.cos(a),
      y: BIRTH_CENTRE.y + BIRTH_RY * Math.sin(a),
      delay: 1.5 + ((it.id - 1) * 0.05)
    };
  });

  return {
    circles: circles.sort((a, b) => a.id - b.id),
    bounds: { x: BIRTH_CENTRE.x - BIRTH_RX - 110, y: BIRTH_CENTRE.y - BIRTH_RY - 110, w: (BIRTH_RX + 110) * 2, h: (BIRTH_RY + 110) * 2 }
  };
}

export const LAYOUTS: Record<Mode, ModeLayout> = {
  moksha: mokshaLayout(),
  birth: birthLayout()
};

export function circleFor(mode: Mode, id: number): CircleLayout {
  return LAYOUTS[mode].circles[id - 1];
}

/** Place a Tirthankara's portrait points to in the given mode. */
export const anchorFor = (mode: Mode, id: number) => PLACES[placeOf(TIRTHANKARAS[id - 1], mode)];

/** Quadratic curve from a marker to its portrait, bowed for a softer look. */
export function leaderPath(from: Point, to: Point, bow = 0.18): string {
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  const dx = to.x - from.x, dy = to.y - from.y;
  const cx = mx - dy * bow, cy = my + dx * bow;
  return `M${from.x.toFixed(1)} ${from.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

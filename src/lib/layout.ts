/**
 * Positions of map overlays, in map-image pixels.
 *
 * Sammed Shikharji (20 Tirthankaras) is shown as a ring of portraits over the
 * Bay of Bengal, joined to its summit marker by a light beam. The other four
 * Tirthankaras sit next to their own moksha pin with a leader line.
 */
import { PLACES, TIRTHANKARAS, type PlaceKey } from '../data/tirthankaras';
import { project, type Point } from './projection';

export const RING_CIRCLE_SIZE = 46; // screen px at zoom 1
export const SINGLE_CIRCLE_SIZE = 66;

export const HUB: Point = project(14.5, 88.5);
export const RING_RADIUS = 390;

/** Hand-placed portrait positions for the Tirthankaras not at Sammed Shikharji. */
const SINGLE_OFFSETS: Partial<Record<PlaceKey, Point>> = {
  ashtapad: { x: 760, y: 300 },
  champapuri: { x: 1580, y: 470 },
  pavapuri: { x: 1060, y: 520 },
  girnar: { x: 250, y: 965 }
};

export interface CircleLayout extends Point {
  id: number;
  ring: boolean;
  /** Side of the portrait where its name is drawn (outside the ring). */
  labelSide: 'top' | 'bottom' | 'left' | 'right';
  /** Animation delay (s) for the intro. */
  delay: number;
}

function buildLayout(): CircleLayout[] {
  const shikharji = PLACES.shikharji;
  const ringIds = TIRTHANKARAS.filter(t => t.moksha === 'shikharji').map(t => t.id);

  // Leave a gap in the ring where the beam leaves towards the summit marker.
  const beamAngle = Math.atan2(shikharji.y - HUB.y, shikharji.x - HUB.x);
  const gap = (34 * Math.PI) / 180;
  const span = 2 * Math.PI - gap;
  const step = span / (ringIds.length - 1);

  const ring = ringIds.map((id, i): CircleLayout => {
    const a = beamAngle + gap / 2 + i * step;
    const cos = Math.cos(a), sin = Math.sin(a);
    const labelSide: CircleLayout['labelSide'] =
      cos > 0.55 ? 'right' : cos < -0.55 ? 'left' : sin < 0 ? 'top' : 'bottom';
    return {
      id,
      ring: true,
      labelSide,
      x: HUB.x + RING_RADIUS * Math.cos(a),
      y: HUB.y + RING_RADIUS * Math.sin(a),
      delay: 1.7 + i * 0.05
    };
  });

  const singles = TIRTHANKARAS.filter(t => t.moksha !== 'shikharji').map((t, i) => ({
    id: t.id,
    ring: false,
    labelSide: 'bottom' as const,
    ...(SINGLE_OFFSETS[t.moksha] as Point),
    delay: 1.5 + i * 0.12
  }));

  return [...ring, ...singles].sort((a, b) => a.id - b.id);
}

export const CIRCLES: CircleLayout[] = buildLayout();
export const CIRCLE_BY_ID = new Map(CIRCLES.map(c => [c.id, c]));

/** Map region that must be visible when the view is reset. */
export const CONTENT_BOUNDS = { x: 150, y: 215, w: 1700, h: 1395 };

/** Quadratic curve from a pin to its portrait, bowed for a softer look. */
export function leaderPath(from: Point, to: Point, bow = 0.18): string {
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  const dx = to.x - from.x, dy = to.y - from.y;
  const cx = mx - dy * bow, cy = my + dx * bow;
  return `M${from.x.toFixed(1)} ${from.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

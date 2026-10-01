import { useImperativeHandle, useRef, type CSSProperties, type Ref } from 'react';
import { PLACES, TIRTHANKARAS, type PlaceKey } from '../data/tirthankaras';
import {
  CIRCLES, CONTENT_BOUNDS, HUB, RING_CIRCLE_SIZE, RING_RADIUS, SINGLE_CIRCLE_SIZE, leaderPath
} from '../lib/layout';
import { MAP_HEIGHT, MAP_WIDTH } from '../lib/projection';
import { usePanZoom } from '../hooks/usePanZoom';
import { Portrait } from './Portrait';

export type Selection =
  | { kind: 'tirthankara'; id: number }
  | { kind: 'place'; key: PlaceKey }
  | null;

export interface MapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  /** Bring the selection into view above a panel of the given height. */
  focusSelection: (sel: Selection, panelHeight: number) => void;
}

interface Props {
  ref?: Ref<MapHandle>;
  selection: Selection;
  onSelect: (sel: Selection) => void;
  onImageLoad: () => void;
  onInteract: () => void;
}

const BASE = import.meta.env.BASE_URL;
const ASSET = (p: string) => `${BASE}assets/images/${p}`;

/** Where each place label sits relative to its marker. */
const LABEL_SIDE: Record<PlaceKey, 'below' | 'left' | 'right'> = {
  shikharji: 'left',
  ashtapad: 'right',
  champapuri: 'right',
  pavapuri: 'left',
  girnar: 'below'
};

const pos = (x: number, y: number, extra?: Record<string, string | number>) =>
  ({ '--x': `${x}px`, '--y': `${y}px`, ...extra }) as CSSProperties;

export function MapView({ ref, selection, onSelect, onImageLoad, onInteract }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pz = usePanZoom(viewportRef, stageRef, { bounds: CONTENT_BOUNDS, onInteract });

  useImperativeHandle(ref, () => ({
    zoomIn: () => pz.zoomBy(1.5),
    zoomOut: () => pz.zoomBy(1 / 1.5),
    reset: () => pz.reset(true),
    focusSelection: (sel, panelHeight) => {
      if (!sel) return pz.reset(true);
      const box = (cx: number, cy: number, w: number, h: number) => ({ x: cx - w / 2, y: cy - h / 2, w, h });
      if (sel.kind === 'tirthankara') {
        const c = CIRCLES.find(c => c.id === sel.id);
        if (!c) return;
        const p = PLACES[TIRTHANKARAS[c.id - 1].moksha];
        // Ring: the portrait and its neighbours; single: portrait plus its pin.
        if (c.ring) pz.focusBox(box(c.x, c.y, 420, 360), panelHeight, 2.4);
        else {
          const x = Math.min(c.x, p.x) - 120, y = Math.min(c.y, p.y) - 120;
          pz.focusBox({ x, y, w: Math.abs(c.x - p.x) + 240, h: Math.abs(c.y - p.y) + 240 }, panelHeight, 2);
        }
      } else if (sel.key === 'shikharji') {
        const top = PLACES.shikharji.y - 60, bottom = HUB.y + RING_RADIUS + 80;
        pz.focusBox({ x: HUB.x - RING_RADIUS - 120, y: top, w: (RING_RADIUS + 120) * 2, h: bottom - top }, panelHeight, 2);
      } else {
        const p = PLACES[sel.key];
        const c = CIRCLES.find(c => TIRTHANKARAS[c.id - 1].moksha === sel.key)!;
        const x = Math.min(c.x, p.x) - 120, y = Math.min(c.y, p.y) - 120;
        pz.focusBox({ x, y, w: Math.abs(c.x - p.x) + 240, h: Math.abs(c.y - p.y) + 240 }, panelHeight, 2);
      }
    }
  }), [pz]);

  // Which elements are highlighted by the current selection.
  const activeIds = new Set<number>();
  let activePlace: PlaceKey | null = null;
  if (selection?.kind === 'tirthankara') {
    activeIds.add(selection.id);
    activePlace = TIRTHANKARAS[selection.id - 1].moksha;
  } else if (selection?.kind === 'place') {
    activePlace = selection.key;
    TIRTHANKARAS.filter(t => t.moksha === selection.key).forEach(t => activeIds.add(t.id));
  }
  const on = (b: boolean) => (b ? ' is-active' : '');
  const shikharji = PLACES.shikharji;
  const beam = leaderPath(HUB, shikharji, -0.12);

  return (
    <div ref={viewportRef} className={`map-viewport${selection ? ' has-focus' : ''}`}>
      <div className="map-backdrop" />
      <div ref={stageRef} className="map-stage">
        <div className="map-intro">
          <picture>
            <source srcSet={ASSET('india-map.webp')} type="image/webp" />
            <img
              className="map-image"
              src={ASSET('india-map.jpg')}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              alt="Relief map of India and the Himalaya"
              draggable={false}
              onLoad={onImageLoad}
              ref={img => { if (img?.complete) onImageLoad(); }}
            />
          </picture>

          {/* Lines: ring, spokes, beam and leaders */}
          <svg className="map-overlay" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden="true">
            <defs>
              <linearGradient id="beamGradient" gradientUnits="userSpaceOnUse"
                x1={HUB.x} y1={HUB.y} x2={shikharji.x} y2={shikharji.y}>
                <stop offset="0" stopColor="#f7dc8f" stopOpacity="0.25" />
                <stop offset="1" stopColor="#fff3c7" stopOpacity="1" />
              </linearGradient>
            </defs>
            <circle className="ring-orbit ring-orbit--outer" cx={HUB.x} cy={HUB.y} r={RING_RADIUS + 70} />
            <circle className="ring-orbit" cx={HUB.x} cy={HUB.y} r={RING_RADIUS} />
            {CIRCLES.filter(c => c.ring).map(c => (
              <path key={c.id} className={`spoke${on(activeIds.has(c.id))}`} pathLength={1}
                d={`M${HUB.x} ${HUB.y} L${c.x} ${c.y}`} style={{ '--d': `${c.delay - 0.2}s` } as CSSProperties} />
            ))}
            <path className="beam" pathLength={1} d={beam} style={{ '--d': '1.2s' } as CSSProperties} />
            <path className="beam-flow" pathLength={1} d={beam} />
            {CIRCLES.filter(c => !c.ring).map(c => {
              const p = PLACES[TIRTHANKARAS[c.id - 1].moksha];
              return (
                <path key={c.id} className={`leader${on(activeIds.has(c.id))}`} pathLength={1}
                  d={leaderPath(p, c)} style={{ '--d': `${c.delay - 0.3}s` } as CSSProperties} />
              );
            })}
          </svg>

          <div className="markers">
            {/* Moksha places */}
            {Object.values(PLACES).map((p, i) => {
              const label = <span className={`place-label place-label--${LABEL_SIDE[p.key]}${p.key === 'shikharji' ? '' : ' place-label--secondary'}`}>{p.name}</span>;
              return (
                <div key={p.key} className="marker" style={pos(p.x, p.y, { '--d': `${0.9 + i * 0.12}s` })}>
                  {p.key === 'shikharji' ? (
                    <>
                      <span className="summit-halo" />
                      <button type="button" className={`summit${on(activePlace === p.key)}`}
                        aria-label={`${p.name}, ${p.region}`}
                        onClick={() => onSelect({ kind: 'place', key: p.key })}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 20 9.5 7l3.5 6 2.5-4L22 20z" /></svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="pin-pulse" />
                      <button type="button" className={`pin${on(activePlace === p.key)}`}
                        aria-label={`${p.name}, ${p.region}`}
                        onClick={() => onSelect({ kind: 'place', key: p.key })}>
                        <svg viewBox="0 0 32 46" aria-hidden="true">
                          <defs>
                            <linearGradient id={`pin-${p.key}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0" stopColor="#f08a4b" />
                              <stop offset="1" stopColor="#b8401c" />
                            </linearGradient>
                          </defs>
                          <path d="M16 45C16 45 2 27 2 16a14 14 0 0 1 28 0c0 11-14 29-14 29z"
                            fill={`url(#pin-${p.key})`} stroke="#fff3d6" strokeWidth="2" />
                          <circle cx="16" cy="16" r="6" fill="#fff3d6" />
                        </svg>
                      </button>
                    </>
                  )}
                  {label}
                </div>
              );
            })}

            {/* Sammed Shikharji hub */}
            <div className="marker" style={pos(HUB.x, HUB.y)}>
              <button type="button" className={`hub${on(activePlace === 'shikharji' && selection?.kind === 'place')}`}
                aria-label="Sammed Shikharji: 20 Tirthankaras attained moksha here"
                onClick={() => onSelect({ kind: 'place', key: 'shikharji' })}>
                <span className="hub-count">20</span>
                <span className="hub-title">Sammed Shikharji</span>
                <span className="hub-sub">Tirthankaras</span>
              </button>
            </div>

            {/* Tirthankara portraits */}
            {CIRCLES.map(c => {
              const t = TIRTHANKARAS[c.id - 1];
              const size = c.ring ? RING_CIRCLE_SIZE : SINGLE_CIRCLE_SIZE;
              return (
                <div key={c.id} className="marker" style={pos(c.x, c.y)}>
                  <button type="button"
                    className={`t-circle${c.ring ? ' is-ring' : ''} t-circle--label-${c.labelSide}${on(activeIds.has(c.id))}`}
                    style={{ '--size': `${size}px`, '--d': `${c.delay}s` } as CSSProperties}
                    aria-label={`${t.id}. ${t.name}`}
                    onClick={() => onSelect({ kind: 'tirthankara', id: t.id })}>
                    <Portrait t={t} />
                    <span className="t-num">{t.id}</span>
                    <span className="t-name">
                      {t.name}
                      {!c.ring && <small>{PLACES[t.moksha].name}</small>}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="map-vignette" />
    </div>
  );
}

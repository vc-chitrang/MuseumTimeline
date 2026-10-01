import { useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type Ref } from 'react';
import { PLACES, TIRTHANKARAS, placeOf, placesFor, type Mode, type PlaceKey } from '../data/tirthankaras';
import { HUB, LAYOUTS, RING_RADIUS, anchorFor, circleFor, leaderPath } from '../lib/layout';
import { MAP_HEIGHT, MAP_WIDTH } from '../lib/projection';
import { usePanZoom, type PanelInset } from '../hooks/usePanZoom';
import { EmblemBadge, Portrait } from './Portrait';

export type Selection =
  | { kind: 'tirthankara'; id: number }
  | { kind: 'place'; key: PlaceKey }
  | null;

export interface MapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  /** Bring the selection into view beside the detail panel. */
  focusSelection: (sel: Selection, panel: PanelInset) => void;
}

interface Props {
  ref?: Ref<MapHandle>;
  mode: Mode;
  selection: Selection;
  onSelect: (sel: Selection) => void;
  onImageLoad: () => void;
  onInteract: () => void;
}

const BASE = import.meta.env.BASE_URL;
const ASSET = (p: string) => `${BASE}assets/images/${p}`;

/** Duration of the portrait glide when switching modes (keep in sync with CSS). */
const MORPH_MS = 1100;

/** Moksha-mode label placement relative to each pin. */
const MOKSHA_LABEL: Partial<Record<PlaceKey, 'below' | 'left' | 'right'>> = {
  shikharji: 'left', ashtapad: 'right', champapuri: 'right', pavapuri: 'left', girnar: 'below'
};

const vars = (v: Record<string, string | number>) => v as CSSProperties;
const pos = (x: number, y: number, extra?: Record<string, string | number>) =>
  vars({ '--x': `${x}px`, '--y': `${y}px`, ...extra });

export function MapView({ ref, mode, selection, onSelect, onImageLoad, onInteract }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layout = LAYOUTS[mode];
  const pz = usePanZoom(viewportRef, stageRef, { bounds: layout.bounds, onInteract });

  // After the first mode switch, overlays animate in quickly instead of
  // waiting for the intro timings.
  const [switched, setSwitched] = useState(false);
  const [morphing, setMorphing] = useState(false);
  const lastMode = useRef(mode);
  const resetView = pz.reset;
  useEffect(() => {
    if (mode === lastMode.current) return;
    lastMode.current = mode;
    setSwitched(true);
    setMorphing(true);
    resetView(true);
    const t = window.setTimeout(() => setMorphing(false), MORPH_MS);
    return () => window.clearTimeout(t);
  }, [mode, resetView]);

  const delay = (intro: number, quick: number) => `${switched ? quick : intro}s`;

  useImperativeHandle(ref, () => ({
    zoomIn: () => pz.zoomBy(1.5),
    zoomOut: () => pz.zoomBy(1 / 1.5),
    reset: () => pz.reset(true),
    focusSelection: (sel, panel) => {
      if (!sel) return pz.reset(true);
      const around = (pts: { x: number; y: number }[], pad: number) => {
        const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
        const x = Math.min(...xs) - pad, y = Math.min(...ys) - pad;
        return { x, y, w: Math.max(...xs) - Math.min(...xs) + pad * 2, h: Math.max(...ys) - Math.min(...ys) + pad * 2 };
      };
      if (sel.kind === 'tirthankara') {
        const c = circleFor(mode, sel.id);
        if (c.ring) pz.focusBox({ x: c.x - 210, y: c.y - 180, w: 420, h: 360 }, panel, 2.4);
        else pz.focusBox(around([c, anchorFor(mode, sel.id)], 120), panel, 2);
      } else if (mode === 'moksha' && sel.key === 'shikharji') {
        const top = PLACES.shikharji.y - 60, bottom = HUB.y + RING_RADIUS + 80;
        pz.focusBox({ x: HUB.x - RING_RADIUS - 120, y: top, w: (RING_RADIUS + 120) * 2, h: bottom - top }, panel, 2);
      } else {
        const ids = TIRTHANKARAS.filter(t => placeOf(t, mode) === sel.key).map(t => t.id);
        pz.focusBox(around([PLACES[sel.key], ...ids.map(id => circleFor(mode, id))], 120), panel, 2);
      }
    }
  }), [mode, pz]);

  // Which elements are highlighted by the current selection.
  const activeIds = new Set<number>();
  let activePlace: PlaceKey | null = null;
  if (selection?.kind === 'tirthankara') {
    activeIds.add(selection.id);
    activePlace = placeOf(TIRTHANKARAS[selection.id - 1], mode);
  } else if (selection?.kind === 'place') {
    activePlace = selection.key;
    TIRTHANKARAS.filter(t => placeOf(t, mode) === selection.key).forEach(t => activeIds.add(t.id));
  }
  const on = (b: boolean) => (b ? ' is-active' : '');
  const shikharji = PLACES.shikharji;
  const beam = leaderPath(HUB, shikharji, -0.12);
  const places = placesFor(mode);

  return (
    <div
      ref={viewportRef}
      className={`map-viewport mode-${mode}${selection ? ' has-focus' : ''}${morphing ? ' is-morphing' : ''}`}
    >
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

          {/* Lines. Keyed by mode so they redraw on every switch. */}
          <svg key={mode} className="map-overlay" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden="true">
            {mode === 'moksha' && (
              <>
                <defs>
                  <linearGradient id="beamGradient" gradientUnits="userSpaceOnUse"
                    x1={HUB.x} y1={HUB.y} x2={shikharji.x} y2={shikharji.y}>
                    <stop offset="0" stopColor="#f7dc8f" stopOpacity="0.25" />
                    <stop offset="1" stopColor="#fff3c7" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <circle className="ring-orbit ring-orbit--outer" cx={HUB.x} cy={HUB.y} r={RING_RADIUS + 70} />
                <circle className="ring-orbit" cx={HUB.x} cy={HUB.y} r={RING_RADIUS} />
                {layout.circles.filter(c => c.ring).map(c => (
                  <path key={c.id} className={`spoke${on(activeIds.has(c.id))}`} pathLength={1}
                    d={`M${HUB.x} ${HUB.y} L${c.x} ${c.y}`}
                    style={vars({ '--d': delay(c.delay - 0.2, 0.5 + c.id * 0.02) })} />
                ))}
                <path className="beam" pathLength={1} d={beam} style={vars({ '--d': delay(1.2, 0.4) })} />
                <path className="beam-flow" pathLength={1} d={beam} />
              </>
            )}
            {layout.circles.filter(c => !c.ring).map(c => (
              <path key={c.id} className={`leader${on(activeIds.has(c.id))}`} pathLength={1}
                d={leaderPath(anchorFor(mode, c.id), c, mode === 'birth' ? 0.08 : 0.18)}
                style={vars({ '--d': delay(c.delay - 0.3, 0.55 + c.id * 0.02) })} />
            ))}
          </svg>

          <div className="markers">
            {/* Places for the current mode */}
            {places.map((p, i) => {
              const d = delay(0.9 + i * 0.12, 0.25 + i * 0.03);
              const labelSide = mode === 'moksha' ? MOKSHA_LABEL[p.key] ?? 'below' : 'below';
              const secondary = !(mode === 'moksha' && p.key === 'shikharji');
              const select = () => onSelect({ kind: 'place', key: p.key });
              const aria = `${p.name}, ${p.region}`;
              return (
                <div key={`${mode}-${p.key}`} className={`marker marker--place${on(activePlace === p.key)}`} style={pos(p.x, p.y, { '--d': d })}>
                  <div className="marker-scale">
                    {mode === 'moksha' && p.key === 'shikharji' ? (
                      <>
                        <span className="summit-halo" />
                        <button type="button" className={`summit${on(activePlace === p.key)}`} aria-label={aria} onClick={select}>
                          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 20 9.5 7l3.5 6 2.5-4L22 20z" /></svg>
                        </button>
                      </>
                    ) : mode === 'moksha' ? (
                      <>
                        <span className="pin-pulse" />
                        <button type="button" className={`pin${on(activePlace === p.key)}`} aria-label={aria} onClick={select}>
                          <svg viewBox="0 0 32 46" aria-hidden="true">
                            <path d="M16 45C16 45 2 27 2 16a14 14 0 0 1 28 0c0 11-14 29-14 29z"
                              fill="url(#pinGradient)" stroke="#fff3d6" strokeWidth="2" />
                            <circle cx="16" cy="16" r="6" fill="#fff3d6" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <button type="button" className={`dot${on(activePlace === p.key)}`} aria-label={aria} onClick={select} />
                    )}
                    <span className={`place-label place-label--${labelSide}${secondary ? ' place-label--secondary' : ''}`}>
                      {p.name}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Sammed Shikharji hub (moksha mode) */}
            {mode === 'moksha' && (
              <div className="marker" style={pos(HUB.x, HUB.y)}>
                <div className="marker-scale">
                  <button type="button"
                    className={`hub${on(activePlace === 'shikharji' && selection?.kind === 'place')}`}
                    style={vars({ '--d': delay(1.3, 0.35) })}
                    aria-label="Sammed Shikharji: 20 Tirthankaras attained moksha here"
                    onClick={() => onSelect({ kind: 'place', key: 'shikharji' })}>
                    <span className="hub-count">20</span>
                    <span className="hub-title">Sammed Shikharji</span>
                    <span className="hub-sub">Tirthankaras</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tirthankara portraits: same elements in both modes, so they glide */}
            {layout.circles.map(c => {
              const t = TIRTHANKARAS[c.id - 1];
              return (
                <div key={c.id} className="marker marker--circle" style={pos(c.x, c.y)}>
                  <div className="marker-scale">
                    <button type="button"
                      className={`t-circle t-circle--label-${c.labelSide}${c.labelFar ? ' t-circle--label-far' : ''}${c.labelAlways ? ' is-labelled' : ''}${on(activeIds.has(c.id))}`}
                      style={vars({ '--size': `${c.size}px`, '--d': `${c.delay}s` })}
                      aria-label={`${t.id}. ${t.name}`}
                      onClick={() => onSelect({ kind: 'tirthankara', id: t.id })}>
                      <Portrait t={t} />
                      <EmblemBadge t={t} />
                      <span className="t-num">{t.id}</span>
                      <span className="t-name">
                        {t.name}
                        {c.labelAlways && <small>{PLACES[placeOf(t, mode)].name}</small>}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shared gradients */}
      <svg width="0" height="0" className="sr-defs" aria-hidden="true">
        <defs>
          <linearGradient id="pinGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f08a4b" />
            <stop offset="1" stopColor="#b8401c" />
          </linearGradient>
        </defs>
      </svg>
      <div className="map-vignette" />
    </div>
  );
}

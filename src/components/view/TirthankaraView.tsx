import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { TIRTHANKARAS, type Tirthankara } from '../../data/tirthankaras';
import { treeImage } from '../../data/details';
import { DetailsModal } from './DetailsModal';
import { Birds, Figure, SCENE, Sky } from './SceneArt';

const BASE = import.meta.env.BASE_URL;
const TRANSITION_MS = 1150;
const CLOSE_MS = 520;
/** Fraction of a full swipe needed to commit to the next Tirthankara. */
const COMMIT_AT = 0.22;

/** Page distance (fraction of screen height) a layer with factor 1 travels. */
const TRAVEL = 0.78;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface Props {
  id: number;
  onClose: () => void;
  /** Reports the Tirthankara now shown (keeps the app in sync). */
  onChange?: (id: number) => void;
}

/**
 * Parallax layer factors: how fast each layer moves relative to a full page
 * swipe (1 = with the page). Far layers drift, near layers rush past.
 */
const F = { hillsFar: 0.16, hillsNear: 0.3, sideTrees: 0.44, tree: 0.56, ground: 0.68, temple: 0.74, pedestal: 0.92, figure: 0.94, emblem: 1.04, foliage: 1.22 };

type Role = 'current' | 'out' | 'in';

function Layer({ f, name, role, enter, children }: {
  f: number; name: string; role: Role; enter: number; children: React.ReactNode;
}) {
  return (
    <div className={`layer l-${name} layer--${role}`} data-f={f} data-role={role}
      style={{ '--f': f, '--enter': enter } as CSSProperties} aria-hidden={role === 'out'}>
      <div className="layer-in">{children}</div>
    </div>
  );
}

/** A Tirthankara's scene as separate depth layers (back to front). */
function sceneLayers(t: Tirthankara, role: Role) {
  const L = (name: string, f: number, enter: number, el: React.ReactNode) => (
    <Layer key={`${t.id}-${name}`} name={name} f={f} role={role} enter={enter}>{el}</Layer>
  );
  const img = (cls: string, src: string) => <img className={cls} src={src} alt="" draggable={false} />;
  return [
    L('hills-far', F.hillsFar, 0, img('hills hills--far', SCENE('hills-far'))),
    L('hills-near', F.hillsNear, 1, img('hills hills--near', SCENE('hills-near'))),
    L('side-trees', F.sideTrees, 2, <>
      {img('side-tree side-tree--left', SCENE('side-tree-1'))}
      {img('side-tree side-tree--right', SCENE('side-tree-2'))}
    </>),
    L('tree', F.tree, 3, img('kevala-tree', BASE + treeImage(t.id))),
    L('ground', F.ground, 3.5, <div className="ground" style={{ backgroundImage: `url(${SCENE('meadow')})` }} />),
    L('temple', F.temple, 4, img('temple', SCENE('temple'))),
    L('pedestal', F.pedestal, 5, img('pedestal', SCENE('pedestal'))),
    L('figure', F.figure, 5.5, <Figure colour={t.colour} />),
    L('emblem', F.emblem, 6.5, <div className="emblem-stage">
      <span className="emblem-glow" />
      <img className="emblem-img" src={BASE + t.symbol} alt={t.emblem} draggable={false} />
    </div>),
    L('foliage', F.foliage, 7, <>
      {img('bushes bushes--left', SCENE('bushes'))}
      {img('bushes bushes--right', SCENE('bushes'))}
    </>)
  ];
}

/** Interleave two scenes by depth so near layers of one stay in front of far layers of the other. */
function interleave(a: React.ReactElement[], b: React.ReactElement[] | null) {
  return b ? a.flatMap((layer, i) => [layer, b[i]]) : a;
}

export function TirthankaraView({ id, onClose, onChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(id);
  const [next, setNext] = useState<{ id: number; dir: 1 | -1 } | null>(null);
  const [details, setDetails] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  // Intro: layers rise in at their own speeds (only on first open).
  const [opening, setOpening] = useState(true);
  useEffect(() => { const t = window.setTimeout(() => setOpening(false), 1900); return () => window.clearTimeout(t); }, []);
  const p = useRef(0);
  const anim = useRef<number | null>(null);
  const busy = useRef(false);
  const nextRef = useRef(next);

  /**
   * Position every layer for pager progress `v` (0 = current scene, 1 = next).
   * Written directly to each element's style every frame: this works on all
   * browsers (mobile Safari does not reliably re-render layers when an
   * inherited CSS variable changes) and avoids a full style recalculation.
   */
  const apply = useCallback((v: number) => {
    const root = rootRef.current;
    if (!root) return;
    const dir = nextRef.current?.dir ?? 1;
    const travel = root.clientHeight * (reducedMotion() ? TRAVEL * 0.35 : TRAVEL);
    root.querySelectorAll<HTMLElement>('.layer').forEach(el => {
      const f = Number(el.dataset.f);
      const role = el.dataset.role as Role;
      let s = 0, o = 1;
      if (role === 'out') {
        s = -v * dir;
        o = clamp01(1.15 - v * (1.7 + 1.6 * f)); // near layers leave first
      } else if (role === 'in') {
        s = (1 - v) * dir;
        o = clamp01((v - 0.32 - 0.22 * f) * 3); // far layers arrive first, after the old scene clears
      }
      el.style.transform = `translate3d(0, ${(s * travel * f).toFixed(2)}px, 0)`;
      el.style.opacity = o.toFixed(3);
    });
    root.querySelectorAll<HTMLElement>('.tview-title').forEach(el => {
      const incoming = el.classList.contains('is-in');
      const out = el.classList.contains('is-out');
      if (!incoming && !out) { el.style.opacity = ''; el.style.transform = ''; return; }
      el.style.opacity = String(clamp01(incoming ? v * 2 - 1 : 1 - v * 2));
      el.style.transform = `translateY(${((incoming ? 1 - v : -v) * dir * 46).toFixed(1)}px)`;
    });
    const drift = -v * dir * root.clientHeight;
    const sky = root.querySelector<HTMLElement>('.sky');
    const meadow = root.querySelector<HTMLElement>('.meadow');
    if (sky) sky.style.transform = `translate3d(0, ${(drift * 0.025).toFixed(2)}px, 0)`;
    if (meadow) meadow.style.transform = `translate3d(0, ${(drift * 0.015).toFixed(2)}px, 0)`;
  }, []);

  const setP = useCallback((v: number) => {
    p.current = v;
    apply(v);
  }, [apply]);

  // New or re-roled layers get their position before the browser paints.
  useLayoutEffect(() => {
    nextRef.current = next;
    apply(p.current);
  }, [apply, cur, next]);

  useEffect(() => { onChange?.(cur); }, [cur, onChange]);

  const animateP = useCallback((to: number, duration: number, ease: (t: number) => number, done: () => void) => {
    if (anim.current !== null) cancelAnimationFrame(anim.current);
    const from = p.current;
    // Reduce Motion (also set by some phones' power-saving modes): keep the
    // parallax but make it shorter and gentler rather than removing it.
    const ms = reducedMotion() ? Math.min(duration, 480) : duration;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setP(from + (to - from) * ease(t));
      if (t < 1) anim.current = requestAnimationFrame(tick);
      else { anim.current = null; done(); }
    };
    anim.current = requestAnimationFrame(tick);
  }, [setP]);

  const commit = useCallback((toId: number) => {
    setCur(toId);
    setNext(null);
    setP(0);
    busy.current = false;
  }, [setP]);

  /** Animate to the neighbouring Tirthankara (dir +1 = next, -1 = previous). */
  const go = useCallback((dir: 1 | -1) => {
    const target = cur + dir;
    if (busy.current || target < 1 || target > 24) return;
    busy.current = true;
    setNext({ id: target, dir });
    setP(0);
    animateP(1, TRANSITION_MS, easeInOut, () => commit(target));
  }, [animateP, commit, cur, setP]);

  // Wheel, touch drag and keyboard ------------------------------------------
  useEffect(() => {
    const el = rootRef.current;
    if (!el || details !== null) return;
    let wheelAcc = 0, wheelTimer = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (busy.current) return;
      wheelAcc += e.deltaY;
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => { wheelAcc = 0; }, 180);
      if (Math.abs(wheelAcc) > 40) { go(wheelAcc > 0 ? 1 : -1); wheelAcc = 0; }
    };

    let startY = 0, lastY = 0, lastT = 0, vel = 0, dragging = false, dragDir: 1 | -1 | 0 = 0, pointer = -1;
    const H = () => el.clientHeight;
    const onDown = (e: PointerEvent) => {
      if (busy.current || (e.target as HTMLElement).closest('button')) return;
      pointer = e.pointerId; startY = lastY = e.clientY; lastT = performance.now(); vel = 0; dragging = true; dragDir = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointer) return;
      const dy = e.clientY - startY;
      const now = performance.now();
      vel = (e.clientY - lastY) / Math.max(1, now - lastT);
      lastY = e.clientY; lastT = now;
      if (!dragDir && Math.abs(dy) > 10) {
        // Swipe up = next (bottom-to-top), swipe down = previous.
        const dir: 1 | -1 = dy < 0 ? 1 : -1;
        if (cur + dir < 1 || cur + dir > 24) { dragging = false; return; }
        dragDir = dir;
        setNext({ id: cur + dir, dir });
      }
      if (dragDir) setP(Math.max(0, Math.min(1, (-dy * dragDir) / (H() * 0.9))));
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointer) return;
      dragging = false;
      if (!dragDir) return;
      const dir = dragDir;
      const fling = -vel * dir > 0.45;
      busy.current = true;
      if (p.current > COMMIT_AT || fling) {
        const target = cur + dir;
        animateP(1, TRANSITION_MS * (1 - p.current * 0.5), easeOut, () => commit(target));
      } else {
        animateP(0, 380, easeOut, () => { setNext(null); busy.current = false; });
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') go(1);
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') go(-1);
      else if (e.key === 'Escape') close();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(wheelTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateP, commit, cur, details, go, setP]);

  useEffect(() => () => { if (anim.current !== null) cancelAnimationFrame(anim.current); }, []);

  const close = useCallback(() => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, CLOSE_MS);
  }, [closing, onClose]);

  const t = TIRTHANKARAS[cur - 1];
  const n = next ? TIRTHANKARAS[next.id - 1] : null;

  return (
    <div
      ref={rootRef}
      className={`tview${opening ? ' is-opening' : ''}${closing ? ' is-closing' : ''}${next ? ' is-moving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t.name}
    >
      <Sky />
      <Birds />
      <div className="meadow" aria-hidden="true" />

      <div className="slides">
        {interleave(sceneLayers(t, n ? 'out' : 'current'), n ? sceneLayers(n, 'in') : null)}
      </div>

      {/* Name: the only text on the scene */}
      <div className="tview-name" aria-live="polite">
        <h1 key={t.id} className={`tview-title${n ? ' is-out' : ''}`}>{t.name}</h1>
        {n && <h1 key={n.id} className="tview-title is-in" aria-hidden="true">{n.name}</h1>}
      </div>

      <button type="button" className="tview-back" aria-label="Back to map" onClick={close}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      </button>

      <Rail current={cur} onPrev={() => go(-1)} onNext={() => go(1)} onDetails={() => setDetails(cur)} />

      {details !== null && <DetailsModal id={details} onClose={() => setDetails(null)} />}
    </div>
  );
}

/**
 * Right-edge rail: previous above, current in the centre, next below. The
 * current button opens the details; neighbours step to that Tirthankara.
 */
function Rail({ current, onPrev, onNext, onDetails }: {
  current: number; onPrev: () => void; onNext: () => void; onDetails: () => void;
}) {
  return (
    <nav className="rail" aria-label="Tirthankaras">
      <div className="rail-window">
        <ol className="rail-list" style={{ '--i': current - 1 } as CSSProperties}>
          {TIRTHANKARAS.map(t => {
            const rel = t.id - current;
            const role = rel === 0 ? 'current' : rel === -1 ? 'prev' : rel === 1 ? 'next' : 'far';
            const label = role === 'current' ? `Details of ${t.name}` : `${t.id}. ${t.name}`;
            const onClick = role === 'current' ? onDetails : role === 'prev' ? onPrev : role === 'next' ? onNext : undefined;
            return (
              <li key={t.id} className={`rail-item is-${role}`}>
                <button type="button" className="rail-btn" aria-label={label} tabIndex={role === 'far' ? -1 : 0}
                  onClick={onClick} disabled={role === 'far'}>
                  {role === 'prev' && <span className="rail-chev rail-chev--up" aria-hidden="true" />}
                  <span className="rail-num">{t.id}</span>
                  {role === 'next' && <span className="rail-chev rail-chev--down" aria-hidden="true" />}
                  {role === 'current' && (
                    <span className="rail-info" aria-hidden="true">
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 11v6M12 7.5v.01" /></svg>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

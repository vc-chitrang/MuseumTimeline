import { useCallback, useEffect, useRef, type RefObject } from 'react';

export interface Bounds { x: number; y: number; w: number; h: number }

interface Options {
  bounds: Bounds;
  maxZoom?: number;
  /** Called on the first user gesture (used to dismiss hints). */
  onInteract?: () => void;
}

interface ViewState {
  k0: number; // base scale that fits `bounds` into the free area
  z: number;  // user zoom multiplier (1 = fitted)
  tx: number;
  ty: number;
}

interface FreeArea { top: number; bottom: number; width: number; height: number }

/** Space taken by the detail panel: along the bottom (portrait) or the right (landscape). */
export interface PanelInset { bottom: number; right: number }

export interface PanZoomApi {
  reset: (animate?: boolean) => void;
  zoomBy: (factor: number) => void;
  /**
   * Animate so the map box fits the free area beside the detail panel, never
   * zooming past `maxZ`.
   */
  focusBox: (box: Bounds, panel: PanelInset, maxZ: number) => void;
  /** Free screen area between header and bottom bar. */
  freeArea: () => FreeArea;
}

const DRAG_THRESHOLD = 8;
const NAMES_ZOOM = 1.55;
/** Zoom at which every place label is shown (they crowd at lower zooms). */
const PLACES_ZOOM = 2.3;
/** Allow zooming slightly out of the fitted view (e.g. to fit above a panel). */
const MIN_ZOOM = 0.8;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function cssPx(name: string): number {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;
}

/** Keep a good part of the content on screen so the map can never be lost. */
function clamped(v: ViewState, b: Bounds, a: FreeArea): ViewState {
  const k = v.k0 * v.z;
  const cx = v.tx + (b.x + b.w / 2) * k;
  const cy = v.ty + (b.y + b.h / 2) * k;
  const halfW = (b.w * k) / 2, halfH = (b.h * k) / 2;
  const mx = Math.min(halfW, a.width * 0.35), my = Math.min(halfH, a.height * 0.35);
  const minX = -halfW + mx, maxX = a.width + halfW - mx;
  const minY = a.top - halfH + my, maxY = a.bottom + halfH - my;
  return {
    ...v,
    tx: v.tx + Math.max(minX, Math.min(maxX, cx)) - cx,
    ty: v.ty + Math.max(minY, Math.min(maxY, cy)) - cy
  };
}

/** Zoom by `factor` keeping screen point (px, py) fixed. */
function zoomedAt(v: ViewState, factor: number, px: number, py: number, maxZoom: number): ViewState {
  const z = Math.max(MIN_ZOOM, Math.min(maxZoom, v.z * factor));
  const r = z / v.z;
  return { ...v, z, tx: px - (px - v.tx) * r, ty: py - (py - v.ty) * r };
}

/**
 * Imperative pan / pinch-zoom for the map stage. Transforms are written to the
 * DOM directly (no React re-render per frame) to stay smooth on tablets.
 */
export function usePanZoom(
  viewportRef: RefObject<HTMLDivElement | null>,
  stageRef: RefObject<HTMLDivElement | null>,
  { bounds, maxZoom = 3.5, onInteract }: Options
): PanZoomApi {
  const view = useRef<ViewState>({ k0: 1, z: 1, tx: 0, ty: 0 });
  const anim = useRef<number | null>(null);
  const interacted = useRef(false);
  const onInteractRef = useRef(onInteract);
  // Bounds change with the map mode; read through a ref so a change animates
  // (via reset) instead of re-binding gestures or jumping.
  const boundsRef = useRef(bounds);
  useEffect(() => { onInteractRef.current = onInteract; boundsRef.current = bounds; }, [onInteract, bounds]);

  const freeArea = useCallback((): FreeArea => {
    const vp = viewportRef.current;
    const width = vp?.clientWidth ?? window.innerWidth;
    const vh = vp?.clientHeight ?? window.innerHeight;
    const top = cssPx('--header-h');
    const bottom = vh - cssPx('--nav-h') - 30;
    return { top, bottom, width, height: bottom - top };
  }, [viewportRef]);

  // Last fitted view: lets the UI know when the map has been moved away from it.
  const home = useRef<ViewState | null>(null);
  // Marker scale (--es): changing it restyles every marker and repaints the
  // map, so it is set only when it changes, and once a zoom has settled.
  const esValue = useRef('');
  const esTimer = useRef(0);

  const apply = useCallback(() => {
    const stage = stageRef.current, vp = viewportRef.current;
    if (!stage || !vp) return;
    const { k0, z, tx, ty } = view.current;
    const h = home.current;
    const k = k0 * z;
    stage.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${k})`;
    // Markers keep a near-constant on-screen size, growing gently with zoom
    // (during a pinch they scale with the map, then settle).
    const es = ((1 + (z - 1) * 0.35) / k).toFixed(4);
    if (es !== esValue.current) {
      window.clearTimeout(esTimer.current);
      const set = () => { esValue.current = es; stage.style.setProperty('--es', es); };
      if (!esValue.current) set();
      else esTimer.current = window.setTimeout(set, 140);
    }
    vp.classList.toggle('show-names', z >= NAMES_ZOOM);
    vp.classList.toggle('show-places', z >= PLACES_ZOOM);
    vp.classList.toggle('is-moved', !!h && (Math.abs(z - h.z) > 0.02 || Math.abs(tx - h.tx) > 6 || Math.abs(ty - h.ty) > 6));
  }, [stageRef, viewportRef]);

  const stopAnim = () => {
    if (anim.current !== null) cancelAnimationFrame(anim.current);
    anim.current = null;
  };

  const animateTo = useCallback((target: ViewState, duration = 750) => {
    stopAnim();
    const from = { ...view.current };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    const tick = (now: number) => {
      const t = reduce ? 1 : Math.min(1, (now - start) / duration);
      const e = easeOutCubic(t);
      view.current = {
        k0: target.k0,
        z: from.z + (target.z - from.z) * e,
        tx: from.tx + (target.tx - from.tx) * e,
        ty: from.ty + (target.ty - from.ty) * e
      };
      apply();
      anim.current = t < 1 ? requestAnimationFrame(tick) : null;
    };
    anim.current = requestAnimationFrame(tick);
  }, [apply]);

  const fitted = useCallback((): ViewState => {
    const a = freeArea();
    const bounds = boundsRef.current;
    const k0 = Math.min((a.width - 24) / bounds.w, a.height / bounds.h);
    return {
      k0,
      z: 1,
      tx: (a.width - bounds.w * k0) / 2 - bounds.x * k0,
      // Spare vertical space goes mostly below the content (map continues south).
      ty: a.top + Math.max(0, a.height - bounds.h * k0) * (a.width < 700 ? 0.32 : 0.2) - bounds.y * k0
    };
  }, [freeArea]);

  const reset = useCallback((animate = true) => {
    const f = fitted();
    home.current = f;
    if (animate) {
      view.current = { ...view.current, k0: f.k0 };
      animateTo(f);
    } else {
      stopAnim();
      view.current = f;
      apply();
    }
  }, [animateTo, apply, fitted]);

  const zoomBy = useCallback((factor: number) => {
    const a = freeArea();
    const next = clamped(zoomedAt(view.current, factor, a.width / 2, a.top + a.height / 2, maxZoom), boundsRef.current, a);
    animateTo(next, 400);
  }, [animateTo, freeArea, maxZoom]);

  const focusBox = useCallback((box: Bounds, panel: PanelInset, maxZ: number) => {
    const a = freeArea();
    // Screen margins leave room for names drawn beside / below portraits.
    const usable = a.width - panel.right;
    const sidePad = Math.min(130, usable * 0.16), vPad = 34;
    const top = a.top + vPad;
    const bottom = a.bottom - panel.bottom - vPad;
    const k0 = view.current.k0;
    const fitK = Math.min((usable - sidePad * 2) / box.w, (bottom - top) / box.h);
    const z = Math.max(MIN_ZOOM, Math.min(maxZ, maxZoom, fitK / k0));
    const k = k0 * z;
    const target: ViewState = {
      k0,
      z,
      tx: usable / 2 - (box.x + box.w / 2) * k,
      ty: (top + bottom) / 2 - (box.y + box.h / 2) * k
    };
    animateTo(clamped(target, boundsRef.current, a));
  }, [animateTo, freeArea, maxZoom]);

  // Gestures --------------------------------------------------------------
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const pointers = new Map<number, { x: number; y: number }>();
    let downAt = { x: 0, y: 0 };
    let dragged = false;
    let pinchDist = 0;

    const markInteract = () => {
      if (!interacted.current) { interacted.current = true; onInteractRef.current?.(); }
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      stopAnim();
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) { downAt = { x: e.clientX, y: e.clientY }; dragged = false; }
      if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        pinchDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        dragged = true;
      }
    };

    const onMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const cur = { x: e.clientX, y: e.clientY };
      pointers.set(e.pointerId, cur);
      const a = freeArea();

      if (pointers.size === 1) {
        if (!dragged && Math.hypot(cur.x - downAt.x, cur.y - downAt.y) > DRAG_THRESHOLD) {
          dragged = true;
          vp.classList.add('is-dragging');
          markInteract();
        }
        if (dragged) {
          const v = view.current;
          view.current = clamped({ ...v, tx: v.tx + cur.x - prev.x, ty: v.ty + cur.y - prev.y }, boundsRef.current, a);
          apply();
        }
      } else if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const rect = vp.getBoundingClientRect();
        const midX = (p1.x + p2.x) / 2 - rect.left, midY = (p1.y + p2.y) / 2 - rect.top;
        // Pan with the midpoint, zoom with the spread.
        let v = view.current;
        v = { ...v, tx: v.tx + (cur.x - prev.x) / 2, ty: v.ty + (cur.y - prev.y) / 2 };
        if (pinchDist > 0) v = zoomedAt(v, dist / pinchDist, midX, midY, maxZoom);
        view.current = clamped(v, boundsRef.current, a);
        pinchDist = dist;
        markInteract();
        apply();
      }
    };

    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
      if (pointers.size === 0) vp.classList.remove('is-dragging');
    };

    // Swallow the click that ends a drag so it doesn't select a marker.
    const onClickCapture = (e: MouseEvent) => {
      if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopAnim();
      markInteract();
      const rect = vp.getBoundingClientRect();
      const v = zoomedAt(view.current, Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top, maxZoom);
      view.current = clamped(v, boundsRef.current, freeArea());
      apply();
    };

    vp.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    vp.addEventListener('click', onClickCapture, true);
    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      vp.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      vp.removeEventListener('click', onClickCapture, true);
      vp.removeEventListener('wheel', onWheel);
    };
  }, [apply, freeArea, maxZoom, viewportRef]);

  // Fit on mount and whenever the viewport changes size / orientation.
  const resetRef = useRef(reset);
  useEffect(() => { resetRef.current = reset; }, [reset]);
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    resetRef.current(false);
    const ro = new ResizeObserver(() => resetRef.current(false));
    ro.observe(vp);
    return () => { ro.disconnect(); stopAnim(); };
  }, [viewportRef]);

  return { reset, zoomBy, focusBox, freeArea };
}

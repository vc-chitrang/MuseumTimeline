/*
 * Image preloading, so animations start only once their pictures are on
 * screen (on a slow tablet the intro used to finish before the art arrived).
 */
import { treeImage } from '../data/details';
import { TIRTHANKARAS } from '../data/tirthankaras';
import { SCENE } from '../components/view/SceneArt';
import { ART_EXT } from './format';

const BASE = import.meta.env.BASE_URL;
const decoded = new Map<string, Promise<void>>();
/** Scenes currently waiting for their art; background warm-up yields to them. */
let waiting = 0;

/** Download and decode one image; resolves (never rejects) when done. */
export function preload(src: string): Promise<void> {
  let p = decoded.get(src);
  if (!p) {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    // A missing or broken image must never block the scene from opening.
    p = img.decode().catch(() => undefined);
    decoded.set(src, p);
  }
  return p;
}

/** Preload a set of images, giving up waiting after `timeoutMs`. */
export function preloadAll(srcs: string[], timeoutMs: number): Promise<void> {
  waiting++;
  return Promise.race([
    Promise.all(srcs.map(preload)).then(() => undefined),
    new Promise<void>(resolve => window.setTimeout(resolve, timeoutMs))
  ]).finally(() => { waiting--; });
}

/** Layers every scene shares (a function: the format is chosen at startup). */
const sharedScene = () => ['sky', 'cloud', 'hills-far', 'hills-near', 'side-tree-1', 'side-tree-2',
  'meadow', 'temple', 'pedestal', 'bushes'].map(SCENE);

/** Images that differ per Tirthankara (tree, glowing emblem, figure in body colour). */
export const ownImages = (id: number) => {
  const t = TIRTHANKARAS[id - 1];
  return [BASE + treeImage(id), BASE + t.symbolGlow, SCENE(`figure-${t.colour}`)];
};

/** Everything needed to show one Tirthankara's scene. */
export const sceneImages = (id: number) => [...sharedScene(), ...ownImages(id)];

const idle = (fn: () => void) => {
  // Safari has no requestIdleCallback
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(fn, { timeout: 2000 });
  else setTimeout(fn, 300);
};

/**
 * Background warm-up while the visitor looks at the map: decode the shared
 * scene layers first (so the first scene opens instantly), then quietly fetch
 * every tree and symbol one at a time. Waits for the service worker, so the
 * downloads also land in its cache and the kiosk keeps working offline.
 */
export async function warmUp() {
  if ('serviceWorker' in navigator && import.meta.env.PROD && !navigator.serviceWorker.controller) {
    // First visit: wait (briefly) until the new service worker controls the page.
    await new Promise<void>(resolve => {
      navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true });
      window.setTimeout(resolve, 6000);
    });
  }
  const map = `${BASE}assets/images/india-map.${ART_EXT}`;
  const shared = sharedScene();
  const queue = [...shared, map, ...TIRTHANKARAS.flatMap(t => ownImages(t.id))];
  const nextOne = () => {
    // A scene the visitor just opened gets the whole connection.
    if (waiting > 0) { window.setTimeout(nextOne, 400); return; }
    const src = queue.shift();
    if (!src) return;
    // Shared layers are decoded too; per-Tirthankara images just cached.
    const job = shared.includes(src)
      ? preload(src)
      : fetch(src, { priority: 'low' } as RequestInit).then(() => undefined, () => undefined);
    job.then(() => idle(nextOne));
  };
  idle(nextOne);
}

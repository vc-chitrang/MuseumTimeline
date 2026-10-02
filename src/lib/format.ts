/*
 * Scene and tree art ships as AVIF (about 45% smaller) with WebP copies for
 * browsers that cannot decode AVIF (iOS/iPadOS 15 and older). The format is
 * chosen once, before the app renders.
 */

/** 1×1 transparent AVIF with an alpha plane (the art needs alpha). */
const PROBE = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAAGGbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAAAAAAAOcGl0bQAAAAAAAQAAACxpbG9jAAAAAEQAAAIAAQAAAAEAAAHCAAAAFwACAAAAAQAAAa4AAAAUAAAAQmlpbmYAAAAAAAIAAAAaaW5mZQIAAAAAAQAAYXYwMUNvbG9yAAAAABppbmZlAgAAAAACAABhdjAxQWxwaGEAAAAAGmlyZWYAAAAAAAAADmF1eGwAAgABAAEAAADDaXBycAAAAJ1pcGNvAAAAFGlzcGUAAAAAAAAAAQAAAAEAAAAQcGl4aQAAAAADCAgIAAAADGF2MUOBAAwAAAAAE2NvbHJuY2x4AAEADQAGgAAAAA5waXhpAAAAAAEIAAAADGF2MUOBABwAAAAAOGF1eEMAAAAAdXJuOm1wZWc6bXBlZ0I6Y2ljcDpzeXN0ZW1zOmF1eGlsaWFyeTphbHBoYQAAAAAeaXBtYQAAAAAAAAACAAEEAQKDBAACBAEFhgcAAAAzbWRhdBIACgQYAAYVMgoYACihAAIhHctgEgAKBRgABgQgMgwYAAooooQAALATS9g=';

/** File extension for scene and tree art: 'avif' or 'webp'. */
export let ART_EXT: 'avif' | 'webp' = 'webp';

/** Detect AVIF support (never takes longer than `timeoutMs`). */
export function detectArtFormat(timeoutMs = 800): Promise<void> {
  return new Promise(resolve => {
    const img = new Image();
    let settled = false;
    // Decide once: a late probe result must not switch formats mid-session.
    const done = (ok: boolean) => { if (settled) return; settled = true; ART_EXT = ok ? 'avif' : 'webp'; resolve(); };
    const timer = window.setTimeout(() => done(false), timeoutMs);
    img.onload = () => { window.clearTimeout(timer); done(img.width > 0); };
    img.onerror = () => { window.clearTimeout(timer); done(false); };
    img.src = PROBE;
  });
}

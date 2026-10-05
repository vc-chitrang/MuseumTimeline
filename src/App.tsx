import { useCallback, useEffect, useRef, useState } from 'react';
import { InfoCard } from './components/InfoCard';
import { MapView, type MapHandle, type Selection } from './components/MapView';
import { ModeToggle } from './components/ModeToggle';
import { PortraitSprite } from './components/Portrait';
import { TirthankaraView } from './components/view/TirthankaraView';
import type { Mode } from './data/tirthankaras';
import { warmUp } from './lib/preload';

/** Return to the attract state after this long without a touch (museum kiosk). */
const IDLE_RESET_MS = 90_000;

const COPY: Record<Mode, { title: string; subtitle: string; hi: string }> = {
  birth: {
    title: 'Janma Bhumi',
    subtitle: 'Where the 24 Tirthankaras were born. Tap one to step into their story.',
    hi: 'चौबीस तीर्थंकरों की जन्म भूमि'
  },
  moksha: {
    title: 'Moksha Bhumi',
    subtitle: 'Where the 24 Tirthankaras attained moksha. Tap one to step into their story.',
    hi: 'चौबीस तीर्थंकरों की मोक्ष भूमि'
  }
};

export default function App() {
  const mapRef = useRef<MapHandle>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>('birth');
  const [selection, setSelection] = useState<Selection>(null);
  const [hint, setHint] = useState(false);
  /** Tirthankara shown full-screen (null = map), and which opening it is. */
  const [viewId, setViewId] = useState<number | null>(null);
  const [viewSession, setViewSession] = useState(0);
  const sessionRef = useRef(0);
  // True while the full-screen scene covers the map: the map is then not
  // drawn at all (it held ~45 GPU layers under the scene on phones).
  const [covered, setCovered] = useState(false);
  const openView = useCallback((id: number) => {
    sessionRef.current += 1;
    setViewSession(sessionRef.current);
    setViewId(id);
    setCovered(true);
  }, []);
  // The map comes back as soon as the scene starts fading out.
  const uncover = useCallback((session: number) => {
    if (session === sessionRef.current) setCovered(false);
  }, []);
  // A view that is still fading out must not close one opened after it.
  const closeView = useCallback((session: number) => {
    if (session === sessionRef.current) setViewId(null);
  }, []);

  const onImageLoad = useCallback(() => setReady(true), []);
  const onInteract = useCallback(() => setHint(false), []);

  // Start the intro once the map image is ready (with a safety timeout).
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 6000);
    return () => window.clearTimeout(t);
  }, []);

  // Once the map is up, quietly load the scene art in the background.
  useEffect(() => { if (ready) warmUp(); }, [ready]);

  // Gesture hint shortly after the intro finishes.
  useEffect(() => {
    if (!ready) return;
    const show = window.setTimeout(() => setHint(true), 3200);
    const hide = window.setTimeout(() => setHint(false), 7600);
    return () => { window.clearTimeout(show); window.clearTimeout(hide); };
  }, [ready]);

  /** Show a selection and frame it on the map. */
  const show = useCallback((sel: Selection) => {
    setSelection(sel);
    setHint(false);
    // Wait a frame so the card has its final height before focusing.
    requestAnimationFrame(() => {
      const card = cardRef.current;
      // Landscape shows the card as a right-hand panel; portrait along the bottom.
      const side = card && window.matchMedia('(orientation: landscape)').matches;
      const panel = !sel || !card
        ? { bottom: 0, right: 0 }
        : side
          ? { bottom: 0, right: card.offsetWidth + 24 }
          : { bottom: card.offsetHeight, right: 0 };
      mapRef.current?.focusSelection(sel, panel);
    });
  }, []);

  /** Selection from the map, cards or controls. */
  const select = useCallback((sel: Selection) => {
    // Tirthankara portraits open their full-screen view instead of a card.
    if (sel?.kind === 'tirthankara') { setHint(false); openView(sel.id); return; }
    show(sel);
  }, [openView, show]);

  const changeMode = useCallback((m: Mode) => {
    setSelection(null);
    setHint(false);
    setMode(m);
  }, []);

  // Kiosk idle reset.
  useEffect(() => {
    let timer = window.setTimeout(reset, IDLE_RESET_MS);
    function reset() { setSelection(null); setViewId(null); setMode('birth'); mapRef.current?.reset(); }
    const bump = () => { window.clearTimeout(timer); timer = window.setTimeout(reset, IDLE_RESET_MS); };
    window.addEventListener('pointerdown', bump);
    window.addEventListener('keydown', bump);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', bump);
      window.removeEventListener('keydown', bump);
    };
  }, []);

  return (
    <div className={`app${ready ? ' is-ready' : ''}${viewId !== null && covered ? ' is-covered' : ''}`}>
      <PortraitSprite />

      <MapView ref={mapRef} mode={mode} selection={selection} onSelect={select}
        onImageLoad={onImageLoad} onInteract={onInteract} />

      <header className="app-header">
        <p className="eyebrow">The 24 Tirthankaras</p>
        <h1 className="title" key={mode}>{COPY[mode].title}</h1>
        <p className="subtitle">{COPY[mode].subtitle}</p>
        <p className="subtitle-hi" lang="hi">{COPY[mode].hi}</p>
      </header>

      <div className={`zoom-controls${selection ? ' is-hidden' : ''}`} role="group" aria-label="Map zoom">
        <button type="button" className="zoom-btn" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()}>+</button>
        <button type="button" className="zoom-btn" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()}>−</button>
        <button type="button" className="zoom-btn zoom-btn--reset" aria-label="Reset map" onClick={() => select(null)}>⤢</button>
      </div>

      <p className={`hint${hint ? ' is-visible' : ''}`}>Pinch to look closer</p>

      <InfoCard ref={cardRef} mode={mode} selection={selection}
        onOpenTirthankara={openView} onBack={() => select(null)} />

      <div className="bottom-bar">
        <ModeToggle mode={mode} onChange={changeMode} />
      </div>

      {viewId !== null && (
        <TirthankaraView key={viewSession} id={viewId} onClosing={() => uncover(viewSession)}
          onClose={() => closeView(viewSession)} />
      )}
    </div>
  );
}

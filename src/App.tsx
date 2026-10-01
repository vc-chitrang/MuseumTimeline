import { useCallback, useEffect, useRef, useState } from 'react';
import { InfoCard } from './components/InfoCard';
import { MapView, type MapHandle, type Selection } from './components/MapView';
import { ModeToggle } from './components/ModeToggle';
import { PortraitSprite } from './components/Portrait';
import { TirthankaraView } from './components/view/TirthankaraView';
import type { Mode } from './data/tirthankaras';

/** Return to the attract state after this long without a touch (museum kiosk). */
const IDLE_RESET_MS = 90_000;

const COPY: Record<Mode, { title: string; subtitle: string; hi: string }> = {
  birth: {
    title: 'Janma Bhumi',
    subtitle: 'Discover the sacred places where the 24 Tirthankaras of our time cycle were born.',
    hi: 'चौबीस तीर्थंकरों की जन्म भूमि'
  },
  moksha: {
    title: 'Moksha Bhumi',
    subtitle: 'Discover the sacred places where the 24 Tirthankaras of our time cycle attained moksha (liberation).',
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
  /** Tirthankara shown full-screen (null = map). */
  const [viewId, setViewId] = useState<number | null>(null);

  const onImageLoad = useCallback(() => setReady(true), []);
  const onInteract = useCallback(() => setHint(false), []);

  // Start the intro once the map image is ready (with a safety timeout).
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

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
    if (sel?.kind === 'tirthankara') { setHint(false); setViewId(sel.id); return; }
    show(sel);
  }, [show]);

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
    <div className={`app${ready ? ' is-ready' : ''}`}>
      <PortraitSprite />

      <MapView ref={mapRef} mode={mode} selection={selection} onSelect={select}
        onImageLoad={onImageLoad} onInteract={onInteract} />

      <header className="app-header">
        <p className="eyebrow">24 Tirthankaras · Interactive Map</p>
        <h1 className="title" key={mode}>{COPY[mode].title}</h1>
        <p className="subtitle">{COPY[mode].subtitle}</p>
        <p className="subtitle-hi" lang="hi">{COPY[mode].hi}</p>
      </header>

      <div className={`zoom-controls${selection ? ' is-hidden' : ''}`} role="group" aria-label="Map zoom">
        <button type="button" className="zoom-btn" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()}>+</button>
        <button type="button" className="zoom-btn" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()}>−</button>
        <button type="button" className="zoom-btn zoom-btn--reset" aria-label="Reset map" onClick={() => select(null)}>⤢</button>
      </div>

      <p className={`hint${hint ? ' is-visible' : ''}`}>Pinch or drag to explore the map</p>

      <InfoCard ref={cardRef} mode={mode} selection={selection}
        onOpenTirthankara={setViewId} onBack={() => select(null)} />

      <div className="bottom-bar">
        <ModeToggle mode={mode} onChange={changeMode} />
      </div>

      {viewId !== null && <TirthankaraView key="tview" id={viewId} onClose={() => setViewId(null)} />}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { InfoCard } from './components/InfoCard';
import { MapView, type MapHandle, type Selection } from './components/MapView';
import { ModeToggle } from './components/ModeToggle';
import type { Mode } from './data/tirthankaras';

const NAV = [
  { key: 'map', label: 'Map', icon: <><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></> },
  { key: 'timeline', label: 'Timeline', icon: <><path d="M3 20l6-10 4 6 3-4 5 8z" /><circle cx="16" cy="5" r="1.6" /></> },
  { key: 'gallery', label: 'Gallery', icon: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></> },
  { key: 'play', label: 'Play', icon: <path d="M12 3l2.4 5.6L20 11l-5.6 2.4L12 19l-2.4-5.6L4 11l5.6-2.4z" /> }
];

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
  const [toast, setToast] = useState<string | null>(null);

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

  const select = useCallback((sel: Selection) => {
    setSelection(sel);
    setHint(false);
    // Wait a frame so the card has its final height before focusing.
    requestAnimationFrame(() => {
      mapRef.current?.focusSelection(sel, sel ? cardRef.current?.offsetHeight ?? 300 : 0);
    });
  }, []);

  const changeMode = useCallback((m: Mode) => {
    setSelection(null);
    setHint(false);
    setMode(m);
  }, []);

  // Kiosk idle reset.
  useEffect(() => {
    let timer = window.setTimeout(reset, IDLE_RESET_MS);
    function reset() { setSelection(null); setMode('birth'); mapRef.current?.reset(); }
    const bump = () => { window.clearTimeout(timer); timer = window.setTimeout(reset, IDLE_RESET_MS); };
    window.addEventListener('pointerdown', bump);
    window.addEventListener('keydown', bump);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', bump);
      window.removeEventListener('keydown', bump);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <div className={`app${ready ? ' is-ready' : ''}`}>
      <MapView ref={mapRef} mode={mode} selection={selection} onSelect={select}
        onImageLoad={onImageLoad} onInteract={onInteract} />

      <header className="app-header">
        <p className="eyebrow">24 Tirthankaras · Interactive Map</p>
        <h1 className="title" key={mode}>{COPY[mode].title}</h1>
        <p className="subtitle">{COPY[mode].subtitle}</p>
        <p className="subtitle-hi" lang="hi">{COPY[mode].hi}</p>
        <ModeToggle mode={mode} onChange={changeMode} />
      </header>

      <aside className={`legend${selection ? ' is-hidden' : ''}`} aria-label="Map legend">
        {mode === 'birth' ? (
          <div className="legend-row"><span className="legend-icon legend-dot" />Birthplace</div>
        ) : (
          <>
            <div className="legend-row"><span className="legend-icon legend-summit" />Sammed Shikharji · 20 Tirthankaras</div>
            <div className="legend-row"><span className="legend-icon legend-pin" />Other moksha place</div>
          </>
        )}
        <div className="legend-row"><span className="legend-icon legend-circle" />Tirthankara · tap to explore</div>
      </aside>

      <div className={`zoom-controls${selection ? ' is-hidden' : ''}`} role="group" aria-label="Map zoom">
        <button type="button" className="zoom-btn" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()}>+</button>
        <button type="button" className="zoom-btn" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()}>−</button>
        <button type="button" className="zoom-btn zoom-btn--reset" aria-label="Reset map" onClick={() => select(null)}>⤢</button>
      </div>

      <p className={`hint${hint ? ' is-visible' : ''}`}>Pinch or drag to explore the map</p>

      <InfoCard ref={cardRef} mode={mode} selection={selection} onSelect={select} />

      <nav className="bottom-nav" aria-label="Sections">
        {NAV.map(n => (
          <button key={n.key} type="button" className={`nav-item${n.key === 'map' ? ' is-active' : ''}`}
            aria-current={n.key === 'map' ? 'page' : undefined}
            onClick={() => n.key !== 'map' && setToast(`${n.label} · coming soon`)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">{n.icon}</svg>
            <span>{n.label}</span>
          </button>
        ))}
      </nav>

      <div className={`toast${toast ? ' is-visible' : ''}`} role="status">{toast}</div>
    </div>
  );
}

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { TIRTHANKARAS } from '../../data/tirthankaras';

const BASE = import.meta.env.BASE_URL;
const COUNT = TIRTHANKARAS.length;
/** Position (0–1) of a Tirthankara along the track: 1 at the top, 24 at the bottom. */
const pos = (id: number) => (id - 1) / (COUNT - 1);

interface Props {
  current: number;
  /** Returns false if the jump could not start (e.g. mid-transition). */
  onJump: (id: number) => boolean;
}

/**
 * Timeline scrubber on the right edge: a slim ruler with one tick per
 * Tirthankara, a gold bead for the current one, and arrow buttons to step.
 * Drag the bead or tap the track to jump; a bubble previews the target.
 * Next is below (matching "swipe up for next").
 */
export function Scrubber({ current, onJump }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<number | null>(null);
  // Target chosen but not yet shown by the scene: the bead lands there at once.
  const [pending, setPending] = useState<number | null>(null);
  const [byPointer, setByPointer] = useState(false);
  const dragging = useRef(false);

  useEffect(() => { if (pending === current) setPending(null); }, [current, pending]);

  const jump = (id: number) => {
    if (id === (pending ?? current)) return;
    if (onJump(id)) setPending(id);
  };

  const idAt = (clientY: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
    return Math.round(f * (COUNT - 1)) + 1;
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    dragging.current = true;
    setByPointer(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
    setPreview(idAt(e.clientY));
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) setPreview(idAt(e.clientY));
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    const id = idAt(e.clientY);
    setPreview(null);
    jump(id);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1, Home: -COUNT, End: COUNT } as Record<string, number>;
    if (!(e.key in step)) return;
    e.preventDefault();
    e.stopPropagation();
    setByPointer(false);
    jump(Math.max(1, Math.min(COUNT, (pending ?? current) + step[e.key])));
  };

  const shown = preview ?? pending ?? current;
  const p = TIRTHANKARAS[shown - 1];

  return (
    <nav className={`scrub${preview !== null ? ' is-scrubbing' : ''}${byPointer ? ' is-pointer' : ''}`} aria-label="Tirthankaras">
      <button type="button" className="scrub-step" aria-label="Previous Tirthankara"
        disabled={shown === 1} onClick={() => jump(shown - 1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14l5-5 5 5" /></svg>
      </button>

      <div
        ref={trackRef}
        className="scrub-track"
        role="slider"
        tabIndex={0}
        aria-valuemin={1}
        aria-valuemax={COUNT}
        aria-valuenow={shown}
        aria-valuetext={`${shown}. ${p.name}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => { dragging.current = false; setPreview(null); }}
        onKeyDown={onKey}
        style={{ '--pos': pos(shown) } as CSSProperties}
      >
        <span className="scrub-rail" />
        <span className="scrub-fill" />
        {TIRTHANKARAS.map(t => (
          <span key={t.id}
            className={`scrub-tick${t.id <= shown ? ' is-passed' : ''}${t.id % 6 === 0 || t.id === 1 ? ' is-major' : ''}`}
            style={{ top: `${pos(t.id) * 100}%` }} />
        ))}
        <span className="scrub-bead" aria-hidden="true">{shown}</span>
        {preview !== null && (
          <span className="scrub-bubble" aria-hidden="true">
            <img src={BASE + p.symbolSm} alt="" />
            <span><b>{p.id}</b>{p.name}</span>
          </span>
        )}
      </div>

      <button type="button" className="scrub-step" aria-label="Next Tirthankara"
        disabled={shown === COUNT} onClick={() => jump(shown + 1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5" /></svg>
      </button>
    </nav>
  );
}

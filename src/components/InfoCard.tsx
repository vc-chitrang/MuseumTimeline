import type { Ref } from 'react';
import { COLOURS, PLACES, TIRTHANKARAS, ordinal, placeOf, type Mode, type PlaceKey } from '../data/tirthankaras';
import type { Selection } from './MapView';
import { Emblem, EmblemBadge, Portrait } from './Portrait';

interface Props {
  ref?: Ref<HTMLElement>;
  mode: Mode;
  selection: Selection;
  /** Open another item from inside the card (remembered for Back). */
  onNavigate: (sel: Selection) => void;
  /** Return to the previous card, or close when there is none. */
  onBack: () => void;
  onClose: () => void;
  canGoBack: boolean;
}

/** Detail panel for the selected Tirthankara or place. */
export function InfoCard({ ref, mode, selection, onNavigate, onBack, onClose, canGoBack }: Props) {
  const open = selection !== null;
  const isPlace = selection?.kind === 'place';
  return (
    <section ref={ref} className={`info-card${open ? ' is-open' : ''}${isPlace ? ' is-place' : ''}`}
      aria-hidden={!open} aria-live="polite">
      {isPlace ? (
        <button type="button" className="card-back" onClick={onBack}>
          <span aria-hidden="true">‹</span> {canGoBack ? 'Back' : 'Back to map'}
        </button>
      ) : (
        <button type="button" className="card-close" aria-label="Close" onClick={onClose}>×</button>
      )}
      {selection?.kind === 'tirthankara' && <TirthankaraBody id={selection.id} mode={mode} onNavigate={onNavigate} />}
      {selection?.kind === 'place' && <PlaceBody placeKey={selection.key} mode={mode} onNavigate={onNavigate} />}
    </section>
  );
}

function PlaceFact({ label, placeKey, current, onNavigate }: {
  label: string; placeKey: PlaceKey; current: boolean; onNavigate: Props['onNavigate'];
}) {
  const p = PLACES[placeKey];
  return (
    <button type="button" className={`fact fact--link${current ? ' is-current' : ''}`}
      onClick={() => onNavigate({ kind: 'place', key: placeKey })}>
      <span className="fact-label">{label}</span>
      <span className="fact-value"><span>{p.name}<small>{p.region}</small></span></span>
    </button>
  );
}

function TirthankaraBody({ id, mode, onNavigate }: { id: number; mode: Mode; onNavigate: Props['onNavigate'] }) {
  const t = TIRTHANKARAS[id - 1];
  const colour = COLOURS[t.colour];
  // Stepping through 1–24 replaces the card rather than stacking history.
  const go = (n: number) => onNavigate({ kind: 'tirthankara', id: n });

  return (
    <div className="card-body" key={id}>
      <div className="card-head">
        <div className="card-portrait"><Portrait t={t} /><EmblemBadge t={t} /></div>
        <div className="card-heading">
          <p className="card-kicker">{ordinal(t.id)} Tirthankara</p>
          <h2 className="card-title">{t.name}</h2>
          <p className="card-hi"><span lang="hi">{t.hi}</span>{t.alias && ` · ${t.alias}`}</p>
        </div>
        {/* Emblem (lanchhan), shown large */}
        <figure className="card-emblem">
          <Emblem t={t} className="card-emblem-img" />
          <figcaption>
            <span className="fact-label">Emblem</span>
            {t.emblem}
          </figcaption>
        </figure>
      </div>

      <div className="card-facts">
        <div className="fact">
          <p className="fact-label">Colour</p>
          <p className="fact-value"><span className="swatch" style={{ background: colour.hex }} />{colour.label}</p>
        </div>
        <div className="fact fact--wide">
          <p className="fact-label">Parents</p>
          <p className="fact-value">{t.parents}</p>
        </div>
        <PlaceFact label="Birthplace" placeKey={t.birth} current={mode === 'birth'} onNavigate={onNavigate} />
        <PlaceFact label="Moksha place" placeKey={t.moksha} current={mode === 'moksha'} onNavigate={onNavigate} />
      </div>

      <div className="card-nav">
        <button type="button" className="card-step" disabled={id === 1} onClick={() => go(id - 1)}>
          ‹ {id > 1 ? TIRTHANKARAS[id - 2].name : 'Previous'}
        </button>
        <span className="card-progress">{id} / 24</span>
        <button type="button" className="card-step" disabled={id === 24} onClick={() => go(id + 1)}>
          {id < 24 ? TIRTHANKARAS[id].name : 'Next'} ›
        </button>
      </div>
    </div>
  );
}

function PlaceBody({ placeKey, mode, onNavigate }: { placeKey: PlaceKey; mode: Mode; onNavigate: Props['onNavigate'] }) {
  const place = PLACES[placeKey];
  // A place may be a birthplace and a moksha place (Champapuri); list by mode.
  const list = TIRTHANKARAS.filter(t => placeOf(t, mode) === placeKey);
  const verb = mode === 'birth' ? 'was born here' : 'attained moksha here';
  const verbMany = mode === 'birth' ? 'were born here' : 'attained moksha here';
  return (
    <div className="card-body" key={`${mode}-${placeKey}`}>
      <p className="card-kicker">{mode === 'birth' ? 'Birthplace' : 'Moksha place'}</p>
      <h2 className="card-title">{place.name}</h2>
      <p className="card-hi"><span lang="hi">{place.hi}</span> · {place.region}</p>
      <p className="card-text">
        {list.length === 1
          ? `${list[0].name}, the ${ordinal(list[0].id)} Tirthankara, ${verb}.`
          : `${list.length} of the 24 Tirthankaras ${verbMany}.`}
      </p>
      <div className="place-list">
        {list.map(t => (
          <button type="button" key={t.id} className="chip" onClick={() => onNavigate({ kind: 'tirthankara', id: t.id })}>
            <span className="chip-portrait"><Portrait t={t} /></span>
            <span className="chip-num">{t.id}</span>{t.name}
          </button>
        ))}
      </div>
    </div>
  );
}

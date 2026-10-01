import type { Ref } from 'react';
import { COLOURS, PLACES, TIRTHANKARAS, ordinal } from '../data/tirthankaras';
import type { Selection } from './MapView';
import { Emblem, Portrait } from './Portrait';

interface Props {
  ref?: Ref<HTMLElement>;
  selection: Selection;
  onSelect: (sel: Selection) => void;
}

/** Bottom panel with details of the selected Tirthankara or moksha place. */
export function InfoCard({ ref, selection, onSelect }: Props) {
  const open = selection !== null;
  return (
    <section ref={ref} className={`info-card${open ? ' is-open' : ''}`} aria-hidden={!open} aria-live="polite">
      <button type="button" className="card-close" aria-label="Close" onClick={() => onSelect(null)}>×</button>
      {selection?.kind === 'tirthankara' && <TirthankaraBody id={selection.id} onSelect={onSelect} />}
      {selection?.kind === 'place' && <PlaceBody placeKey={selection.key} onSelect={onSelect} />}
    </section>
  );
}

function TirthankaraBody({ id, onSelect }: { id: number; onSelect: Props['onSelect'] }) {
  const t = TIRTHANKARAS[id - 1];
  const place = PLACES[t.moksha];
  const colour = COLOURS[t.colour];
  const go = (n: number) => onSelect({ kind: 'tirthankara', id: n });

  return (
    <div className="card-body" key={id}>
      <div className="card-head">
        <div className="card-portrait"><Portrait t={t} /></div>
        <div>
          <p className="card-kicker">{ordinal(t.id)} Tirthankara</p>
          <h2 className="card-title">{t.name}</h2>
          <p className="card-hi"><span lang="hi">{t.hi}</span>{t.alias && ` · ${t.alias}`}</p>
        </div>
      </div>

      <div className="card-facts">
        <div className="fact">
          <p className="fact-label">Colour</p>
          <p className="fact-value"><span className="swatch" style={{ background: colour.hex }} />{colour.label}</p>
        </div>
        <div className="fact">
          <p className="fact-label">Emblem</p>
          <p className="fact-value"><Emblem t={t} />{t.emblem}</p>
        </div>
        <button type="button" className="fact fact--link" onClick={() => onSelect({ kind: 'place', key: place.key })}>
          <span className="fact-label">Moksha place</span>
          <span className="fact-value"><span>{place.name}<small>{place.region}</small></span></span>
        </button>
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

function PlaceBody({ placeKey, onSelect }: { placeKey: keyof typeof PLACES; onSelect: Props['onSelect'] }) {
  const place = PLACES[placeKey];
  const list = TIRTHANKARAS.filter(t => t.moksha === placeKey);
  return (
    <div className="card-body" key={placeKey}>
      <p className="card-kicker">Moksha place</p>
      <h2 className="card-title">{place.name}</h2>
      <p className="card-hi"><span lang="hi">{place.hi}</span> · {place.region}</p>
      <p className="card-text">
        {list.length === 1
          ? `${list[0].name}, the ${ordinal(list[0].id)} Tirthankara, attained moksha here.`
          : `${list.length} of the 24 Tirthankaras attained moksha here.`}
      </p>
      <div className="place-list">
        {list.map(t => (
          <button type="button" key={t.id} className="chip" onClick={() => onSelect({ kind: 'tirthankara', id: t.id })}>
            <span className="chip-portrait"><Portrait t={t} /></span>
            <span className="chip-num">{t.id}</span>{t.name}
          </button>
        ))}
      </div>
    </div>
  );
}

import type { Ref } from 'react';
import { COLOURS, PLACES, TIRTHANKARAS, ordinal, placeOf, type Mode, type PlaceKey } from '../data/tirthankaras';
import type { Selection } from './MapView';
import { Emblem, EmblemBadge, Portrait } from './Portrait';

interface Props {
  ref?: Ref<HTMLElement>;
  mode: Mode;
  selection: Selection;
  onSelect: (sel: Selection) => void;
}

/** Bottom panel with details of the selected Tirthankara or place. */
export function InfoCard({ ref, mode, selection, onSelect }: Props) {
  const open = selection !== null;
  return (
    <section ref={ref} className={`info-card${open ? ' is-open' : ''}`} aria-hidden={!open} aria-live="polite">
      <button type="button" className="card-close" aria-label="Close" onClick={() => onSelect(null)}>×</button>
      {selection?.kind === 'tirthankara' && <TirthankaraBody id={selection.id} mode={mode} onSelect={onSelect} />}
      {selection?.kind === 'place' && <PlaceBody placeKey={selection.key} mode={mode} onSelect={onSelect} />}
    </section>
  );
}

function PlaceFact({ label, placeKey, current, onSelect }: {
  label: string; placeKey: PlaceKey; current: boolean; onSelect: Props['onSelect'];
}) {
  const p = PLACES[placeKey];
  return (
    <button type="button" className={`fact fact--link${current ? ' is-current' : ''}`}
      onClick={() => onSelect({ kind: 'place', key: placeKey })}>
      <span className="fact-label">{label}</span>
      <span className="fact-value"><span>{p.name}<small>{p.region}</small></span></span>
    </button>
  );
}

function TirthankaraBody({ id, mode, onSelect }: { id: number; mode: Mode; onSelect: Props['onSelect'] }) {
  const t = TIRTHANKARAS[id - 1];
  const colour = COLOURS[t.colour];
  const go = (n: number) => onSelect({ kind: 'tirthankara', id: n });

  return (
    <div className="card-body" key={id}>
      <div className="card-head">
        <div className="card-portrait"><Portrait t={t} /><EmblemBadge t={t} /></div>
        <div>
          <p className="card-kicker">{ordinal(t.id)} Tirthankara</p>
          <h2 className="card-title">{t.name}</h2>
          <p className="card-hi"><span lang="hi">{t.hi}</span>{t.alias && ` · ${t.alias}`}</p>
        </div>
      </div>

      <div className="card-facts">
        <div className="fact">
          <p className="fact-label">Emblem</p>
          <p className="fact-value"><Emblem t={t} />{t.emblem}</p>
        </div>
        <div className="fact">
          <p className="fact-label">Colour</p>
          <p className="fact-value"><span className="swatch" style={{ background: colour.hex }} />{colour.label}</p>
        </div>
        <div className="fact">
          <p className="fact-label">Parents</p>
          <p className="fact-value fact-value--small">{t.parents}</p>
        </div>
        <PlaceFact label="Birthplace" placeKey={t.birth} current={mode === 'birth'} onSelect={onSelect} />
        <PlaceFact label="Moksha place" placeKey={t.moksha} current={mode === 'moksha'} onSelect={onSelect} />
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

function PlaceBody({ placeKey, mode, onSelect }: { placeKey: PlaceKey; mode: Mode; onSelect: Props['onSelect'] }) {
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
          <button type="button" key={t.id} className="chip" onClick={() => onSelect({ kind: 'tirthankara', id: t.id })}>
            <span className="chip-portrait"><Portrait t={t} /></span>
            <span className="chip-num">{t.id}</span>{t.name}
          </button>
        ))}
      </div>
    </div>
  );
}

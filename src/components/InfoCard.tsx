import type { Ref } from 'react';
import { PLACES, TIRTHANKARAS, ordinal, placeOf, type Mode, type PlaceKey } from '../data/tirthankaras';
import type { Selection } from './MapView';
import { Portrait } from './Portrait';

interface Props {
  ref?: Ref<HTMLElement>;
  mode: Mode;
  selection: Selection;
  /** Open a Tirthankara's full-screen view. */
  onOpenTirthankara: (id: number) => void;
  /** Close the place card and return to the map. */
  onBack: () => void;
}

/** Detail panel for the selected place. */
export function InfoCard({ ref, mode, selection, onOpenTirthankara, onBack }: Props) {
  const open = selection !== null;
  const isPlace = selection?.kind === 'place';
  return (
    <section ref={ref} className={`info-card${open ? ' is-open' : ''}${isPlace ? ' is-place' : ''}`}
      aria-hidden={!open} aria-live="polite">
      {isPlace ? (
        <button type="button" className="card-back" onClick={onBack}>
          <span aria-hidden="true">‹</span> Back
        </button>
      ) : null}
      {selection?.kind === 'place' && <PlaceBody placeKey={selection.key} mode={mode} onOpen={onOpenTirthankara} />}
    </section>
  );
}

function PlaceBody({ placeKey, mode, onOpen }: { placeKey: PlaceKey; mode: Mode; onOpen: (id: number) => void }) {
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
          <button type="button" key={t.id} className="chip" onClick={() => onOpen(t.id)}>
            <span className="chip-portrait"><Portrait t={t} /></span>
            <span className="chip-num">{t.id}</span>{t.name}
          </button>
        ))}
      </div>
    </div>
  );
}

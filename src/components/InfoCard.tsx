import type { Ref } from 'react';
import { PLACES, TIRTHANKARAS, ordinal, placeOf, type Mode, type PlaceKey } from '../data/tirthankaras';
import type { Selection } from './MapView';
import { BackButton } from './BackButton';
import { Figure } from './view/SceneArt';
import { FitText } from './FitText';

const BASE = import.meta.env.BASE_URL;

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
        <BackButton className="card-back" label="Back to map" onClick={onBack} />
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
      <ul className={`place-list${list.length > 1 ? ' is-multi' : ''}`}>
        {list.map(t => {
          // In birth mode show where they attained moksha, and vice versa.
          const other = PLACES[mode === 'birth' ? t.moksha : t.birth];
          return (
            <li key={t.id}>
              <button type="button" className="pi" onClick={() => onOpen(t.id)}
                aria-label={`${t.name}, ${ordinal(t.id)} Tirthankara. Open their story`}>
                <span className="pi-art" aria-hidden="true">
                  <span className="pi-niche"><span className="pi-figure"><Figure colour={t.colour} /></span></span>
                  <span className="pi-seal"><img src={BASE + t.symbolSm} alt="" /></span>
                </span>
                <span className="pi-text">
                  <span className="pi-kicker">{ordinal(t.id)} Tirthankara</span>
                  <FitText className="pi-name" min={1.125}>{t.name}</FitText>
                  <span className="pi-meta">
                    <span><em>Symbol</em> {t.emblem}</span>
                    <span><em>{mode === 'birth' ? 'Moksha at' : 'Born in'}</em> {other.name}</span>
                  </span>
                </span>
                <span className="pi-go" aria-hidden="true">›</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

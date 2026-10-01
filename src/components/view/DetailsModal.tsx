import { useEffect, useState } from 'react';
import { COLOURS, PLACES, TIRTHANKARAS, ordinal } from '../../data/tirthankaras';
import { DESCRIPTIONS, KEVALA_TREES } from '../../data/details';
import { Figure } from './SceneArt';

const BASE = import.meta.env.BASE_URL;

/** Full-screen popup with everything about one Tirthankara. */
export function DetailsModal({ id, onClose }: { id: number; onClose: () => void }) {
  const t = TIRTHANKARAS[id - 1];
  const d = DESCRIPTIONS[id - 1];
  const tree = KEVALA_TREES[id - 1];
  const birth = PLACES[t.birth], moksha = PLACES[t.moksha];
  const colour = COLOURS[t.colour];
  const [leaving, setLeaving] = useState(false);

  const close = () => { setLeaving(true); window.setTimeout(onClose, 320); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`details${leaving ? ' is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label={`About ${t.name}`}>
      <div className="details-panel">
        <button type="button" className="details-back" onClick={close}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          Back
        </button>

        <div className="details-scroll">
          <header className="details-head">
            <p className="details-kicker">{ordinal(t.id)} Tirthankara</p>
            <h2 className="details-title">{t.name}</h2>
            <p className="details-hi"><span lang="hi">{t.hi}</span>{t.alias && ` · ${t.alias}`}</p>
          </header>

          {/* The Tirthankara and their identifying symbol, side by side */}
          <div className="details-hero">
            <figure className="hero-tile hero-tile--figure">
              <div className="hero-art"><Figure colour={t.colour} /></div>
              <figcaption>
                <span className="hero-label">Tirthankara</span>
                {t.name}
              </figcaption>
            </figure>
            <figure className="hero-tile hero-tile--symbol">
              <div className="hero-art"><img src={BASE + t.symbol} alt={t.emblem} /></div>
              <figcaption>
                <span className="hero-label">Lanchhan · Symbol</span>
                {t.emblem}
              </figcaption>
            </figure>
          </div>
          <p className="hero-note">Idols of the Tirthankaras look alike; each is recognised by the symbol carved on its pedestal.</p>

          <dl className="details-facts">
            <div><dt>Colour</dt><dd><span className="swatch" style={{ background: colour.hex }} />{colour.label}</dd></div>
            <div><dt>Parents</dt><dd>{t.parents}</dd></div>
            <div><dt>Birthplace</dt><dd>{birth.name}<small>{birth.region}</small></dd></div>
            <div><dt>Moksha place</dt><dd>{moksha.name}<small>{moksha.region}</small></dd></div>
          </dl>

          <section className="details-section">
            <h3>{d.title}</h3>
            {d.body.map((para, i) => <p key={i}>{para}</p>)}
          </section>

          <section className="details-section details-tree">
            <img src={BASE + tree.image} alt={`${tree.common} tree`} />
            <div>
              <h3>Kevala Vriksha · {tree.name}</h3>
              <p className="details-tree-names"><span lang="hi">{tree.hi}</span> · {tree.common}</p>
              <p>
                Under the {tree.common.toLowerCase()} tree, {t.name} attained Kevala Jnana, the infinite
                knowledge that comes when all inner obstacles are removed. Each Tirthankara has their own
                Kevala tree, honoured in temples and art.
              </p>
              <p>{tree.note}</p>
            </div>
          </section>

          <section className="details-section">
            <h3>Additional details</h3>
            <ul className="details-list">
              {d.more.map((m, i) => <li key={i}>{m}</li>)}
              <li>Born in {birth.name} ({birth.region})</li>
              <li>Attained moksha at {moksha.name} ({moksha.region})</li>
              <li>Recognised in idols by the {t.emblem.toLowerCase()} emblem carved on the pedestal</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

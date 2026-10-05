import { useEffect, useState, type ReactNode } from 'react';
import { COLOURS, PLACES, TIRTHANKARAS, ordinal } from '../../data/tirthankaras';
import { DESCRIPTIONS, KEVALA_TREES } from '../../data/details';
import { Figure, SCENE } from './SceneArt';
import { BackButton } from '../BackButton';
import { FitText } from '../FitText';

const BASE = import.meta.env.BASE_URL;

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="dm-fact">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** Devanagari digits, as printed on museum labels in Hindi. */
const toDeva = (n: number) => String(n).replace(/\d/g, d => '०१२३४५६७८९'[Number(d)]);

/** Lotus ornament used as a section divider. */
function Ornament() {
  return (
    <div className="dm-ornament" aria-hidden="true">
      <span />
      <svg viewBox="0 0 48 24"><path d="M24 4c3 4 3 10 0 16-3-6-3-12 0-16zM24 20c-4-1-9-5-10-11 5 0 9 4 10 11zM24 20c4-1 9-5 10-11-5 0-9 4-10 11zM24 20c-6 1-12-1-16-5 6-2 12 0 16 5zM24 20c6 1 12-1 16-5-6-2-12 0-16 5z" /></svg>
      <span />
    </div>
  );
}

/** Full-screen detail page for one Tirthankara. */
export function DetailsModal({ id, onClose, onClosing }: {
  id: number;
  onClose: () => void;
  /** Called when the closing slide starts (the scene behind should reappear). */
  onClosing?: () => void;
}) {
  const t = TIRTHANKARAS[id - 1];
  const d = DESCRIPTIONS[id - 1];
  const tree = KEVALA_TREES[id - 1];
  const birth = PLACES[t.birth], moksha = PLACES[t.moksha];
  const colour = COLOURS[t.colour];
  const [leaving, setLeaving] = useState(false);

  const close = () => { setLeaving(true); onClosing?.(); window.setTimeout(onClose, 320); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`dm${leaving ? ' is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label={`About ${t.name}`}>
      <article className="dm-sheet">
        <div className="dm-scroll">
          {/* Hero: the Tirthankara in a backlit shrine niche, symbol as a seal */}
          <header className="dm-hero">
            <div className="dm-border" aria-hidden="true" />
            <BackButton className="dm-back" label="Back to scene" onClick={close} />
            <span className="dm-count" aria-label={`${t.id} of 24`}>{toDeva(t.id)} / {toDeva(24)}</span>

            <div className="dm-niche">
              <span className="dm-niche-glow" />
              {/* Seated on the marble pedestal (simhasana) */}
              <div className="dm-stack">
                <div className="dm-figure"><Figure colour={t.colour} /></div>
                <img className="dm-pedestal" src={SCENE('pedestal')} alt="" />
              </div>
            </div>
            <div className="dm-seal"><img src={BASE + t.symbol} alt={`${t.emblem} (symbol)`} /></div>
          </header>

          <div className="dm-body">
            <div className="dm-title">
              <p className="dm-kicker">{ordinal(t.id)} Tirthankara</p>
              <FitText as="h2" min={1.5}>{t.name}</FitText>
              <p className="dm-sub"><span lang="hi">{t.hi}</span>{t.alias && <> · {t.alias}</>}</p>
            </div>

            <dl className="dm-facts">
              <Fact label="Symbol">{t.emblem}</Fact>
              <Fact label="Colour">
                <span className="dm-swatch" style={{ background: colour.hex }} />{colour.label}
              </Fact>
              <Fact label="Parents">{t.parents}</Fact>
              <Fact label="Born in">{birth.name}<small>{birth.region}</small></Fact>
              <Fact label="Moksha at">{moksha.name}<small>{moksha.region}</small></Fact>
            </dl>

            <Ornament />

            <section className="dm-section dm-story">
              <h3>{d.title}</h3>
              {d.body.map((para, i) => <p key={i}>{para}</p>)}
            </section>

            <Ornament />

            <section className="dm-section dm-tree">
              <figure className="dm-tree-art">
                <img src={BASE + tree.image} alt={tree.hasArt ? `${tree.common} tree` : ''} />
                {/* Stand-in painting until this tree's own artwork arrives */}
                {!tree.hasArt && <figcaption>Representative image</figcaption>}
              </figure>
              <div className="dm-tree-text">
                <p className="dm-kicker">Kevala Vriksha</p>
                <h3>{tree.common}</h3>
                <p className="dm-tree-names"><span lang="hi">{tree.hi}</span> · {tree.name}</p>
                <p>
                  Under this tree {t.name} attained Kevala Jnana — infinite knowledge, when every inner
                  obstacle falls away. Each Tirthankara has their own Kevala tree, honoured in temples and art.
                </p>
                <p className="dm-muted">{tree.note}</p>
              </div>
            </section>

            <section className="dm-section">
              <h3>Additional details</h3>
              <ul className="dm-list">
                {d.more.map((m, i) => <li key={i}>{m}</li>)}
                <li>Born in {birth.name}, {birth.region}</li>
                <li>Attained moksha at {moksha.name}, {moksha.region}</li>
                <li>Idols are recognised by the {t.emblem.toLowerCase()} carved on the pedestal</li>
              </ul>
            </section>
          </div>
        </div>
      </article>
    </div>
  );
}

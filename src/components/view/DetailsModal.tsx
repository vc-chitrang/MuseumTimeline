import { useEffect, useState, type ReactNode } from 'react';
import { COLOURS, PLACES, TIRTHANKARAS, ordinal } from '../../data/tirthankaras';
import { DESCRIPTIONS, KEVALA_TREES } from '../../data/details';
import { Figure } from './SceneArt';

const BASE = import.meta.env.BASE_URL;

/** Small line icons for the facts panel. */
const ICONS: Record<string, ReactNode> = {
  symbol: <path d="M12 3l2.6 5.6L20 9.5l-4 4 1 5.8-5-2.8-5 2.8 1-5.8-4-4 5.4-.9z" />,
  colour: <path d="M12 3s6 6.4 6 10.5A6 6 0 0 1 6 13.5C6 9.4 12 3 12 3z" />,
  parents: <><circle cx="8.5" cy="8" r="3" /><circle cx="16" cy="9" r="2.5" /><path d="M3 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6M14 20c0-2.6 1.4-4.6 3-5 1.8.4 4 2.4 4 5" /></>,
  birth: <><path d="M4 11l8-6 8 6" /><path d="M6 10v10h12V10" /><path d="M10 20v-5h4v5" /></>,
  moksha: <><path d="M3 19l6-9 4 5 3-3 5 7z" /><circle cx="17" cy="6" r="2" /></>
};

function Fact({ icon, label, children }: { icon: string; label: string; children: ReactNode }) {
  return (
    <div className="dm-fact">
      <span className="dm-fact-icon" aria-hidden="true"><svg viewBox="0 0 24 24">{ICONS[icon]}</svg></span>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

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
    <div className={`dm${leaving ? ' is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label={`About ${t.name}`}>
      <article className="dm-sheet">
        <div className="dm-scroll">
          {/* Hero: the Tirthankara in a backlit shrine niche, symbol as a seal */}
          <header className="dm-hero">
            <button type="button" className="dm-back" onClick={close} aria-label="Back">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <span className="dm-count">{t.id}<small>/24</small></span>

            <div className="dm-niche">
              <span className="dm-niche-glow" />
              <div className="dm-figure"><Figure colour={t.colour} /></div>
            </div>
            <div className="dm-seal"><img src={BASE + t.symbol} alt={`${t.emblem} (symbol)`} /></div>
          </header>

          <div className="dm-body">
            <div className="dm-title">
              <p className="dm-kicker">{ordinal(t.id)} Tirthankara</p>
              <h2>{t.name}</h2>
              <p className="dm-sub"><span lang="hi">{t.hi}</span>{t.alias && <> · {t.alias}</>}</p>
            </div>

            <dl className="dm-facts">
              <Fact icon="symbol" label="Symbol">{t.emblem}</Fact>
              <Fact icon="colour" label="Colour">
                <span className="dm-swatch" style={{ background: colour.hex }} />{colour.label}
              </Fact>
              <Fact icon="parents" label="Parents">{t.parents}</Fact>
              <Fact icon="birth" label="Birthplace">{birth.name}<small>{birth.region}</small></Fact>
              <Fact icon="moksha" label="Moksha place">{moksha.name}<small>{moksha.region}</small></Fact>
            </dl>

            <Ornament />

            <section className="dm-section dm-story">
              <h3>{d.title}</h3>
              {d.body.map((para, i) => <p key={i}>{para}</p>)}
            </section>

            <Ornament />

            <section className="dm-section dm-tree">
              <div className="dm-tree-art"><img src={BASE + tree.image} alt={`${tree.common} tree`} /></div>
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

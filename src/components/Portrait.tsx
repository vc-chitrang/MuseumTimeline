import type { CSSProperties } from 'react';
import { COLOURS, type Tirthankara } from '../data/tirthankaras';

const BASE = import.meta.env.BASE_URL;

/**
 * Round medallion showing the Tirthankara's emblem (lanchhan) on a lit
 * backdrop, ringed by a halo in their body colour.
 */
export function Portrait({ t }: { t: Tirthankara }) {
  const style = { '--halo': COLOURS[t.colour].hex } as CSSProperties;
  return (
    <span className="portrait" style={style}>
      <img src={BASE + t.symbol} alt="" draggable={false} loading="eager" decoding="async" />
    </span>
  );
}

/** Small inline emblem for detail cards. */
export function Emblem({ t }: { t: Tirthankara }) {
  return <img className="emblem" src={BASE + t.symbol} alt="" draggable={false} />;
}

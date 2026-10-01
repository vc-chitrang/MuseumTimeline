import type { Mode } from '../data/tirthankaras';

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const OPTIONS: { value: Mode; label: string; hi: string }[] = [
  { value: 'birth', label: 'Birth Place', hi: 'जन्म स्थान' },
  { value: 'moksha', label: 'Moksha Place', hi: 'मोक्ष स्थान' }
];

/** Segmented radio control that switches the map between birth and moksha places. */
export function ModeToggle({ mode, onChange }: Props) {
  return (
    <fieldset className={`mode-toggle is-${mode}`}>
      <legend className="sr-only">Show places of</legend>
      <span className="mode-thumb" aria-hidden="true" />
      {OPTIONS.map(o => (
        <label key={o.value} className={`mode-option${mode === o.value ? ' is-checked' : ''}`}>
          <input
            type="radio"
            name="map-mode"
            value={o.value}
            checked={mode === o.value}
            onChange={() => onChange(o.value)}
          />
          <span className="mode-radio" aria-hidden="true" />
          <span className="mode-text">
            {o.label}
            <small lang="hi">{o.hi}</small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

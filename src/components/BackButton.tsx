/** The app's single back button: round, icon only. Position via `className`. */
export function BackButton({ onClick, label = 'Back', className = '' }: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button type="button" className={`back-btn ${className}`.trim()} aria-label={label} onClick={onClick}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
    </button>
  );
}

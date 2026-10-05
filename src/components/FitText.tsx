import { useLayoutEffect, useRef, type ElementType, type ReactNode } from 'react';

/**
 * Single-line text that never overflows its box: the CSS font size is the
 * maximum, and long names (e.g. "Chandraprabhu" on a narrow phone) shrink
 * just enough to fit. Re-fits on resize/rotation and once web fonts load.
 */
export function FitText({ as: Tag = 'span', className, children, min = 1, ...rest }: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Smallest font size, in rem. */
  min?: number;
  [attr: string]: unknown;
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const text = el?.firstElementChild as HTMLElement | null;
    if (!el || !text) return;
    const fit = () => {
      el.style.fontSize = ''; // back to the CSS size, the maximum
      const avail = el.clientWidth;
      const need = text.scrollWidth;
      if (avail > 0 && need > avail) {
        const size = parseFloat(getComputedStyle(el).fontSize);
        const minPx = min * parseFloat(getComputedStyle(document.documentElement).fontSize);
        el.style.fontSize = `${Math.max(minPx, Math.floor(size * (avail / need) * 0.98))}px`;
      }
    };
    fit();
    // Observe the parent: the font size never changes the parent's width,
    // so fitting cannot trigger itself in a loop.
    const ro = new ResizeObserver(fit);
    if (el.parentElement) ro.observe(el.parentElement);
    let alive = true;
    document.fonts?.ready.then(() => { if (alive) fit(); });
    return () => { alive = false; ro.disconnect(); };
  }, [children, min]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      <span className="fit-text">{children}</span>
    </Tag>
  );
}

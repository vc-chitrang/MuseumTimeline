/** Lighten (p > 0) or darken (p < 0) a #rrggbb colour by p percent. */
export function shade(hex: string, p: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [n >> 16, (n >> 8) & 255, n & 255].map(v =>
    Math.max(0, Math.min(255, Math.round(p > 0 ? v + (255 - v) * (p / 100) : v * (1 + p / 100))))
  );
  return '#' + ch.map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Linear lat/lon → pixel projection for public/assets/images/india-map.webp
 * (2040 × 1632, cropped 260 px from the left of the source artwork).
 * Calibrated against coastline landmarks (Kanyakumari, Dwarka, Kolkata, Sri Lanka).
 */
export const MAP_WIDTH = 2040;
export const MAP_HEIGHT = 1632;

export interface Point { x: number; y: number }

const X0 = 803.7, LON0 = 77.55, PX_PER_LON = 56.07;
const Y0 = 1486.9, LAT0 = 8.08, PX_PER_LAT = 49.8;

export function project(lat: number, lon: number): Point {
  return {
    x: X0 + (lon - LON0) * PX_PER_LON,
    y: Y0 - (lat - LAT0) * PX_PER_LAT
  };
}

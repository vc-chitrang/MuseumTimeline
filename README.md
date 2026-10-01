# MuseumTimeline — Moksha Bhumi

Interactive museum experience for the 24 Tirthankaras of the current Jain time cycle.
The home screen is a map of India showing where each Tirthankara attained moksha.

## Tech stack
- **Vite + React + TypeScript**: single-page app, typed content data
- **vite-plugin-pwa**: offline caching for museum kiosks
- **@fontsource**: self-hosted fonts (Cormorant Garamond, Mukta with Devanagari)
- **GitHub Actions → GitHub Pages**: every push to `main` is type-checked, built and deployed

Design target: 800 × 1280 portrait tablet. Also adapts to 768 × 1024, landscape tablets and phones.

## Develop
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
```

## Project layout
```
src/
  data/tirthankaras.ts   content: names, emblems, colours, moksha places
  lib/projection.ts      lat/lon → map-pixel calibration for the map image
  lib/layout.ts          positions of portraits, ring and leader lines
  hooks/usePanZoom.ts    pinch / drag / wheel zoom for the map
  components/            MapView, InfoCard, Portrait
  styles/app.css         design tokens, layout and animations
public/assets/images/    optimised map (WebP + JPG fallback)
Data/                    raw source media (not committed)
```

## Content note
The source for names, symbols and moksha places is thejainreligion.in. Some details
differ between the Svetambara and Digambara traditions. A subject expert should review
all content before launch. Tirthankara portraits are placeholders until artwork is supplied.

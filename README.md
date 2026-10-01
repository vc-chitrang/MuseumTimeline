# MuseumTimeline — Moksha Bhumi

Interactive museum experience for the 24 Tirthankaras of the current Jain time cycle.
- **Home:** map of India with a Birth Place / Moksha Place toggle.
- **Tirthankara view:** tap a portrait to open a full-screen parallax scene (sky, Kevala tree, temple,
  seated figure, emblem). Swipe up/down for the next/previous Tirthankara; the right-hand rail
  opens the details popup.

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
  data/details.ts        Kevala trees and descriptions (draft, needs expert review)
  components/            MapView, InfoCard, Portrait, ModeToggle
  components/view/       full-screen Tirthankara scene, pager, rail, details popup
  styles/app.css         design tokens, layout and animations
public/assets/images/    optimised map (WebP + JPG fallback)
public/assets/symbols/   emblem artwork (from Data/Images/Symbols)
public/assets/trees/     Kevala tree artwork (from Data/Images/Tree; 3 of 24 so far)
Data/                    raw source media (not committed)
```

## Content note
The source for names, symbols and moksha places is thejainreligion.in. Some details
differ between the Svetambara and Digambara traditions. A subject expert should review
all content before launch. Tirthankara portraits are placeholders until artwork is supplied.

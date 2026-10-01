# Art Brief — Tirthankara Scene Assets

Hand this document to the image-generation AI or artist. Every asset is a **separate layer**.
The app stacks the layers and moves each one at its own speed (parallax). Because of that, layers
must not be merged into one picture.

---

## 1. What we are building

A full-screen, interactive museum scene for each of the 24 Jain Tirthankaras, on tablets.

**Mood:** a calm, bright early morning in a sacred grove. Soft golden sunlight comes from the
**upper left**. The air is clear, there is gentle haze in the distance, and the feeling is peaceful
and devotional.

**What the visitor sees, back to front:**

```
 ┌───────────────────────────────┐
 │   sky + sun glow + clouds     │  ← far away, barely moves
 │      distant hills            │
 │  side trees   KEVALA TREE     │
 │            ┌──────────┐       │
 │            │  TEMPLE  │       │  ← carved stone shrine
 │            │ TIRTHANKARA│     │  ← seated in meditation
 │            │ [pedestal]│      │
 │  meadow    └──[emblem]┘       │  ← emblem (already supplied)
 │ bushes                 bushes │  ← closest, moves fastest
 └───────────────────────────────┘
```

**Style:** realistic and painterly. It should match the emblem and tree images already supplied:
natural colours, soft shadows, high detail, not cartoon.

---

## 2. Rules for every asset

| Rule | Requirement |
|---|---|
| Format | **PNG, 32-bit with transparent background** (except the sky) |
| Colour | sRGB |
| Edges | Clean, anti-aliased alpha. **No green-screen fringe**, no halo, no drop shadow baked outside the object |
| Text / marks | **No text, no logo, no watermark, no AI sparkle mark** |
| Light | Sun from the **upper left**, warm morning light, same on every layer |
| Camera | **Eye level, straight-on front view**, no tilt, no strong perspective |
| Padding | About 3% empty transparent margin around each object |
| Ground line | Objects that stand on the ground must have a **flat, level base** at the bottom of the image |

**Screens served:** 800 × 1280 portrait tablets (main) and 1280 × 800 landscape, at 2× pixel density.
The sizes below are large enough for both.

---

## 3. Assets needed (one by one)

### A. Sky — `sky.png`
- **Size:** 2560 × 2560 px, **opaque** (no transparency)
- Bright morning sky gradient: deep sky blue at the top, pale blue in the middle, warm cream/peach at
  the horizon (bottom 25%). A soft sun glow in the upper-left third. **No clouds, no birds, no ground.**
- Prompt: *"Clear early-morning sky, soft gradient from sky blue at top to warm cream at the
  horizon, gentle sun glow upper left, no clouds, no land, painterly realistic, 1:1"*

### B. Clouds — `cloud-01.png` … `cloud-04.png`
- **Size:** 1400 × 600 px each, transparent
- 4 different soft, fluffy white cumulus clouds with light shading from the upper left. Wispy edges,
  one cloud per file.

### C. Distant hills — `hills-far.png`
- **Size:** 3840 × 900 px, transparent above the hill line
- Soft blue-green mountains fading into morning haze. Low contrast and atmospheric. The hill line
  should sit in the top 40% of the image; fill everything below it solid down to the bottom edge.
  The image must tile or extend naturally left to right.

### D. Near hills / forest line — `hills-near.png`
- **Size:** 3840 × 900 px, transparent above
- Gentle green hills topped with a line of distant tree canopies. Slightly more saturated than the
  far hills. Fill solid down to the bottom edge.

### E. Meadow / ground — `meadow.png`
- **Size:** 3840 × 1200 px, transparent at the top edge (soft fade over the top 10%)
- Lush green grass meadow seen from eye level, a few tiny wildflowers. Lighter at the back, richer
  green at the front. No path, no objects.

### F. Kevala trees — `tree-01.png` … `tree-24.png`
- **Size:** 2400 × 2400 px, transparent, **full tree including the whole crown** (don't crop the top),
  trunk standing on a flat base
- One per Tirthankara (list below). Wide, majestic, healthy tree, straight-on view, lit from the upper left.
- Prompt: *"Single majestic [TREE] tree, full crown and trunk, isolated on transparent background,
  front view at eye level, morning light from upper left, realistic, no ground, no shadow"*

| # | Tirthankara | Kevala tree (supply as) | Status |
|---|---|---|---|
| 1 | Rishabhanatha | Banyan (Nyagrodha) | ✅ supplied |
| 2 | Ajitnath | Saptaparni (Alstonia scholaris) | ✅ supplied |
| 3 | Sambhavnath | Sal (Shorea robusta) | ⚠️ re-do: crown is cropped flat |
| 4 | Abhinandannath | Chironji / Priyal (Buchanania lanzan) | needed |
| 5 | Sumatinath | Priyangu (Callicarpa macrophylla) | needed |
| 6 | Padmaprabhu | Banyan | reuse #1 |
| 7 | Suparshvanath | Siris (Albizia lebbeck) | needed |
| 8 | Chandraprabhu | Nagkesar (Mesua ferrea) | needed |
| 9 | Pushpadanta | Naga tree (expert to confirm species) | needed |
| 10 | Sheetalnath | Bael (Aegle marmelos) | needed |
| 11 | Shreyansnath | Tumburu (Zanthoxylum) | needed |
| 12 | Vasupujya | Patala (Stereospermum) | needed |
| 13 | Vimalnath | Jamun (Syzygium cumini) | needed |
| 14 | Anantnath | Peepal (Ficus religiosa) | needed |
| 15 | Dharmanath | Wood-apple / Kaith (Limonia acidissima) | needed |
| 16 | Shantinath | Toon (Toona ciliata) | needed |
| 17 | Kunthunath | Tilaka (expert to confirm species) | needed |
| 18 | Arahnath | Mango (Mangifera indica) | needed |
| 19 | Mallinath | Ashoka (Saraca asoca), with red blossoms | needed |
| 20 | Munisuvrata | Champa (Magnolia champaca), with golden flowers | needed |
| 21 | Naminath | Bakul (Mimusops elengi) | needed |
| 22 | Neminath | Vetasa / cane (Calamus); a cane clump rather than a tree | needed |
| 23 | Parshvanath | Deodar (Cedrus deodara) | needed |
| 24 | Mahavira | Sal | reuse #3 (re-done) |

**Total new trees: 19, plus the Sal re-do.**

### G. Side / atmosphere trees — `side-tree-01.png` … `side-tree-03.png`
- **Size:** 1600 × 2000 px, transparent
- Generic Indian forest trees (neem, ashoka, mango) used to frame the edges. Slightly softer and
  lighter, as if a little farther away.

### H. Temple shrine — `temple.png`
- **Size:** 1800 × 2100 px (**aspect 6 : 7**, which matches the app's frame), transparent outside the structure
- A carved sandstone Jain shrine (devakulika) seen straight on and symmetrical:
  - two ornate carved pillars
  - a **cusped (scalloped) arch** opening in the centre
  - a carved lintel band, and a small dome (shikhara) with a kalash finial on top
  - a two-step plinth at the bottom
- **Niche:** the inside of the arch is a **dark, warm, shaded recess** (opaque, not transparent).
  The figure is placed in front of it as a separate layer.
- **Required proportions** so the figure fits:
  - niche opening ≈ 57% of the image width, centred
  - top of the arch at ≈ 28% from the top
  - niche floor at ≈ 93% from the top
- **Leave the niche empty:** no idol, no emblem, no text.
- Prompt: *"Front view of an ornate carved sandstone Jain temple shrine, symmetrical, two carved
  pillars, cusped scalloped arch, empty dark niche, small dome with kalash on top, two-step plinth,
  isolated on transparent background, warm morning light from upper left, realistic"*

### I. Tirthankara figure — `figure-<colour>.png`
- **Size:** 1600 × 1720 px (aspect 400 : 430), transparent
- Seated in **padmasana** (full lotus), hands in **dhyana mudra** (right hand over left in the lap),
  spine straight.
- Serene face, eyes gently half-closed in meditation, long earlobes, tight curled hair with ushnisha.
- **Shrivatsa** mark on the chest.
- A subtle golden halo (bhamandal) behind the head may be included; the app can add one if not.
- **No emblem and no pedestal** in this image; both are separate layers.
- Polished marble or stone finish in the body colour, with the base flat at the bottom.
- **Ask the museum first:** Digambara style (unadorned) or Svetambara style (crystal eyes, ornaments)?
- The 24 Tirthankaras are traditionally depicted alike and identified by their emblem, so only
  **these 8 figures** are needed:

| File | Body colour | Used for |
|---|---|---|
| `figure-golden.png` | golden / warm cream marble | 1–5, 10, 11, 13–18, 21, 24 |
| `figure-red.png` | red (coral sandstone) | 6, 12 |
| `figure-white.png` | white marble | 8, 9 |
| `figure-blue.png` | blue | 19 |
| `figure-dark.png` | dark blue / black stone | 20, 22 |
| `figure-green.png` | green (emerald stone) | (spare) |
| `figure-green-hood5.png` | green, with a **5-headed serpent hood** canopy | 7 Suparshvanath |
| `figure-green-hood7.png` | green, with a **7-headed serpent hood** canopy | 23 Parshvanath |

(The serpent hood is the traditional iconography for Suparshvanath and Parshvanath. Please confirm
the number of hoods with the expert.)

### J. Pedestal (simhasana) — `pedestal.png`
- **Size:** 2000 × 480 px (aspect 500 : 120), transparent
- A plain, three-tier white marble pedestal with subtle carved panels, seen straight on.
- Keep the **front centre plain**, because the emblem is placed in front of it.

### K. Foreground foliage — `foliage-left.png`
- **Size:** 1600 × 900 px, transparent
- A lush flowering bush clump (jasmine, marigold, small pink flowers) filling the **bottom-left
  corner**, with its densest part at the bottom-left and opening towards the top-right.
- The app mirrors it for the right side. A separate `foliage-right.png` is optional.

### L. Emblems — ✅ already supplied
24 transparent emblem images in `Data/Images/Symbols`. No action needed.

---

## 4. Screen safe zones (keep important detail out of these)

| Zone | Area | Covered by |
|---|---|---|
| Top band | top 12% of the screen | Tirthankara name |
| Top-left corner | 110 × 110 px | Back button |
| Right edge | right 13% of width, middle 40% of height | Navigation rail |

For trees and temples this means: crowns may pass behind the name, but don't put key detail at the
very top or the far right.

---

## 5. Delivery

Put files in these folders using the names above:

```
Data/Images/Scene/
  sky.png
  clouds/cloud-01.png … cloud-04.png
  hills-far.png, hills-near.png, meadow.png
  side-trees/side-tree-01.png … 03.png
  temple.png
  pedestal.png
  foliage-left.png
  figures/figure-golden.png … figure-green-hood7.png
Data/Images/Tree/
  01-nyagrodha-banyan-tree.png … 24-….png   (keep existing naming)
```

The app team will trim, compress (WebP) and wire them in.

## 6. Checklist before sending

- [ ] Transparent background and clean edges (zoom to 400% and look for green or white fringes)
- [ ] No text or watermark
- [ ] Light from the upper left on every asset
- [ ] Straight-on, eye-level view
- [ ] Full object, nothing cropped (especially tree crowns)
- [ ] Correct size and aspect ratio from this brief

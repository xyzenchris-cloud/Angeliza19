# Bubu & Dudu Birthday

A mobile-first, single-page interactive birthday site built with Vite, React,
TypeScript, Tailwind CSS, and Framer Motion.

## Getting started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Assets

The `src/assets/bears/` directory must be populated manually with licensed
Bubu & Dudu image and GIF files before the bear components will render
correctly. See `BEAR_ASSETS.md` for the asset requirements.

The click-paw graphic is loaded from `src/assets/ui/paw.png`. A transparent
PNG should be placed at that path; the click effect falls back to its inline
paw illustration if the asset is unavailable.

Optional replacement SFX files can be placed in `src/assets/newSfx/` as
`intro.wav`, `crunch.wav`, and `beating.wav`. Vite discovers these files as
bundled asset URLs at build time. If a file is missing or cannot play, the app
emits one clear console warning and continues without that effect. The landing
sequence begins after the user taps the on-theme “Tap to begin” prompt so
mobile browser autoplay policies can unlock audio.

# dvd-screensaver

The classic bouncing DVD logo screensaver, as a web app. The logo bounces off
all four edges and changes color on every bounce — and every once in a while,
it hits the corner perfectly.

## Features

- **High-DPI rendering** — the canvas backing store is scaled by
  `window.devicePixelRatio` while the CSS size fills the viewport, so the logo
  stays crisp on Retina/HiDPI displays.
- **Responsive logo** — the logo width scales with the viewport, clamped
  between 60px and 220px.
- **Smooth animation** — `requestAnimationFrame` with delta-time physics and
  collision detection against all four edges; the logo changes color on every
  bounce.
- **Corner hit counter** — hitting two walls at once (a corner hit) increments
  the on-screen counter, which persists across reloads via `localStorage`.

## Requirements

- Node.js 18+ and npm

## Run it

```sh
npm install
npm run dev
```

Then open the URL Vite prints (default: http://localhost:5173).

## Build

```sh
npm run build
```

Outputs a static bundle to `dist/`. Preview the production build with:

```sh
npm run preview
```

## Tech

Vite + TypeScript. No framework — the whole app is a single canvas and a
`requestAnimationFrame` loop (`src/main.ts`).

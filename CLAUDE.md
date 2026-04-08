# walkpod — project conventions

## What this is
A PWA for tracking a personal 75-day walking challenge. The user walks on a walking pad (no GPS) and manually feeds the daily km into the app. Local-only — no backend, data persists in `localStorage`.

## Stack
- Vite + React 19 + TypeScript
- Tailwind CSS v4 (CSS-first config in `src/index.css` via `@theme`)
- vite-plugin-pwa (Workbox, autoUpdate, installable)
- localStorage for persistence (see `src/lib/storage.ts`)

## File naming
**Components must use kebab-case file names.** Example: `pill-grid.tsx`, `task-row.tsx`, `ticket.tsx`. The exported React component inside still uses PascalCase (e.g. `export function PillGrid`). Imports reference the kebab-case path: `import { PillGrid } from './pill-grid'`.

This applies to all files under `src/components/`. Hooks and lib files also use kebab-case (`storage.ts` is fine since it's one word).

## Design system
Color palette is the **pomegranate** scale (50–950) defined in `src/index.css` under `@theme`. Plus `--color-cream` (#f1ead8) for the ticket background and `--color-ink` (#0a0a0a) for the page frame.

Typography:
- `font-slab` → Zilla Slab (headings, large display numbers)
- `font-mono` → JetBrains Mono (labels, body, metadata)

The visual language is a **paper ticket / receipt**: rounded card on dark background, slab-serif headlines, mono labels, wavy divider, capsule pill grid for progress, X-mark checkboxes.

## Data model
```ts
ChallengeState {
  startDate: string       // ISO yyyy-mm-dd
  totalDays: number       // default 75
  dailyTargetKm: number   // default 10
  entries: Record<dayNumber, { km, done, reading? }>
}
```
Storage key: `walkpod:challenge:v1` — bump the suffix if the schema breaks.

## Commands
- `npm run dev` — dev server
- `npm run build` — typecheck + production build (also generates PWA SW)
- `npm run preview` — preview production build
- `npm run lint`

<div align="center">

# walkpod

**Track your walking-pad sessions for 75 days. Lives entirely on your phone.**

[![React](https://img.shields.io/badge/React-19-b73417?style=for-the-badge&logo=react&logoColor=fef5ee)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-b73417?style=for-the-badge&logo=typescript&logoColor=fef5ee)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-b73417?style=for-the-badge&logo=vite&logoColor=fef5ee)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-b73417?style=for-the-badge&logo=tailwindcss&logoColor=fef5ee)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-installable-b73417?style=for-the-badge&logo=pwa&logoColor=fef5ee)](https://web.dev/learn/pwa)
[![Offline](https://img.shields.io/badge/Offline-first-b73417?style=for-the-badge&logo=googlechrome&logoColor=fef5ee)](#)

</div>

<p align="center">
  <img src="docs/screenshots/01-empty.png" alt="Empty state — day 1, no logs yet" width="270">
  <img src="docs/screenshots/02-dashboard.png" alt="Dashboard with sample data — heatmap shaded by daily km" width="270">
  <img src="docs/screenshots/03-roller.png" alt="Bottom sheet open with the iOS-style km roller picker" width="270">
</p>

---

## what it does

- **75 capsule pills**, one per day. Shaded like a GitHub contribution graph: more km that day, darker pill.
- **Tap the floating button** to open a bottom sheet with a roller picker. Spin it. Hit log.
- **Back-fill any past day** by tapping its pill. Edit existing entries the same way.
- **Day 1 is whenever you log your first walk.** Not whenever you first opened the app.
- **Installable, offline-first.** Data lives in your browser's `localStorage`. No accounts, no servers, no analytics.

## stack

`vite` + `react 19` + `typescript`, styled with `tailwind v4`, made installable by `vite-plugin-pwa`. That's the whole list.

State and persistence are React hooks plus `localStorage`. The roller picker is pure CSS scroll-snap, no animation library.

## run it

```bash
npm install
npm run dev
```

`npm run build` typechecks and produces a static `dist/` with a precached service worker baked in. Drop it on any static host.

## design notes

The visual language is a paper ticket. Slab-serif headlines, mono labels, wavy SVG divider, capsule pills, X-mark checkboxes. Background is cream `#f1ead8`, the only accent is the **pomegranate** orange-red palette `#fef5ee` → `#3f110b`. Two fonts only: **Zilla Slab** for display, **JetBrains Mono** for everything else.

Component files use kebab-case (`pill-grid.tsx`, `task-row.tsx`). The exported React component inside is still PascalCase. See [`CLAUDE.md`](CLAUDE.md) for the full conventions.

<div align="center">

---

made for myself, kept simple on purpose.

</div>

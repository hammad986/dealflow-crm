<div align="center">

# DealFlow CRM

**A premium frontend enterprise CRM demo**

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Netlify](https://img.shields.io/badge/Netlify-Ready-00C7B7?logo=netlify)](https://netlify.com)

Built with care by [Aetherion Labs](https://aetherionlabs.qzz.io/)

</div>

---

## Overview

DealFlow CRM is a fully interactive, client-side CRM application designed as a portfolio-grade demo. It features a dark-themed UI with a professional design language, drag-and-drop Kanban pipeline, real-time analytics, and persistent local storage — all running with zero backend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 7 |
| Styling | Tailwind CSS 3.4 + CSS Variables |
| State | Zustand 5 (with localStorage persistence) |
| Routing | React Router 7 |
| DnD | dnd-kit 6 |
| Charts | Recharts 2 |
| UI Primitives | Radix UI (Dialog, AlertDialog, Tooltip) |
| Command Palette | cmdk 1 |
| Calendar | react-day-picker 9 |
| Icons | Lucide React |
| Utilities | clsx, tailwind-merge, class-variance-authority |

## Features

- **Dashboard** — Revenue trends, pipeline by stage, AI insights, activity feed, follow-up tasks
- **Kanban Pipeline** — Drag-and-drop deal cards across customizable stages with confetti on won deals
- **Client Management** — Table/grid views, inline editing, full CRUD with form validation
- **Calendar** — Follow-up task management with overdue/today/upcoming grouping
- **Analytics** — Conversion funnel, lead source breakdown, deal cycle times, top clients
- **Settings** — Pipeline stage manager (drag-to-reorder, rename, recolor), currency prefs, CSV import/export, data reset
- **Command Palette** — `Ctrl+K` / `Cmd+K` for quick navigation and actions
- **Error Boundary** — Graceful error recovery with retry and refresh options
- **LocalStorage Persistence** — All data persists across sessions with graceful fallback

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── analytics/          # Conversion funnel, lead source chart, cycle time, top clients
│   ├── calendar/           # New task modal
│   ├── clients/            # Client table, grid card, form modal, detail sub-components
│   ├── dashboard/          # Revenue chart, pipeline chart, activity feed, followups, AI insights
│   ├── layout/             # App shell, sidebar, topbar, command palette
│   ├── pipeline/           # Kanban board/column/card, deal detail sheet, new deal/lost reason modals
│   ├── settings/           # Stage manager with DnD reorder
│   ├── shared/             # Avatar, currency text, confirm dialog, empty state, status badges
│   ├── ui/                 # Primitives: button, dialog, alert-dialog, sheet, tooltip, skeleton, calendar
│   └── error-boundary.tsx  # Top-level error boundary with retry
├── hooks/
│   └── use-keyboard-shortcuts.ts
├── lib/
│   ├── constants.tsx        # Activity icons/colors, currency locales
│   ├── csv-utils.ts         # CSV export/import utilities
│   ├── seed-data.ts         # Demo data (10 clients, 14 deals, 25 activities, 8 tasks)
│   ├── store.ts             # Zustand store with localStorage persistence
│   ├── types.ts             # TypeScript type definitions and constants
│   └── utils.ts             # cn() utility (clsx + tailwind-merge)
├── pages/
│   ├── dashboard.tsx
│   ├── pipeline.tsx
│   ├── clients.tsx
│   ├── clients/detail.tsx
│   ├── calendar.tsx
│   ├── analytics.tsx
│   └── settings.tsx
├── App.tsx                  # Root with routing, error boundary, command palette
├── main.tsx                 # Entry point
└── index.css                # Global styles, CSS variables, animations
```

## Deployment

The project is pre-configured for [Netlify](https://netlify.com) deployment via `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect: `/*` → `/index.html` (200)

## License

MIT

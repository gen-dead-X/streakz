<div align="center">

```
 ███████╗████████╗██████╗ ███████╗ █████╗ ██╗  ██╗███████╗
 ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██╔══██╗██║ ██╔╝╚══███╔╝
 ███████╗   ██║   ██████╔╝█████╗  ███████║█████╔╝   ███╔╝ 
 ╚════██║   ██║   ██╔══██╗██╔══╝  ██╔══██║██╔═██╗  ███╔╝  
 ███████║   ██║   ██║  ██║███████╗██║  ██║██║  ██╗███████╗
 ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
```

**Build habits. Track streaks. Stay unstoppable.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Bun](https://img.shields.io/badge/Bun-runtime-fbf0df?style=flat-square&logo=bun&logoColor=black)](https://bun.sh)
[![MongoDB](https://img.shields.io/badge/MongoDB-database-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com)

</div>

---

## What is Streakz?

Streakz is a focused habit-tracking web app built for people who care about consistency. You create habits, check in daily (or weekly, or on specific days), and watch your streaks grow. Miss a day and your streak resets — that's the deal.

It's minimal on fluff, deliberate in design: a dark interface with sharp green accents, animated cards, rich insights, and push notifications that remind you before the day is gone.

---

## Screenshots

> Add your screenshots to `public/screenshots/` and rename them to match the filenames below.

| Today — Habit Deck | Insights |
|---|---|
| ![Today view](public/screenshots/today.png) | ![Insights view](public/screenshots/insights.png) |

| New Habit Form | Achievements |
|---|---|
| ![New habit](public/screenshots/new-habit.png) | ![Achievements](public/screenshots/achievements.png) |

| Profile & Themes | Mobile View |
|---|---|
| ![Profile](public/screenshots/profile.png) | ![Mobile](public/screenshots/mobile.png) |

---

## Features

### Core Loop
- **Habit creation** — Name, icon, rich-text description, tags, and a visual card style
- **Flexible scheduling** — Daily, once-a-week, or specific days of the week
- **One-tap check-in** — Check in from the Today deck with a satisfying animation
- **Streak tracking** — Current streak, longest streak, and 60-day consistency score calculated per habit

### Insights
- Weekly bar chart of all check-ins over the last 9 weeks
- Calendar heatmap of your check-in history and missed days
- Active streaks count and cross-habit averages

### Achievements
Eight milestones to unlock as you go:

| Badge | Milestone |
|---|---|
| 🌱 First Habit | Create your very first habit |
| 🔥 7-Day Streak | Keep one habit going for 7 days straight |
| 🌟 30-Day Streak | 30 consecutive days |
| 💎 100-Day Streak | 100 days of unstoppable momentum |
| ✅ 10 Check-ins | Complete 10 total check-ins |
| ⚡ 50 Check-ins | Hit 50 total check-ins |
| 🎯 100 Check-ins | Reach 100 total check-ins |
| 🏆 500 Check-ins | 500 check-ins — a true champion |

### Personalization
- **9 color themes** — Emerald, Amber, Sunset, Violet, Sage, Sky, Ocean, Teal, Classy
- **7 card styles** — Wavy, Geometric, Blob, Aurora, Ember, Midnight, Rose
- Light & dark mode

### Push Notifications
- Browser push via Web Push API (VAPID)
- Daily cron at 22:00 UTC reminds users of incomplete habits
- Plays a notification sound on delivery
- Per-habit notification toggle

### Auth
- Email / password signup
- Google OAuth — one click, straight to streaks

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, RSC) |
| Runtime | Bun |
| UI Library | Ant Design 6 |
| Styling | Tailwind CSS 4 (CSS variables design system) |
| Animation | Framer Motion 12, Lottie, canvas-confetti |
| Rich Text | TipTap 3 |
| Auth | Better Auth + Google OAuth |
| Database | MongoDB + Mongoose |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Push | web-push (VAPID) |
| Deployment | Vercel (with Cron for nightly notifications) |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) — the only package manager used in this project
- A MongoDB database (Atlas free tier works fine)
- A Google Cloud OAuth 2.0 client
- VAPID keys for web push

### 1. Clone & install

```bash
git clone https://github.com/your-username/streakz.git
cd streakz
bun install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/streak-counter

# Better Auth
BETTER_AUTH_SECRET=          # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Web Push (VAPID)
# Generate with: bunx web-push generate-vapid-keys
VAPID_EMAIL=mailto:you@example.com
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
```

### 3. Run the dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

Push to GitHub and import to Vercel. Add all environment variables from `.env.local.example` in the Vercel dashboard.

The `vercel.json` includes a cron job that fires the nightly reminder notification at `22:00 UTC` every day:

```json
{
  "crons": [
    { "path": "/api/cron/notify", "schedule": "0 22 * * *" }
  ]
}
```

For cron to work in production, add `CRON_SECRET` to your Vercel environment variables and include it when hitting the endpoint.

---

## Project Structure

```
app/
  (app)/        ← Protected routes (today, insights, profile, settings, habits)
  (auth)/       ← Public routes (login, register)
  api/          ← API routes (habits, check-ins, achievements, push, cron)

components/
  ui/           ← Stateless primitives (BottomNav, SideNav, PageHeader…)
  features/     ← Domain-aware composed components (HabitList, InsightsSummary…)

hooks/          ← useCheckIn, usePushNotifications
lib/            ← Auth, DB connection, streak calculator, audio, validation schemas
models/         ← Mongoose models (Habit, CheckIn, Achievement, PushSubscription)
services/       ← Data access layer (habits, insights, achievements, push)
store/          ← Zustand stores (habits, insights, achievements, theme)
types/          ← Shared TypeScript types
constants/      ← Achievements, frequencies, themes, icons
```

---

## How Streak Calculation Works

The streak calculator (`lib/streak/calculator.ts`) handles all three frequency types differently:

- **Daily** — Counts consecutive days ending today (or yesterday if today isn't checked in yet)
- **Specific days** — Walks backwards through scheduled days, breaking on any missed one. Today is a grace period if not yet checked in.
- **Weekly** — Counts consecutive calendar weeks (Mon–Sun) with at least one check-in. Current week is a grace period.

Consistency is measured over the last 60 days as `completed scheduled days / total scheduled days × 100`.

---

## Moments That Felt Right ✦

A log of design work that hit the mark — what was built and what made it work.

---

### iOS-Style Bottom Sheet (June 2026)

Replaced the full-page add/edit habit flow with a Framer Motion bottom sheet that feels native to the device.

**What made it work:**
- Two snap points (full at 8% from top, half at 50%) with velocity-aware snapping — a quick flick advances; a slow drag position-snaps
- The background content scales to `0.93` and grows `14px` corner radius as the sheet opens, using a shared `MotionValue` so the scale interpolates live during drag with zero lag
- Drag is locked to the handle pill only — the content area scrolls independently without fighting the gesture
- `BottomSheetProvider` + `BottomSheetBackground` + `BottomSheet` are fully decoupled from the habit domain — drop them in any project, swap the CSS variables, and it works
- A single Zustand store (`useHabitSheetStore`) lets any component anywhere trigger the sheet without routing

The iOS zoom-out during open/close is the detail that makes it feel right.

---

<div align="center">

Built with focus, friction, and a healthy obsession with not breaking the chain.

</div>

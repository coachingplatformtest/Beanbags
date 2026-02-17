# 🎰 Beanbags Book

The Official Sportsbook of the 2030 Dynasty — a betting app for an 8-person NCAA CFB dynasty league.

## Features

- **Simple Name Entry**: No auth, just enter your name (new users get 100 units)
- **Full Betting Options**: Spreads, Moneylines, Totals, Futures, Props
- **Parlays**: Up to 5 legs, auto-calculated odds
- **Leaderboard**: Track who's winning the league
- **Complete Admin Panel**: Manage lines, enter scores, settle bets

## Quick Start

### 1. Install

```bash
cd beanbags-book
npm install
```

### 2. Set Up Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in SQL Editor
3. Run `supabase/seed.sql` to load initial data (teams, futures, sample games)

### 3. Configure

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
ADMIN_PASSWORD=beanbags2030
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000

## Pages

- `/` — Landing page with quick links
- `/lines` — Weekly game lines
- `/futures` — Natty, Heisman, Win Totals
- `/props` — Player/game props
- `/bets` — Your bet history
- `/leaderboard` — Rankings
- `/admin` — Admin panel (password: beanbags2030)

## Admin Panel

- **Slate**: Set current week, lock/unlock betting
- **Games**: Enter final scores
- **Futures**: Mark winners (Natty, Heisman)
- **Props**: Settle props
- **Users**: Adjust balances
- **Settle**: Batch settle all pending bets

## Tech Stack

- Next.js 14 (App Router)
- Supabase (PostgreSQL)
- Tailwind CSS
- Zustand (state)
- TypeScript

## Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

---

Built for the Beanbags dynasty 🏈

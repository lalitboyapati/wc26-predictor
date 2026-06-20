# ⚽ WC26 Predictor

A data-driven **World Cup 2026 predictor and analytics app**. Browse the tournament schedule, open any match to see win/draw/loss probabilities, a starting-lineup pitch with clickable player cards, AI-generated betting suggestions, projected group tables, and a full knockout bracket with a predicted champion.

Everything is computed in the browser from static data — **no backend required**.

> **Note:** The 2026 World Cup hasn't been played yet, so every scoreline, table, and bracket result is a **model prediction**, not a real result. The app is intentionally purely predictive. (Live betting odds, when available, are pulled in real time from Polymarket's public API and otherwise fall back to the model.)

**Live demo:** _add your Vercel URL here after deploying_

---

## Features

- **🔜 Upcoming** — matches from today onward, grouped by day (Today / Tomorrow / date), each with a predicted scoreline, the favourite, and a win-probability bar.
- **📅 All Fixtures** — every group-stage fixture grouped by day, with predicted scorelines and kickoff times in US Eastern.
- **🔮 Match prediction page** — win/draw/loss probability bar, expected goals (xG), and an optional live-odds overlay from Polymarket.
- **🟢 Soccer pitch** — both starting XIs laid out in a 4-3-3, colour-coded by position. Click any player for a detail panel comparing their tournament stats to projected stats for the match, plus a suggested player prop.
- **🎯 Betting suggestions** — the top 3 bets per match (over/under, anytime goalscorer, BTTS / Asian handicap / shots) derived from team and player stats, each with a confidence ring and estimated odds.
- **📊 Group standings** — the 12 groups are reconstructed from the fixture list, then projected to final tables. Top 2 + 8 best third-placed teams qualify.
- **🏆 Knockout bracket** — seeded directly from the group qualifiers and resolved tie-by-tie through to a predicted champion.

---

## Tech stack

React + TypeScript · Vite · Tailwind CSS · React Router · Recharts. No server, no database — the app ships static JSON and does all modelling client-side.

> **Node version:** Vite is pinned to v5 for compatibility with Node 20.13. If you upgrade to Node 20.19+ / 22.12+ you can bump Vite.

---

## Getting started

```bash
npm install      # install dependencies
npm run dev      # dev server at http://localhost:5173
npm run build    # type-check + production build → dist/
npm run preview  # serve the production build locally
npm run data     # regenerate src/data/*.json from the source CSVs
```

---

## How it works

### Data pipeline

Source CSVs live in [`data-source/`](data-source) — the 2026 schedule, FIFA rankings (June 2026), and tournament player stats. [`scripts/processData.mjs`](scripts/processData.mjs) turns them into five JSON files in [`src/data/`](src/data) that the app imports directly:

| File | Contents |
|---|---|
| `matches.json` | 72 group-stage fixtures |
| `teams.json` | Per-team FIFA points (used as an ELO rating) + goal averages |
| `players.json` | 1241 players with per-90 stats and a computed form score |
| `rankings.json` | Raw FIFA ranking lookup |
| `lineups.json` | Best XI per team in a 4-3-3, ranked by starts then form |

`src/data/*.json` is **generated** — edit the script, not the JSON, then run `npm run data`.

### Models (`src/lib/`)

All modelling is in pure, deterministic functions; the React components just render their output.

- **`predictor.ts`** — `predictMatch()`: win/draw/loss % from a FIFA-points ELO logistic, goal-average attack/defence strength, and expected goals.
- **`predictedScore.ts`** — `getPredictedScore()`: a single predicted scoreline per match via a seeded Poisson draw from xG (deterministic, so every view agrees).
- **`bettingEngine.ts`** — top-3 match bets plus per-player projections and prop suggestions.
- **`groups.ts`** — reconstructs the 12 groups from the fixtures (connected components of the fixture graph) and builds the standings.
- **`bracket.ts`** — seeds the Round of 32 from the group qualifiers and resolves each tie with the prediction model.

---

## Project structure

```
worldcup-predictor/
├── data-source/              # source CSVs (schedule, rankings, players)
├── scripts/processData.mjs   # CSV → JSON pipeline
├── src/
│   ├── data/                 # generated JSON (committed)
│   ├── lib/                  # prediction + data logic
│   ├── components/           # UI components (pitch, cards, charts, bracket…)
│   ├── pages/                # Schedule, MatchDetail, Groups, Bracket
│   └── types/                # shared TypeScript types
└── vercel.json               # SPA routing rewrite for deployment
```

---

## Deployment

Deployed on **Vercel**. The included [`vercel.json`](vercel.json) rewrites all routes to `index.html` so client-side routing (`/groups`, `/bracket`, `/match/:id`) works on deep links and refreshes. Vercel auto-detects the Vite build (`npm run build`) and `dist/` output.

---

## Data sources

- FIFA world rankings (June 2026 snapshot)
- 2026 World Cup match schedule
- Tournament player statistics

Predictions are for entertainment and analysis only.

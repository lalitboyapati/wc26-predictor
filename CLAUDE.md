# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A **World Cup 2026 predictor and sports-analytics single-page app** (React + TypeScript + Vite). Users browse the fixture list, open any match to see win/draw/loss probabilities, a starting-lineup pitch with clickable player cards, AI-generated betting suggestions, and a projected knockout bracket. There is **no backend** — everything is driven by static JSON generated from CSVs plus deterministic in-browser models.

## Commands

```bash
npm install            # install deps
npm run dev            # dev server on http://localhost:5173 (HMR)
npm run build          # tsc -b && vite build → dist/
npm run preview        # serve the production build
npx tsc --noEmit       # type-check only (fast feedback, no emit)
node scripts/processData.mjs   # regenerate src/data/*.json from ../World Cup Data/*.csv
```

**Node version note:** the project is pinned to **Vite 5 / @vitejs/plugin-react 4** because the local Node is 20.13, below the 20.19+ that Vite 6+/rolldown require. Do not upgrade Vite without bumping Node, or `npm run build` fails with a `@rolldown/binding` native-module error.

## Data Pipeline (important)

The raw data lives **outside this folder** at `../World Cup Data/` (six CSVs: schedule, players, two FIFA rankings, historical matches, tournament summary). `scripts/processData.mjs` reads those CSVs and writes five JSON files into `src/data/`:

| File | Source CSV | Notes |
|---|---|---|
| `matches.json` | `schedule_2026.csv` | 72 group-stage fixtures |
| `teams.json` | derived | FIFA points (used as ELO) + goal averages per team |
| `players.json` | `players.csv` | 1241 players; per-90 stats + computed `formScore` (0–10) |
| `rankings.json` | `fifa_ranking_2026-06-08.csv` | raw ranking lookup |
| `lineups.json` | derived | best XI per team in a 4-3-3, sorted by starts then form |

`src/data/*.json` is **generated** — edit the script, not the JSON. Re-run the script after changing CSVs or the derivation logic.

## Architecture

Pure functions in `src/lib/` hold all the modelling; React components are presentational and call them via `useMemo`.

- **`lib/predictor.ts`** — `predictMatch(home, away)`: deterministic win/draw/loss % from FIFA-points ELO logistic + goal-average attack/defence + xG. No randomness.
- **`lib/bettingEngine.ts`** — `generateBettingSuggestions(...)` (top-3 match bets via a decision tree) and `projectPlayerStats(player)` (per-player projection + a position-specific prop).
- **`lib/liveScores.ts`** — **simulated** live scores driven by a *moving tournament clock* (`simNow()`): a match is `upcoming` before its kickoff, `live` (ticking minute + score) during a 110-min window, then `finished`. The clock starts at the first kickoff and runs at `SIM_SPEED`× real time, so matches go live/finish over a session and the Live tab reflects only what's currently ongoing. Scorelines are seeded Poisson draws from predicted xG — deterministic per match. `getFinalScore()` returns the settled 90' score (used by AI-Predicted views); `getLiveScore()` returns the clock-aware state. Single source of truth for scores across schedule, detail, groups, and bracket.
- **`lib/bracket.ts`** — `buildBracket()`: seeds the top-32 ranked teams and resolves every tie with `predictMatch` so the bracket fills in round by round to a projected champion.
- **`lib/polymarket.ts`** — best-effort fetch of real win odds from Polymarket's public Gamma API (`gamma-api.polymarket.com`, no key). Falls back to `{ source: 'none' }` on any error/CORS; the UI then shows the AI model instead.
- **`lib/dataHelpers.ts`** — typed accessors over the JSON + the 4-3-3 pitch coordinate tables (`getLineup` assigns `pitchX/pitchY` per side).

**Routing** (`App.tsx`, React Router v6): `/` list → `/match/:id` detail, plus `/groups` and `/bracket`.

**Predicted vs Actual modes:** the Groups and Bracket pages have a `ModeToggle` (`ViewMode = 'predicted' | 'actual'`):
- **Predicted** — `deriveGroups(true)` (all 6 group games settled via `getFinalScore`) + `buildBracket(qualifiers, true)` → full tables, resolved knockouts, predicted champion.
- **Actual** — `deriveGroups(false)` (only matches the clock has reached count) + `buildBracket(qualifiers, false)` (knockouts left TBD) → the live current state. These pages poll a `tick` every ~2.5 s while in Actual mode so they track `simNow()`.

**Live data flow:** `hooks/useLiveScores.ts` polls `getLiveScore` on an interval and returns a `matchId → LiveScore` map; `MatchListPage` and `MatchDetailPage` subscribe so scores tick without a backend.

## Conventions & Gotchas

- **Flags:** always render country flags via `components/Flag.tsx`, never a raw `<img>`. Many team names don't resolve to a FIFA code (so `flagCode` is `''`); `Flag` shows a text placeholder instead, which avoids React's empty-`src` warning.
- **Team-name matching is fuzzy.** Player CSV team names and FIFA-ranking names don't always align; `processData.mjs` has an `alternates` map + substring fallback. Unmatched teams get a default rank 80 / 1300 points — extend the map rather than hard-coding.
- **Determinism is intentional.** Predictions, projections, bracket, and simulated scores must stay deterministic so the same match always shows the same numbers everywhere. Seed any new randomness from a stable key (see `seededRandom` in `liveScores.ts`).
- **Dark mode is hardcoded** via `class="dark"` on `<html>` and `darkMode: 'class'` in `tailwind.config.js`. The theme is a violet→fuchsia→rose World Cup palette; the global background gradient lives in `src/index.css`.

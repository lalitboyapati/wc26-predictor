import type { Team, MatchPrediction } from '../types';

const LEAGUE_AVG = 1.1; // avg goals/game in international football
const HOME_ADV   = 1.05; // very slight boost (neutral venues mostly)

/**
 * Deterministic match prediction using FIFA points as ELO, team goal averages,
 * and form derived from tournament performance so far.
 */
export function predictMatch(home: Team, away: Team): MatchPrediction {
  // ── Step 1: FIFA points gap (used as ELO) ─────────────────────────────────
  const eloDiff   = (home.points || 1400) - (away.points || 1400);
  const eloHomeWin = 1 / (1 + Math.pow(10, -eloDiff / 400));

  // ── Step 2: Attack / defence strength ─────────────────────────────────────
  const homeAvgScored    = Math.max(home.avgGoalsScored, 0.5);
  const awayAvgScored    = Math.max(away.avgGoalsScored, 0.5);
  const homeAttack  = homeAvgScored / LEAGUE_AVG;
  const awayAttack  = awayAvgScored / LEAGUE_AVG;

  // Defensive estimate: invert relative to league average (use 1.0 as baseline)
  const homeDefense = LEAGUE_AVG / Math.max(awayAvgScored, 0.5);
  const awayDefense = LEAGUE_AVG / Math.max(homeAvgScored, 0.5);

  // ── Step 3: Expected goals ─────────────────────────────────────────────────
  const xGHome = Math.max(0.3, homeAttack * awayDefense * LEAGUE_AVG * HOME_ADV);
  const xGAway = Math.max(0.3, awayAttack * homeDefense * LEAGUE_AVG);

  // ── Step 4: Composite home strength (weighted) ─────────────────────────────
  const xGRatio = xGHome / (xGHome + xGAway);
  const homeStrength =
    0.55 * eloHomeWin +
    0.25 * xGRatio +
    0.20 * (homeAttack / (homeAttack + awayAttack));

  // ── Step 5: Draw probability ───────────────────────────────────────────────
  const drawBase    = 0.26;
  const eloPenalty  = Math.min(Math.abs(eloDiff) / 800, 0.12);
  const drawProb    = Math.max(drawBase - eloPenalty, 0.10);

  // ── Step 6: Normalise ──────────────────────────────────────────────────────
  const rawHome  = homeStrength * (1 - drawProb);
  const rawAway  = (1 - homeStrength) * (1 - drawProb);
  const total    = rawHome + drawProb + rawAway;

  const homeWin  = Math.round((rawHome  / total) * 100);
  const draw     = Math.round((drawProb / total) * 100);
  const awayWin  = 100 - homeWin - draw;

  // ── Step 7: Confidence ────────────────────────────────────────────────────
  const confidence: MatchPrediction['confidence'] =
    Math.abs(eloDiff) > 150 ? 'high' :
    Math.abs(eloDiff) > 60  ? 'medium' : 'low';

  return {
    homeWin: Math.max(5, homeWin),
    draw:    Math.max(5, draw),
    awayWin: Math.max(5, awayWin),
    xGHome:  Math.round(xGHome * 100) / 100,
    xGAway:  Math.round(xGAway * 100) / 100,
    confidence,
  };
}

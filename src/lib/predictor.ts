import type { Team, MatchPrediction } from '../types';

const LEAGUE_AVG = 1.25; // baseline goals per team per game
const HOME_ADV   = 1.06; // small boost for the nominal home side

// Normalise FIFA points across the field → 0 (weakest) .. 1 (elite).
function strength(points: number): number {
  const n = (Math.max(points, 1000) - 1250) / (1900 - 1250);
  return Math.min(1, Math.max(0, n));
}

// Attacking multiplier (~0.75 weak .. ~1.5 elite), nudged by goals actually
// scored so far. Points dominate because the tournament goal sample is tiny.
function attackRating(team: Team): number {
  const s = strength(team.points);
  const base = 0.75 + s * 0.75;
  const goalSignal = 0.6 + Math.min(team.avgGoalsScored / 2, 1.2) * 0.7;
  return 0.7 * base + 0.3 * goalSignal;
}

// Defensive multiplier applied to the opponent's xG (~1.35 leaky .. ~0.73 stingy).
function concedeRating(team: Team): number {
  return 1.35 - strength(team.points) * 0.62;
}

/**
 * Deterministic match prediction. Win/draw/loss probabilities come from a
 * FIFA-points ELO logistic; expected goals come from each side's attack rating
 * against the other side's defensive rating (so xG genuinely varies per matchup).
 */
export function predictMatch(home: Team, away: Team): MatchPrediction {
  // ── ELO from FIFA points ──────────────────────────────────────────────────
  const eloDiff = (home.points || 1400) - (away.points || 1400);
  const eloHomeWin = 1 / (1 + Math.pow(10, -eloDiff / 400));

  // ── Expected goals: attack vs opposing defence ────────────────────────────
  const xGHome = Math.max(0.25, LEAGUE_AVG * attackRating(home) * concedeRating(away) * HOME_ADV);
  const xGAway = Math.max(0.25, LEAGUE_AVG * attackRating(away) * concedeRating(home));

  // ── Composite home strength ───────────────────────────────────────────────
  const xGRatio = xGHome / (xGHome + xGAway);
  const homeStrength = 0.6 * eloHomeWin + 0.4 * xGRatio;

  // ── Draw probability (shrinks as the gap widens) ──────────────────────────
  const drawBase = 0.27;
  const eloPenalty = Math.min(Math.abs(eloDiff) / 800, 0.13);
  const drawProb = Math.max(drawBase - eloPenalty, 0.10);

  // ── Normalise to 100% ─────────────────────────────────────────────────────
  const rawHome = homeStrength * (1 - drawProb);
  const rawAway = (1 - homeStrength) * (1 - drawProb);
  const total = rawHome + drawProb + rawAway;

  const homeWin = Math.round((rawHome / total) * 100);
  const draw = Math.round((drawProb / total) * 100);
  const awayWin = 100 - homeWin - draw;

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

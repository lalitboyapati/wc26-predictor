import type { Match } from '../types';
import { getTeam } from './dataHelpers';
import { predictMatch } from './predictor';

/**
 * A single deterministic *predicted* scoreline per match, derived from each
 * side's expected goals (seeded Poisson draw). This is a model prediction —
 * the World Cup hasn't been played — and is the shared source of truth for the
 * predicted group tables and bracket so every view agrees.
 */

function seededRandom(seed: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/** Seeded Poisson sample (inverse-CDF) — realistic football scorelines from xG. */
function poissonSample(lambda: number, u: number): number {
  let p = Math.exp(-lambda);
  let cum = p;
  let k = 0;
  while (u > cum && k < 8) {
    k++;
    p *= lambda / k;
    cum += p;
  }
  return k;
}

export function getPredictedScore(match: Match): { homeGoals: number; awayGoals: number } {
  const home = getTeam(match.homeTeam);
  const away = getTeam(match.awayTeam);
  if (!home || !away) return { homeGoals: 0, awayGoals: 0 };

  const pred = predictMatch(home, away);
  return {
    homeGoals: poissonSample(pred.xGHome, seededRandom(match.id, 1)),
    awayGoals: poissonSample(pred.xGAway, seededRandom(match.id, 2)),
  };
}

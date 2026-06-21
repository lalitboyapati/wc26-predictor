import type { Match } from '../types';
import { getTeam } from './dataHelpers';
import { predictMatch } from './predictor';

/**
 * The single predicted scoreline for a match.
 *
 * It is the *most likely exact scoreline that matches the model's most likely
 * outcome* (home win / draw / away win). Deriving it from the same prediction
 * guarantees the score can never contradict the win-probability bar or the
 * "team to win" betting pick (e.g. it will never show the 65% favourite losing).
 * Used everywhere — schedule cards, match detail, group standings.
 */
function poissonPmf(lambda: number, max = 8): number[] {
  const out: number[] = [];
  let p = Math.exp(-lambda);
  for (let k = 0; k <= max; k++) {
    out[k] = p;
    p *= lambda / (k + 1);
  }
  return out;
}

export function getPredictedScore(match: Match): { homeGoals: number; awayGoals: number } {
  const home = getTeam(match.homeTeam);
  const away = getTeam(match.awayTeam);
  if (!home || !away) return { homeGoals: 0, awayGoals: 0 };

  const pred = predictMatch(home, away);
  const ph = poissonPmf(pred.xGHome);
  const pa = poissonPmf(pred.xGAway);

  // Most likely outcome from the model.
  const outcome =
    pred.homeWin >= pred.draw && pred.homeWin >= pred.awayWin ? 'home' :
    pred.awayWin >= pred.draw && pred.awayWin >= pred.homeWin ? 'away' : 'draw';

  // Highest-probability scoreline consistent with that outcome.
  let best = { h: outcome === 'away' ? 0 : 1, a: outcome === 'home' ? 0 : 1, p: -1 };
  for (let h = 0; h < ph.length; h++) {
    for (let a = 0; a < pa.length; a++) {
      const matches =
        outcome === 'home' ? h > a :
        outcome === 'away' ? a > h : h === a;
      if (!matches) continue;
      const p = ph[h] * pa[a];
      if (p > best.p) best = { h, a, p };
    }
  }

  return { homeGoals: best.h, awayGoals: best.a };
}

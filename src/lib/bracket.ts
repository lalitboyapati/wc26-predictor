import { allTeams } from './dataHelpers';
import { predictMatch } from './predictor';

export interface BracketTeam {
  name: string;
  flagCode: string;
  seed: number;
}

export interface BracketMatch {
  id: string;
  round: number;            // 0 = Round of 32, ... last = Final
  home: BracketTeam | null;
  away: BracketTeam | null;
  homeGoals: number | null;
  awayGoals: number | null;
  winner: 'home' | 'away' | null;
  winProbHome: number;      // model probability for the favourite side
}

export interface BracketRound {
  name: string;
  matches: BracketMatch[];
}

const ROUND_NAMES = ['Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'];

/**
 * Builds a projected knockout bracket from the 32 highest-ranked participating
 * teams. Each tie is resolved by the prediction model (the side with the higher
 * win probability advances), so the whole bracket is a model projection that
 * "fills in" round by round.
 */
export function buildBracket(qualifiers?: BracketTeam[], resolve = true): BracketRound[] {
  // Use group qualifiers if provided, else fall back to top 32 by FIFA points
  const seeded: BracketTeam[] = (qualifiers && qualifiers.length >= 2)
    ? qualifiers
    : Object.values(allTeams)
        .filter(t => t.points > 0)
        .sort((a, b) => b.points - a.points)
        .slice(0, 32)
        .map((t, i) => ({ name: t.name, flagCode: t.flagCode, seed: i + 1 }));

  // Standard 1-v-32 bracket seeding
  const order = seedOrder(32);
  const firstRound: BracketMatch[] = [];
  for (let i = 0; i < order.length; i += 2) {
    const home = seeded[order[i] - 1] ?? null;
    const away = seeded[order[i + 1] - 1] ?? null;
    firstRound.push(makeMatch(`r0-m${i / 2}`, 0, home, away));
  }

  const rounds: BracketRound[] = [{ name: ROUND_NAMES[0], matches: firstRound }];

  // Build subsequent rounds. When `resolve` is false (Actual mode) the knockout
  // games haven't been played, so winners stay null and later rounds show TBD.
  for (let r = 0; r < ROUND_NAMES.length - 1; r++) {
    const current = rounds[r].matches;
    const winners = current.map(m => (resolve ? resolveMatch(m) : null));
    const nextMatches: BracketMatch[] = [];
    for (let i = 0; i < winners.length; i += 2) {
      nextMatches.push(makeMatch(`r${r + 1}-m${i / 2}`, r + 1, winners[i], winners[i + 1]));
    }
    if (nextMatches.length > 0) {
      rounds.push({ name: ROUND_NAMES[r + 1], matches: nextMatches });
    }
  }

  // Resolve the final so a champion shows (predicted mode only)
  if (resolve) {
    const final = rounds[rounds.length - 1].matches[0];
    if (final) resolveMatch(final);
  }

  return rounds;
}

function makeMatch(
  id: string,
  round: number,
  home: BracketTeam | null,
  away: BracketTeam | null
): BracketMatch {
  return {
    id, round, home, away,
    homeGoals: null, awayGoals: null, winner: null, winProbHome: 50,
  };
}

/** Resolve a tie via the prediction model; mutates + returns the winning team. */
function resolveMatch(m: BracketMatch): BracketTeam | null {
  if (!m.home || !m.away) {
    m.winner = m.home ? 'home' : m.away ? 'away' : null;
    return m.home ?? m.away ?? null;
  }
  const homeTeam = allTeams[m.home.name];
  const awayTeam = allTeams[m.away.name];
  if (!homeTeam || !awayTeam) return m.home;

  const pred = predictMatch(homeTeam, awayTeam);
  // Two-way: drop the draw and renormalise
  const homeShare = pred.homeWin / (pred.homeWin + pred.awayWin);
  m.winProbHome = Math.round(homeShare * 100);

  const homeWins = homeShare >= 0.5;
  m.winner = homeWins ? 'home' : 'away';
  // Simple projected scoreline from xG
  m.homeGoals = Math.max(0, Math.round(pred.xGHome));
  m.awayGoals = Math.max(0, Math.round(pred.xGAway));
  // Guarantee a decisive result (knockout)
  if (m.homeGoals === m.awayGoals) {
    if (homeWins) m.homeGoals += 1; else m.awayGoals += 1;
  }
  return homeWins ? m.home : m.away;
}

/** Standard tournament seed pairing order for a bracket of `n` (power of two). */
function seedOrder(n: number): number[] {
  let rounds = [1, 2];
  while (rounds.length < n) {
    const next: number[] = [];
    const sum = rounds.length * 2 + 1;
    for (const s of rounds) {
      next.push(s);
      next.push(sum - s);
    }
    rounds = next;
  }
  return rounds;
}

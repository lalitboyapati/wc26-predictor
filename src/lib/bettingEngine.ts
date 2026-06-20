import type { Player, Team, MatchPrediction, BettingSuggestion, PlayerProjection, BetType } from '../types';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// Convert a hit probability into a plausible bookmaker decimal price (with margin).
const MARGIN = 0.94;
function toOdds(p: number): string {
  const o = Math.max(1.04, (1 / clamp(p, 0.02, 0.98)) * MARGIN);
  return `~${o.toFixed(2)}`;
}

function mk(type: BetType, label: string, prob: number, rationale: string): BettingSuggestion {
  return {
    type,
    label,
    confidence: Math.round(clamp(prob, 0.02, 0.98) * 100),
    oddsEstimate: toOdds(prob),
    rationale,
  };
}

// ── Poisson goal model ──────────────────────────────────────────────────────
function poissonPmf(lambda: number, max = 8): number[] {
  const out: number[] = [];
  let p = Math.exp(-lambda);
  for (let k = 0; k <= max; k++) {
    out[k] = p;
    p *= lambda / (k + 1);
  }
  return out;
}

interface Markets {
  over25: number; over35: number; over15: number;
  bttsYes: number;
  homeBy2: number; awayBy2: number;
}

/** Exact market probabilities from the independent-Poisson goal matrix. */
function computeMarkets(xgH: number, xgA: number): Markets {
  const ph = poissonPmf(xgH);
  const pa = poissonPmf(xgA);
  let over15 = 0, over25 = 0, over35 = 0, bttsYes = 0, homeBy2 = 0, awayBy2 = 0;
  for (let h = 0; h < ph.length; h++) {
    for (let a = 0; a < pa.length; a++) {
      const pr = ph[h] * pa[a];
      if (!pr) continue;
      if (h + a > 1) over15 += pr;
      if (h + a > 2) over25 += pr;
      if (h + a > 3) over35 += pr;
      if (h >= 1 && a >= 1) bttsYes += pr;
      if (h - a >= 2) homeBy2 += pr;
      if (a - h >= 2) awayBy2 += pr;
    }
  }
  return { over15, over25, over35, bttsYes, homeBy2, awayBy2 };
}

/**
 * Three distinct, game-specific betting suggestions:
 *   1. an outcome bet (result / handicap / double chance),
 *   2. a goals or BTTS bet,
 *   3. a player prop.
 * Every probability is derived from this match's xG and lineup, so picks differ
 * from game to game.
 */
export function generateBettingSuggestions(
  home: Team,
  away: Team,
  homePlayers: Player[],
  awayPlayers: Player[],
  prediction: MatchPrediction
): BettingSuggestion[] {
  const m = computeMarkets(prediction.xGHome, prediction.xGAway);
  const totalXG = prediction.xGHome + prediction.xGAway;
  const favHome = prediction.homeWin >= prediction.awayWin;
  const fav = favHome ? home : away;
  const dog = favHome ? away : home;
  const favWin = favHome ? prediction.homeWin : prediction.awayWin;
  const favBy2 = favHome ? m.homeBy2 : m.awayBy2;

  return [
    outcomePick(fav, dog, favWin, prediction.draw, favBy2),
    goalsPick(home, away, m, totalXG, prediction),
    playerPick(homePlayers, awayPlayers, prediction),
  ];
}

function outcomePick(
  fav: Team, dog: Team, favWin: number, draw: number, favBy2: number
): BettingSuggestion {
  const favP = favWin / 100;

  if (favWin >= 66 && favBy2 >= 0.42) {
    return mk('asian-handicap', `${fav.name} -1.5`, favBy2,
      `${fav.name} are heavy favourites (${favWin}% to win). The model gives a ${(favBy2 * 100).toFixed(0)}% chance of a 2+ goal winning margin.`);
  }
  if (favWin >= 52) {
    return mk('match-result', `${fav.name} to Win`, favP,
      `${fav.name} (#${fav.rank}) are favoured over ${dog.name} (#${dog.rank}) — ${favWin}% model win probability.`);
  }
  const dc = clamp((favWin + draw) / 100, 0.3, 0.92);
  return mk('double-chance', `${fav.name} or Draw`, dc,
    `Tight matchup — ${fav.name} only ${favWin}% to win outright, but ${(dc * 100).toFixed(0)}% to avoid defeat (double chance).`);
}

function goalsPick(
  home: Team, away: Team, m: Markets, totalXG: number, prediction: MatchPrediction
): BettingSuggestion {
  const cands: BettingSuggestion[] = [];

  if (m.over25 >= 0.5) {
    cands.push(mk('over-under', 'Over 2.5 Goals', m.over25,
      `High-scoring projection — combined xG ${totalXG.toFixed(2)} (${home.name} ${prediction.xGHome}, ${away.name} ${prediction.xGAway}).`));
  } else {
    cands.push(mk('over-under', 'Under 2.5 Goals', 1 - m.over25,
      `Low-scoring projection — combined xG only ${totalXG.toFixed(2)}.`));
  }
  if (m.over35 >= 0.5) {
    cands.push(mk('over-under', 'Over 3.5 Goals', m.over35,
      `Goal-heavy matchup — combined xG ${totalXG.toFixed(2)} points to four or more goals.`));
  }
  if (1 - m.over15 >= 0.4) {
    cands.push(mk('over-under', 'Under 1.5 Goals', 1 - m.over15,
      `Tight, defensive projection — combined xG only ${totalXG.toFixed(2)}.`));
  }
  if (m.bttsYes >= 0.5) {
    cands.push(mk('btts', 'Both Teams to Score', m.bttsYes,
      `Both sides project to find the net — ${home.name} xG ${prediction.xGHome}, ${away.name} xG ${prediction.xGAway}.`));
  } else {
    cands.push(mk('btts', 'Both Teams to Score: No', 1 - m.bttsYes,
      `A clean sheet is on the cards — one side projects under 1.0 xG.`));
  }

  cands.sort((a, b) => b.confidence - a.confidence);
  return cands[0];
}

function playerPick(
  homePlayers: Player[], awayPlayers: Player[], prediction: MatchPrediction
): BettingSuggestion {
  const pool = [
    ...homePlayers.map(p => ({ p, teamXG: prediction.xGHome })),
    ...awayPlayers.map(p => ({ p, teamXG: prediction.xGAway })),
  ].filter(x => x.p.position === 'FW' || x.p.position === 'MF');

  if (pool.length === 0) {
    return mk('anytime-goalscorer', 'Anytime Goalscorer', 0.3, 'Limited player data for this fixture.');
  }

  // Standout attacker by goal threat + form
  const ranked = [...pool].sort((a, b) => threat(b.p) - threat(a.p));
  const best = ranked[0];
  const p = best.p;

  const lambdaG = Math.max(p.goalsP90, 0.05) * (best.teamXG / 1.25);
  const pScore = clamp(1 - Math.exp(-lambdaG), 0.12, 0.62);

  if (pScore >= 0.3) {
    return mk('anytime-goalscorer', `${p.name} to Score Anytime`, pScore,
      `${p.name} (${p.club || p.team}) is the pick of the attack: ${p.goalsP90.toFixed(2)} goals/90, ${p.shotsOTP90.toFixed(1)} shots on target/90, form ${p.formScore}/10.`);
  }

  // Otherwise the most active shooter → shots-on-target prop
  const shooter = [...pool].sort((a, b) => b.p.shotsOTP90 - a.p.shotsOTP90)[0];
  const s = shooter.p;
  const lamSot = Math.max(s.shotsOTP90, 0.1) * (shooter.teamXG / 1.25);
  const p1 = 1 - poissonPmf(lamSot)[0];
  return mk('player-shots', `${s.name}: 1+ Shot on Target`, clamp(p1, 0.3, 0.8),
    `${s.name} averages ${s.shotsOTP90.toFixed(1)} shots on target/90 — the most active shooter in this matchup.`);
}

function threat(p: Player): number {
  return p.goalsP90 * 1.5 + p.formScore * 0.12 + p.shotsOTP90 * 0.3 + (p.goals > 0 ? 0.4 : 0);
}

/** Per-player projection for a match (used by the player detail panel). */
export function projectPlayerStats(player: Player, expectedMinutes = 90): PlayerProjection {
  const scale = expectedMinutes / 90;

  const projectedGoals   = Math.round(player.goalsP90   * scale * 100) / 100;
  const projectedAssists = Math.round(player.assistsP90 * scale * 100) / 100;
  const projectedShots   = Math.round(player.shotsP90   * scale * 10) / 10;
  const projectedShotsOT = Math.round(player.shotsOTP90 * scale * 10) / 10;
  const projectedMinutes = Math.min(expectedMinutes, player.starts > 0 ? 90 : 45);

  let propSuggestion: BettingSuggestion;

  if (player.position === 'GK') {
    const p = clamp(player.gkSavePct / 140 + 0.35, 0.4, 0.82);
    propSuggestion = mk('player-shots', `${player.name}: 2+ Saves`, p,
      `${player.name} has a ${player.gkSavePct.toFixed(0)}% save rate (${player.gkSaves} saves in ${player.games} game${player.games !== 1 ? 's' : ''}).`);
  } else if (player.position === 'FW') {
    const p = clamp(1 - Math.exp(-(Math.max(player.goalsP90, 0.08) + player.shotsOTP90 * 0.12)), 0.2, 0.65);
    propSuggestion = mk('anytime-goalscorer', `${player.name}: Anytime Scorer`, p,
      `${player.goalsP90.toFixed(2)} goals/90 with ${player.shotsOTP90.toFixed(1)} shots on target per game. Form score ${player.formScore}/10.`);
  } else if (player.position === 'MF') {
    const p = clamp(0.3 + player.assistsP90 * 0.35 + player.shotsOTP90 * 0.06, 0.28, 0.62);
    propSuggestion = mk('player-shots', `${player.name}: 1+ Shot on Target`, p,
      `${player.assistsP90.toFixed(2)} assists/90 with ${player.shotsOTP90.toFixed(1)} shots on target per game — a creative outlet.`);
  } else {
    const p = clamp(0.4 + (player.interceptions + player.tacklesWon) / Math.max(player.games, 1) * 0.06, 0.4, 0.75);
    propSuggestion = mk('player-shots', `${player.name}: 1+ Tackle / Interception`, p,
      `${player.tacklesWon} tackles won and ${player.interceptions} interceptions in ${player.games} game${player.games !== 1 ? 's' : ''}.`);
  }

  return { projectedGoals, projectedAssists, projectedShots, projectedShotsOT, projectedMinutes, propSuggestion };
}

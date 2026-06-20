import type { Player, Team, MatchPrediction, BettingSuggestion, PlayerProjection } from '../types';

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** Top-3 betting suggestions for a match */
export function generateBettingSuggestions(
  home: Team,
  away: Team,
  homePlayers: Player[],
  awayPlayers: Player[],
  prediction: MatchPrediction
): BettingSuggestion[] {
  const suggestions: BettingSuggestion[] = [];
  const totalXG = prediction.xGHome + prediction.xGAway;

  // ── Pick 1: Over / Under 2.5 ──────────────────────────────────────────────
  const overUnder = generateOverUnder(home, away, totalXG);
  suggestions.push(overUnder);

  // ── Pick 2: Anytime goalscorer ────────────────────────────────────────────
  const scorer = generateAnytimeScorer([...homePlayers, ...awayPlayers]);
  if (scorer) suggestions.push(scorer);

  // ── Pick 3: Decision tree ─────────────────────────────────────────────────
  const third = generateThirdPick(home, away, homePlayers, awayPlayers, prediction, totalXG);
  suggestions.push(third);

  return suggestions.slice(0, 3);
}

function generateOverUnder(home: Team, away: Team, totalXG: number): BettingSuggestion {
  if (totalXG >= 2.6) {
    const conf = clamp(50 + (totalXG - 2.5) * 35, 52, 88);
    return {
      type: 'over-under',
      label: 'Over 2.5 Goals',
      rationale: `Combined xG of ${totalXG.toFixed(1)} goals. ${home.name} avg ${home.avgGoalsScored.toFixed(1)} scored, ${away.name} avg ${away.avgGoalsScored.toFixed(1)} scored per game.`,
      confidence: Math.round(conf),
      oddsEstimate: totalXG >= 3.1 ? '~1.72' : '~1.85',
    };
  } else {
    const conf = clamp(50 + (2.5 - totalXG) * 35, 52, 88);
    return {
      type: 'over-under',
      label: 'Under 2.5 Goals',
      rationale: `Combined xG of only ${totalXG.toFixed(1)} goals. Defensive matchup — ${home.name} (#${home.rank}) and ${away.name} (#${away.rank}) both ranked highly.`,
      confidence: Math.round(conf),
      oddsEstimate: totalXG <= 1.9 ? '~1.78' : '~1.92',
    };
  }
}

function generateAnytimeScorer(allPlayers: Player[]): BettingSuggestion | null {
  const attackers = allPlayers.filter(
    p => (p.position === 'FW' || p.position === 'MF') && !p.id.includes('unused')
  );
  if (attackers.length === 0) return null;

  const scored = attackers.map(p => ({
    player: p,
    score: p.formScore * 0.5 + p.shotsOTP90 * 0.3 + p.goalsP90 * 1.5 + (p.goals > 0 ? 1.5 : 0),
  }));
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  const p = best.player;

  const conf = clamp(45 + best.score * 2.5, 48, 78);
  const odds = conf >= 65 ? '~2.50' : conf >= 55 ? '~3.20' : '~4.00';

  return {
    type: 'anytime-goalscorer',
    label: `Anytime Goalscorer: ${p.name}`,
    rationale: `${p.name} (${p.club || p.team}): ${p.goals} goal${p.goals !== 1 ? 's' : ''} in ${p.games} game${p.games !== 1 ? 's' : ''} at this tournament. ${p.shotsOTP90.toFixed(1)} shots on target/90 min. Form score ${p.formScore}/10.`,
    confidence: Math.round(conf),
    oddsEstimate: odds,
  };
}

function generateThirdPick(
  home: Team,
  away: Team,
  homePlayers: Player[],
  awayPlayers: Player[],
  prediction: MatchPrediction,
  totalXG: number
): BettingSuggestion {
  const maxWin = Math.max(prediction.homeWin, prediction.awayWin);
  const favourite = prediction.homeWin >= prediction.awayWin ? home : away;

  if (maxWin >= 60) {
    const handicap = maxWin >= 70 ? '-1' : '-0.5';
    const conf = clamp(maxWin - 10, 50, 78);
    const eloDiff = Math.abs(home.points - away.points);
    return {
      type: 'asian-handicap',
      label: `${favourite.name} ${handicap} Asian Handicap`,
      rationale: `FIFA points gap of ${Math.round(eloDiff)} and ${maxWin}% win probability suggests ${favourite.name} covers the ${handicap} handicap comfortably.`,
      confidence: Math.round(conf),
      oddsEstimate: handicap === '-1' ? '~1.90' : '~1.82',
    };
  }

  const bothScore =
    home.avgGoalsScored >= 1.1 && away.avgGoalsScored >= 1.0 && totalXG >= 2.2;
  if (bothScore) {
    const bttsConf = clamp((home.avgGoalsScored + away.avgGoalsScored - 2.0) * 22 + 52, 50, 78);
    return {
      type: 'btts',
      label: 'Both Teams to Score (BTTS)',
      rationale: `${home.name} avg ${home.avgGoalsScored.toFixed(1)} goals scored, ${away.name} avg ${away.avgGoalsScored.toFixed(1)} — both teams have the firepower to get on the scoresheet.`,
      confidence: Math.round(bttsConf),
      oddsEstimate: '~1.75',
    };
  }

  // Fallback: top attacker shots prop
  const allPlayers = [...homePlayers, ...awayPlayers];
  const attackers = allPlayers.filter(p => p.position === 'FW' || p.position === 'MF');
  attackers.sort((a, b) => b.shotsP90 - a.shotsP90);
  const shotPick = attackers[0];
  if (shotPick) {
    const conf = clamp(shotPick.shotsP90 * 15 + 38, 44, 72);
    return {
      type: 'player-shots',
      label: `${shotPick.name}: 2+ Shots on Target`,
      rationale: `${shotPick.name} averages ${shotPick.shotsP90.toFixed(1)} shots per 90 min at this tournament. Likely to be heavily involved in attack.`,
      confidence: Math.round(conf),
      oddsEstimate: '~2.10',
    };
  }

  return {
    type: 'btts',
    label: 'Both Teams to Score',
    rationale: 'Competitive match expected with both sides looking to win.',
    confidence: 55,
    oddsEstimate: '~1.80',
  };
}

/** Per-player projection for a match */
export function projectPlayerStats(player: Player, expectedMinutes = 90): PlayerProjection {
  const scale = expectedMinutes / 90;

  const projectedGoals    = Math.round(player.goalsP90   * scale * 100) / 100;
  const projectedAssists  = Math.round(player.assistsP90 * scale * 100) / 100;
  const projectedShots    = Math.round(player.shotsP90   * scale * 10) / 10;
  const projectedShotsOT  = Math.round(player.shotsOTP90 * scale * 10) / 10;
  const projectedMinutes  = Math.min(expectedMinutes, player.starts > 0 ? 90 : 45);

  // Player-specific prop
  let propSuggestion: BettingSuggestion;

  if (player.position === 'GK') {
    const conf = clamp(player.gkSavePct / 2 + 30, 40, 72);
    propSuggestion = {
      type: 'player-shots',
      label: `${player.name}: 2+ Saves`,
      rationale: `${player.name} has a ${player.gkSavePct.toFixed(0)}% save rate (${player.gkSaves} saves in ${player.games} game${player.games !== 1 ? 's' : ''}).`,
      confidence: Math.round(conf),
      oddsEstimate: '~1.65',
    };
  } else if (player.position === 'FW') {
    const scorerConf = clamp(40 + player.goalsP90 * 60 + player.shotsOTP90 * 10, 35, 78);
    propSuggestion = {
      type: 'anytime-goalscorer',
      label: `${player.name}: Anytime Scorer`,
      rationale: `${player.goalsP90.toFixed(2)} goals/90 with ${player.shotsOTP90.toFixed(1)} shots on target per game. Form score ${player.formScore}/10.`,
      confidence: Math.round(scorerConf),
      oddsEstimate: scorerConf >= 60 ? '~2.50' : '~3.50',
    };
  } else if (player.position === 'MF') {
    const assistConf = clamp(38 + player.assistsP90 * 50 + player.shotsOTP90 * 8, 35, 72);
    propSuggestion = {
      type: 'player-shots',
      label: `${player.name}: 1+ Key Pass / Assist`,
      rationale: `${player.assistsP90.toFixed(2)} assists/90 with ${player.shotsOTP90.toFixed(1)} shots on target per game. Creative midfielder.`,
      confidence: Math.round(assistConf),
      oddsEstimate: '~2.20',
    };
  } else {
    const defConf = clamp(40 + (player.interceptions + player.tacklesWon) * 2, 38, 68);
    propSuggestion = {
      type: 'player-shots',
      label: `${player.name}: 1+ Tackle / Interception`,
      rationale: `${player.tacklesWon} tackles won and ${player.interceptions} interceptions in ${player.games} game${player.games !== 1 ? 's' : ''}.`,
      confidence: Math.round(defConf),
      oddsEstimate: '~1.90',
    };
  }

  return {
    projectedGoals,
    projectedAssists,
    projectedShots,
    projectedShotsOT,
    projectedMinutes,
    propSuggestion,
  };
}

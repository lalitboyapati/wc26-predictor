import type { Match } from '../types';
import { allMatches, allTeams } from './dataHelpers';
import { getPredictedScore } from './predictedScore';
import type { BracketTeam } from './bracket';

export interface GroupStanding {
  team: string;
  flagCode: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  rank: number;          // 1-based position within the group
}

export interface Group {
  label: string;         // "A" … "L"
  teams: string[];
  matches: Match[];
  standings: GroupStanding[];
}

/**
 * Reconstructs the 12 groups purely from the fixture list. In the group stage
 * each team only plays opponents from its own group, so teams connected by a
 * match form one group (connected components of the fixture graph). Standings
 * are built from each match's predicted scoreline.
 */
export function deriveGroups(): Group[] {
  const groupMatches = allMatches.filter(m => m.stage === 'group');

  // ── Build adjacency ────────────────────────────────────────────────────────
  const adj = new Map<string, Set<string>>();
  const firstSeen = new Map<string, number>();
  groupMatches.forEach((m, i) => {
    for (const t of [m.homeTeam, m.awayTeam]) {
      if (!adj.has(t)) adj.set(t, new Set());
      if (!firstSeen.has(t)) firstSeen.set(t, i);
    }
    adj.get(m.homeTeam)!.add(m.awayTeam);
    adj.get(m.awayTeam)!.add(m.homeTeam);
  });

  // ── Connected components (BFS) ─────────────────────────────────────────────
  const visited = new Set<string>();
  const components: string[][] = [];
  for (const team of adj.keys()) {
    if (visited.has(team)) continue;
    const queue = [team];
    const comp: string[] = [];
    visited.add(team);
    while (queue.length) {
      const cur = queue.shift()!;
      comp.push(cur);
      for (const n of adj.get(cur) ?? []) {
        if (!visited.has(n)) { visited.add(n); queue.push(n); }
      }
    }
    components.push(comp);
  }

  // ── Label groups by order of first appearance in the schedule ──────────────
  components.sort((a, b) => {
    const am = Math.min(...a.map(t => firstSeen.get(t) ?? 0));
    const bm = Math.min(...b.map(t => firstSeen.get(t) ?? 0));
    return am - bm;
  });

  return components.map((teams, gi) => {
    const label = String.fromCharCode(65 + gi); // A, B, C…
    const matches = groupMatches.filter(
      m => teams.includes(m.homeTeam) && teams.includes(m.awayTeam)
    );
    const standings = computeStandings(teams, matches);
    return { label, teams, matches, standings };
  });
}

function computeStandings(teams: string[], matches: Match[]): GroupStanding[] {
  const table = new Map<string, GroupStanding>();
  teams.forEach(t =>
    table.set(t, {
      team: t,
      flagCode: allTeams[t]?.flagCode ?? '',
      played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, gd: 0, points: 0, rank: 0,
    })
  );

  for (const m of matches) {
    const { homeGoals, awayGoals } = getPredictedScore(m);

    const h = table.get(m.homeTeam)!;
    const a = table.get(m.awayTeam)!;
    h.played++; a.played++;
    h.gf += homeGoals; h.ga += awayGoals;
    a.gf += awayGoals; a.ga += homeGoals;

    if (homeGoals > awayGoals) { h.win++; h.points += 3; a.loss++; }
    else if (homeGoals < awayGoals) { a.win++; a.points += 3; h.loss++; }
    else { h.draw++; a.draw++; h.points++; a.points++; }
  }

  const standings = [...table.values()];
  standings.forEach(s => { s.gd = s.gf - s.ga; });
  standings.sort(rankCompare);
  standings.forEach((s, i) => { s.rank = i + 1; });

  return standings;
}

function rankCompare(a: GroupStanding, b: GroupStanding): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return a.team.localeCompare(b.team);
}

/**
 * WC 2026 qualifiers: the winner and runner-up of each group plus the 8 best
 * third-placed teams — 32 teams, ordered best→worst so they can seed the
 * Round of 32 bracket.
 */
export function getQualifiers(groups: Group[]): BracketTeam[] {
  const winners: GroupStanding[] = [];
  const runners: GroupStanding[] = [];
  const thirds: GroupStanding[] = [];

  for (const g of groups) {
    if (g.standings[0]) winners.push(g.standings[0]);
    if (g.standings[1]) runners.push(g.standings[1]);
    if (g.standings[2]) thirds.push(g.standings[2]);
  }

  winners.sort(rankCompare);
  runners.sort(rankCompare);
  thirds.sort(rankCompare);
  const bestThirds = thirds.slice(0, 8);

  const ordered = [...winners, ...runners, ...bestThirds];
  return ordered.map((s, i) => ({
    name: s.team,
    flagCode: s.flagCode,
    seed: i + 1,
  }));
}

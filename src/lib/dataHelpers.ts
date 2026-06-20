import type { Match, Team, Player } from '../types';
import matchesRaw from '../data/matches.json';
import teamsRaw from '../data/teams.json';
import playersRaw from '../data/players.json';
import lineupsRaw from '../data/lineups.json';

export const allMatches: Match[] = matchesRaw as Match[];
export const allTeams: Record<string, Team> = teamsRaw as Record<string, Team>;
export const allPlayers: Player[] = playersRaw as Player[];
export const allLineups: Record<string, Player[]> = lineupsRaw as Record<string, Player[]>;

// Pitch positions for home (4-3-3, attacking right)
const FORMATION_HOME: [number, number][] = [
  [8,  50],  // GK
  [25, 18],  // LB
  [25, 38],  // CB-L
  [25, 62],  // CB-R
  [25, 82],  // RB
  [40, 25],  // LM
  [40, 50],  // CM
  [40, 75],  // RM
  [55, 18],  // LW
  [55, 50],  // ST
  [55, 82],  // RW
];

// Away team (attacking left, mirrored)
const FORMATION_AWAY: [number, number][] = [
  [92, 50],
  [75, 82],
  [75, 62],
  [75, 38],
  [75, 18],
  [60, 75],
  [60, 50],
  [60, 25],
  [45, 82],
  [45, 50],
  [45, 18],
];

export function getMatch(id: string): Match | undefined {
  return allMatches.find(m => m.id === id);
}

export function getTeam(name: string): Team | undefined {
  // Direct lookup
  if (allTeams[name]) return allTeams[name];
  // Fuzzy
  const lower = name.toLowerCase();
  const key = Object.keys(allTeams).find(k => k.toLowerCase() === lower);
  return key ? allTeams[key] : undefined;
}

export function getLineup(teamName: string, side: 'home' | 'away'): Player[] {
  const formation = side === 'home' ? FORMATION_HOME : FORMATION_AWAY;
  const raw = allLineups[teamName] ?? [];
  return raw.slice(0, 11).map((p, i) => ({
    ...p,
    pitchX: formation[i]?.[0] ?? 50,
    pitchY: formation[i]?.[1] ?? 50,
  }));
}

export function getPlayersByTeam(teamName: string): Player[] {
  return allPlayers.filter(p => p.team === teamName);
}

export function groupMatchesByDate(matches: Match[]): Record<string, Match[]> {
  const groups: Record<string, Match[]> = {};
  matches.forEach(m => {
    if (!groups[m.date]) groups[m.date] = [];
    groups[m.date].push(m);
  });
  return groups;
}

export function getFlagUrl(code: string, size = 40): string {
  if (!code) return '';
  return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`;
}

export function formatMatchDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// Schedule times are stored as UTC. Render kickoff in US Eastern time, e.g. "9:00 AM ET".
const ET_TIME_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export function formatMatchTimeET(match: { date: string; time: string }): string {
  const hhmm = (match.time || '12:00').split(' ')[0];
  const d = new Date(`${match.date}T${hhmm}:00Z`);
  if (isNaN(d.getTime())) return '';
  return `${ET_TIME_FMT.format(d)} ET`;
}

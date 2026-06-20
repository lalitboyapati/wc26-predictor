/**
 * Converts World Cup CSV data files into structured JSON for the app.
 * Run: node scripts/processData.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../data-source');
const OUT_DIR = resolve(__dirname, '../src/data');

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCSV(filename) {
  const raw = readFileSync(resolve(DATA_DIR, filename), 'utf-8');
  const lines = raw.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = splitCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (cols[i] ?? '').trim(); });
    return obj;
  });
}

function splitCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(cur); cur = ''; }
    else { cur += ch; }
  }
  result.push(cur);
  return result;
}

function num(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

// ── Process schedule ──────────────────────────────────────────────────────────
console.log('Processing schedule_2026.csv...');
const scheduleRaw = parseCSV('schedule_2026.csv');
const matches = scheduleRaw.map((r, i) => ({
  id: `match-${i + 1}`,
  date: r['Date'],
  time: r['Time'],
  day: r['Day'],
  homeTeam: r['home_team'],
  awayTeam: r['away_team'],
  round: r['Round'],
  stage: r['Round'] === 'Group stage' ? 'group' : 'knockout',
  score: r['Score'] || null,
  status: r['Score'] ? 'completed' : (new Date(r['Date']) <= new Date('2026-06-19') ? 'completed' : 'scheduled'),
}));
writeFileSync(`${OUT_DIR}/matches.json`, JSON.stringify(matches, null, 2));
console.log(`  → ${matches.length} matches`);

// ── Process rankings ──────────────────────────────────────────────────────────
console.log('Processing fifa_ranking_2026-06-08.csv...');
const rankingsRaw = parseCSV('fifa_ranking_2026-06-08.csv');
const rankings = {};
rankingsRaw.forEach(r => {
  rankings[r['team']] = {
    team: r['team'],
    code: r['team_code'],
    rank: parseInt(r['rank']) || 999,
    points: num(r['points']),
    prevPoints: num(r['previous_points']),
  };
});
writeFileSync(`${OUT_DIR}/rankings.json`, JSON.stringify(rankings, null, 2));
console.log(`  → ${Object.keys(rankings).length} teams`);

// ── Process players ───────────────────────────────────────────────────────────
console.log('Processing players.csv...');
const playersRaw = parseCSV('players.csv');

// Normalize position: take first token before comma
function normPos(pos) {
  if (!pos) return 'MF';
  const p = pos.split(',')[0].trim();
  if (p === 'GK') return 'GK';
  if (p === 'DF') return 'DF';
  if (p === 'MF') return 'MF';
  if (p === 'FW') return 'FW';
  return 'MF';
}

// Parse age like "27-003" → 27
function parseAge(ageStr) {
  return parseInt((ageStr || '0').split('-')[0]) || 0;
}

const players = playersRaw
  .filter(r => r['player'] && r['team'])
  .map((r, i) => {
    const games = parseInt(r['games']) || 0;
    const starts = parseInt(r['games_starts']) || 0;
    const minutes = num(r['minutes']);
    const goals = num(r['goals']);
    const assists = num(r['assists']);
    const shots = num(r['shots']);
    const shotsOnTarget = num(r['shots_on_target']);
    const yellowCards = num(r['cards_yellow']);
    const plusMinus = num(r['plus_minus']);
    const fouls = num(r['fouls']);
    const interceptions = num(r['interceptions']);
    const tacklesWon = num(r['tackles_won']);
    const crosses = num(r['crosses']);
    const offsides = num(r['offsides']);

    // GK stats
    const gkSaves = num(r['gk_saves']);
    const gkSavePct = num(r['gk_save_pct']);
    const gkCleanSheets = num(r['gk_clean_sheets']);
    const gkGoalsAgainst = num(r['gk_goals_against']);

    // Per 90 stats (if player has played time)
    const mins90 = Math.max(num(r['minutes_90s']), 0.01);
    const goalsP90 = num(r['goals_per90']) || (goals / mins90);
    const assistsP90 = num(r['assists_per90']) || (assists / mins90);
    const shotsP90 = num(r['shots_per90']) || (shots / mins90);
    const shotsOTP90 = num(r['shots_on_target_per90']) || (shotsOnTarget / mins90);

    // Compute a form score 0-10 for attackers
    const pos = normPos(r['position']);
    let formScore = 5.0;
    if (pos === 'FW') {
      formScore = Math.min(10, 3 + goalsP90 * 3 + assistsP90 * 1.5 + shotsOTP90 * 0.8 + plusMinus * 0.1);
    } else if (pos === 'MF') {
      formScore = Math.min(10, 3 + goalsP90 * 2 + assistsP90 * 2 + shotsOTP90 * 0.5 + plusMinus * 0.15);
    } else if (pos === 'DF') {
      formScore = Math.min(10, 3 + (interceptions / Math.max(games, 1)) * 0.8 + (tacklesWon / Math.max(games, 1)) * 0.5 + plusMinus * 0.2);
    } else if (pos === 'GK') {
      formScore = games > 0 ? Math.min(10, 4 + gkSavePct / 20 + gkCleanSheets * 1.5) : 5;
    }
    if (games === 0 && starts === 0) formScore = Math.max(4, formScore - 1);

    return {
      id: `player-${i}`,
      name: r['player'],
      team: r['team'],
      position: pos,
      age: parseAge(r['age']),
      club: r['club'] || '',
      games,
      starts,
      minutes,
      goals,
      assists,
      shots,
      shotsOnTarget,
      yellowCards,
      plusMinus,
      fouls,
      interceptions,
      tacklesWon,
      crosses,
      offsides,
      goalsP90: Math.round(goalsP90 * 100) / 100,
      assistsP90: Math.round(assistsP90 * 100) / 100,
      shotsP90: Math.round(shotsP90 * 100) / 100,
      shotsOTP90: Math.round(shotsOTP90 * 100) / 100,
      formScore: Math.round(formScore * 10) / 10,
      // GK only
      gkSaves,
      gkSavePct: Math.round(gkSavePct * 10) / 10,
      gkCleanSheets,
      gkGoalsAgainst,
    };
  });

writeFileSync(`${OUT_DIR}/players.json`, JSON.stringify(players, null, 2));
console.log(`  → ${players.length} players`);

// ── Build team summaries from player data ────────────────────────────────────
console.log('Building team summaries...');
const teamMap = {};
players.forEach(p => {
  if (!teamMap[p.team]) {
    teamMap[p.team] = { players: [], goals: 0, goalsAgainst: 0, games: 0 };
  }
  const t = teamMap[p.team];
  t.players.push(p);
  if (p.position !== 'GK') {
    t.goals += p.goals;
  }
  if (p.starts > t.games) t.games = p.starts;
});

// Build team name → FIFA ranking lookup with alternate name matching
function findRanking(teamName) {
  if (rankings[teamName]) return rankings[teamName];
  // Try alternate names
  const alternates = {
    'United States': 'USA',
    'Korea Republic': 'Korea Republic',
    'IR Iran': 'IR Iran',
    'Côte d\'Ivoire': "Côte d'Ivoire",
    'Bosnia-Herzegovina': 'Bosnia-Herzegovina',
    'Congo DR': 'Congo DR',
  };
  const alt = alternates[teamName];
  if (alt && rankings[alt]) return rankings[alt];
  // Fuzzy match
  const lower = teamName.toLowerCase();
  for (const [k, v] of Object.entries(rankings)) {
    if (k.toLowerCase().includes(lower) || lower.includes(k.toLowerCase())) return v;
  }
  return { rank: 80, points: 1300 };
}

// Collect unique teams from schedule
const allTeams = new Set();
matches.forEach(m => { allTeams.add(m.homeTeam); allTeams.add(m.awayTeam); });

const teams = {};
allTeams.forEach(teamName => {
  const ranking = findRanking(teamName);
  const tp = teamMap[teamName];
  const gamesPlayed = tp ? Math.max(1, tp.games) : 1;
  teams[teamName] = {
    name: teamName,
    flagCode: ranking.code || '',
    rank: ranking.rank,
    points: ranking.points,
    gamesPlayed,
    goalsScored: tp ? tp.goals : 0,
    avgGoalsScored: tp ? Math.round((tp.goals / gamesPlayed) * 100) / 100 : 1.0,
  };
});

writeFileSync(`${OUT_DIR}/teams.json`, JSON.stringify(teams, null, 2));
console.log(`  → ${Object.keys(teams).length} team summaries`);

// ── Build expected lineups (starters + best squad members per position) ──────
console.log('Building expected lineups...');

const lineupMap = {};

allTeams.forEach(teamName => {
  const squad = players.filter(p => p.team === teamName);
  if (squad.length === 0) return;

  // Separate by position
  const byPos = { GK: [], DF: [], MF: [], FW: [] };
  squad.forEach(p => {
    const pos = p.position;
    if (byPos[pos]) byPos[pos].push(p);
  });

  // Sort each group: starters first (starts > 0), then by formScore
  const sort = (arr) => [...arr].sort((a, b) => {
    if (b.starts !== a.starts) return b.starts - a.starts;
    return b.formScore - a.formScore;
  });

  // Pick 11 in a 4-3-3 shape
  const gks  = sort(byPos.GK).slice(0, 1);
  const defs = sort(byPos.DF).slice(0, 4);
  const mids = sort(byPos.MF).slice(0, 3);
  const fwds = sort(byPos.FW).slice(0, 3);

  // Pad if not enough in a position
  const allOutfield = sort([...byPos.DF, ...byPos.MF, ...byPos.FW]);
  let lineup = [...gks, ...defs, ...mids, ...fwds];
  if (lineup.length < 11) {
    const usedIds = new Set(lineup.map(p => p.id));
    const extras = allOutfield.filter(p => !usedIds.has(p.id));
    lineup = [...lineup, ...extras].slice(0, 11);
  }

  // Assign formation positions (4-3-3)
  // Positions as [x%, y%] on pitch where 0,0 = top-left
  // Home team: GK at left, attacking right
  const formationHome = [
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
  // Away team: GK at right, attacking left
  const formationAway = [
    [92, 50],  // GK
    [75, 82],  // LB (mirrored)
    [75, 62],  // CB-L
    [75, 38],  // CB-R
    [75, 18],  // RB
    [60, 75],  // LM
    [60, 50],  // CM
    [60, 25],  // RM
    [45, 82],  // LW
    [45, 50],  // ST
    [45, 18],  // RW
  ];

  lineupMap[teamName] = lineup.map((p, i) => ({
    ...p,
    pitchX: 50,  // placeholder, assigned per match
    pitchY: 50,
    formationIndex: i,
  }));
});

writeFileSync(`${OUT_DIR}/lineups.json`, JSON.stringify(lineupMap, null, 2));
console.log(`  → ${Object.keys(lineupMap).length} team lineups`);

console.log('\nDone! All data files written to src/data/');

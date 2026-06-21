// ─── Match ────────────────────────────────────────────────────────────────────
export interface Match {
  id: string;
  date: string;
  time: string;
  day: string;
  homeTeam: string;
  awayTeam: string;
  round: string;
  stage: 'group' | 'knockout';
  score: string | null;
  status: 'scheduled' | 'completed';
}

// ─── Team ─────────────────────────────────────────────────────────────────────
export interface Team {
  name: string;
  flagCode: string;
  rank: number;
  points: number;           // FIFA points used as ELO
  gamesPlayed: number;
  goalsScored: number;
  avgGoalsScored: number;
}

// ─── Player ───────────────────────────────────────────────────────────────────
export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export interface Player {
  id: string;
  name: string;
  team: string;
  position: Position;
  age: number;
  club: string;
  games: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  yellowCards: number;
  plusMinus: number;
  fouls: number;
  interceptions: number;
  tacklesWon: number;
  crosses: number;
  offsides: number;
  goalsP90: number;
  assistsP90: number;
  shotsP90: number;
  shotsOTP90: number;
  formScore: number;       // 0–10
  // GK only
  gkSaves: number;
  gkSavePct: number;
  gkCleanSheets: number;
  gkGoalsAgainst: number;
  // Pitch position (assigned per match side)
  pitchX: number;
  pitchY: number;
  formationIndex: number;
}

// ─── Prediction ───────────────────────────────────────────────────────────────
export interface MatchPrediction {
  homeWin: number;
  draw: number;
  awayWin: number;
  xGHome: number;
  xGAway: number;
  confidence: 'high' | 'medium' | 'low';
}

// ─── Betting suggestion ───────────────────────────────────────────────────────
export type BetType =
  | 'over-under'
  | 'anytime-goalscorer'
  | 'btts'
  | 'asian-handicap'
  | 'player-shots'
  | 'match-result'
  | 'double-chance';

export interface BettingSuggestion {
  type: BetType;
  label: string;
  rationale: string;
  confidence: number;        // model probability, 0–100
  oddsEstimate: string;      // estimated market price, e.g. "~1.85"
  impliedPct: number;        // probability implied by the market odds, 0–100
  edge: number;              // model % − implied % (value; +ve = model edge)
}

// ─── Player projection ────────────────────────────────────────────────────────
export interface PlayerProjection {
  projectedGoals: number;
  projectedAssists: number;
  projectedShots: number;
  projectedShotsOT: number;
  projectedMinutes: number;
  propSuggestion: BettingSuggestion;
}

// ─── Polymarket odds ──────────────────────────────────────────────────────────
export interface PolymarketOdds {
  homeWin?: number;
  draw?: number;
  awayWin?: number;
  marketUrl?: string;
  source: 'polymarket' | 'kalshi' | 'none';
}

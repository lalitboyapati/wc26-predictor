import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { getMatch, getTeam, getLineup, formatMatchTimeET } from '../lib/dataHelpers';
import { predictMatch } from '../lib/predictor';
import { generateBettingSuggestions, projectPlayerStats } from '../lib/bettingEngine';
import { fetchPolymarketOdds } from '../lib/polymarket';
import { getPredictedScore } from '../lib/predictedScore';
import type { Player, PolymarketOdds } from '../types';

import SoccerPitch from '../components/SoccerPitch';
import WinProbabilityBar from '../components/WinProbabilityBar';
import BettingSuggestions from '../components/BettingSuggestions';
import PlayerDetailPanel from '../components/PlayerDetailPanel';
import TopNav from '../components/TopNav';
import Flag from '../components/Flag';

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const match = useMemo(() => getMatch(id ?? ''), [id]);
  const homeTeam = useMemo(() => match ? getTeam(match.homeTeam) : undefined, [match]);
  const awayTeam = useMemo(() => match ? getTeam(match.awayTeam) : undefined, [match]);

  const homePlayers = useMemo(() =>
    match ? getLineup(match.homeTeam, 'home') : [], [match]);
  const awayPlayers = useMemo(() =>
    match ? getLineup(match.awayTeam, 'away') : [], [match]);

  const prediction = useMemo(() => {
    if (!homeTeam || !awayTeam) return null;
    return predictMatch(homeTeam, awayTeam);
  }, [homeTeam, awayTeam]);

  const allMatchPlayers = useMemo(() => [...homePlayers, ...awayPlayers], [homePlayers, awayPlayers]);

  const bettingSuggestions = useMemo(() => {
    if (!homeTeam || !awayTeam || !prediction) return [];
    return generateBettingSuggestions(homeTeam, awayTeam, homePlayers, awayPlayers, prediction);
  }, [homeTeam, awayTeam, prediction, homePlayers, awayPlayers]);

  const predictedScore = useMemo(() => match ? getPredictedScore(match) : null, [match]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [liveOdds, setLiveOdds] = useState<PolymarketOdds | null>(null);
  const [loadingOdds, setLoadingOdds] = useState(false);

  // Fetch Polymarket odds
  useEffect(() => {
    if (!match) return;
    setLoadingOdds(true);
    fetchPolymarketOdds(match.homeTeam, match.awayTeam).then(odds => {
      setLiveOdds(odds);
      setLoadingOdds(false);
    });
  }, [match]);

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Match not found.</p>
          <button onClick={() => navigate('/')} className="text-blue-400 hover:underline">← Back to schedule</button>
        </div>
      </div>
    );
  }

  const playerProjection = selectedPlayer ? projectPlayerStats(selectedPlayer) : null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <TopNav />

      {/* Sub-header */}
      <div className="border-b border-white/5 bg-gray-900/60 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Schedule
          </button>
          <div className="h-4 w-px bg-gray-700" />
          <span className="text-gray-400 text-sm">{match.date}</span>
          <div className="h-4 w-px bg-gray-700" />
          <span className="text-gray-500 text-xs">{match.round}</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Hero: teams */}
        <div className="rounded-xl bg-gradient-to-br from-violet-900/30 via-gray-900 to-fuchsia-900/20 border border-white/10 p-5">
          <div className="flex items-center justify-between gap-4">
            {/* Home */}
            <div className="flex-1 flex items-center gap-3">
              <Flag code={homeTeam?.flagCode ?? ''} name={match.homeTeam} size={80} className="w-12 h-8 shadow" />
              <div>
                <p className="font-bold text-xl text-white">{match.homeTeam}</p>
                <p className="text-xs text-gray-400">#{homeTeam?.rank ?? '–'} FIFA · {homeTeam?.points?.toFixed(0) ?? '–'} pts</p>
              </div>
            </div>

            {/* Predicted scoreline */}
            <div className="text-center px-4">
              {predictedScore ? (
                <>
                  <span className="text-3xl font-black font-mono text-white">
                    {predictedScore.homeGoals}–{predictedScore.awayGoals}
                  </span>
                  <p className="mt-1">
                    <span className="text-[10px] uppercase tracking-wide text-fuchsia-400/80 font-semibold">
                      AI predicted
                    </span>
                  </p>
                </>
              ) : (
                <span className="text-2xl font-black text-gray-600">VS</span>
              )}
              <p className="text-xs text-gray-600 mt-1">{formatMatchTimeET(match)}</p>
            </div>

            {/* Away */}
            <div className="flex-1 flex items-center gap-3 justify-end">
              <div className="text-right">
                <p className="font-bold text-xl text-white">{match.awayTeam}</p>
                <p className="text-xs text-gray-400">#{awayTeam?.rank ?? '–'} FIFA · {awayTeam?.points?.toFixed(0) ?? '–'} pts</p>
              </div>
              <Flag code={awayTeam?.flagCode ?? ''} name={match.awayTeam} size={80} className="w-12 h-8 shadow" />
            </div>
          </div>
        </div>

        {/* Win probability */}
        {prediction && (
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <WinProbabilityBar
              prediction={prediction}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              liveOdds={liveOdds ?? undefined}
            />
            {loadingOdds && (
              <p className="text-xs text-gray-600 mt-2">Checking Polymarket for live odds…</p>
            )}
          </div>
        )}

        {/* Soccer pitch */}
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              Starting Lineup — Click a Player
            </h3>
            <span className="text-xs text-gray-600">4-3-3 formation</span>
          </div>
          {allMatchPlayers.length > 0 ? (
            <SoccerPitch
              homePlayers={homePlayers}
              awayPlayers={awayPlayers}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              onPlayerClick={setSelectedPlayer}
              selectedPlayerId={selectedPlayer?.id}
            />
          ) : (
            <div className="text-center py-10 text-gray-600 text-sm">
              No lineup data available for this match.
            </div>
          )}
        </div>

        {/* Betting suggestions */}
        {bettingSuggestions.length > 0 && (
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <BettingSuggestions suggestions={bettingSuggestions} />
          </div>
        )}

        {/* Team stat comparison */}
        {homeTeam && awayTeam && (
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
              Team Stats
            </h3>
            <div className="space-y-3">
              {[
                { label: 'FIFA Ranking', home: `#${homeTeam.rank}`, away: `#${awayTeam.rank}`, invert: true },
                { label: 'FIFA Points', home: homeTeam.points.toFixed(0), away: awayTeam.points.toFixed(0) },
                { label: 'Avg Goals Scored', home: homeTeam.avgGoalsScored.toFixed(2), away: awayTeam.avgGoalsScored.toFixed(2) },
                { label: 'Goals Scored (WC)', home: String(homeTeam.goalsScored), away: String(awayTeam.goalsScored) },
                { label: 'Games Played', home: String(homeTeam.gamesPlayed), away: String(awayTeam.gamesPlayed) },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 text-sm">
                  <span className="text-white font-medium w-20 text-right">{row.home}</span>
                  <span className="flex-1 text-center text-gray-600 text-xs">{row.label}</span>
                  <span className="text-white font-medium w-20">{row.away}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Player detail panel */}
      {selectedPlayer && playerProjection && (
        <PlayerDetailPanel
          player={selectedPlayer}
          projection={playerProjection}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}

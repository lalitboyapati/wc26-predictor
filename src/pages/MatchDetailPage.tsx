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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4 tracking-wider">MATCH NOT FOUND</p>
          <button onClick={() => navigate('/')} className="text-accent hover:underline tracking-wider text-sm">← BACK TO SCHEDULE</button>
        </div>
      </div>
    );
  }

  const playerProjection = selectedPlayer ? projectPlayerStats(selectedPlayer) : null;

  return (
    <div className="min-h-screen text-gray-200">
      <TopNav />

      {/* Sub-header / breadcrumb */}
      <div className="border-b border-white/10 bg-black/30">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-3 text-[11px] tracking-wider">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-accent transition-colors">← SCHEDULE</button>
          <span className="text-gray-700">/</span>
          <span className="text-gray-500">{match.date}</span>
          <span className="text-gray-700">/</span>
          <span className="text-gray-600">{match.round.toUpperCase()}</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        {/* Hero */}
        <div className="border border-white/10 bg-white/[0.015] p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <Flag code={homeTeam?.flagCode ?? ''} name={match.homeTeam} size={80} className="w-11 h-7" />
              <div className="min-w-0">
                <p className="font-bold text-lg text-white truncate">{match.homeTeam}</p>
                <p className="text-[11px] text-gray-500">#{homeTeam?.rank ?? '–'} · {homeTeam?.points?.toFixed(0) ?? '–'} PTS</p>
              </div>
            </div>

            <div className="text-center px-3 flex-shrink-0">
              {predictedScore ? (
                <span className="text-3xl font-bold text-white tabular-nums">
                  {predictedScore.homeGoals}<span className="text-gray-700">:</span>{predictedScore.awayGoals}
                </span>
              ) : (
                <span className="text-2xl font-bold text-gray-600">VS</span>
              )}
              <p className="text-[9px] tracking-[0.2em] text-accent/70 mt-1">PREDICTED</p>
              <p className="text-[10px] tracking-wider text-gray-600 mt-0.5">{formatMatchTimeET(match)}</p>
            </div>

            <div className="flex-1 flex items-center gap-3 justify-end min-w-0">
              <div className="text-right min-w-0">
                <p className="font-bold text-lg text-white truncate">{match.awayTeam}</p>
                <p className="text-[11px] text-gray-500">#{awayTeam?.rank ?? '–'} · {awayTeam?.points?.toFixed(0) ?? '–'} PTS</p>
              </div>
              <Flag code={awayTeam?.flagCode ?? ''} name={match.awayTeam} size={80} className="w-11 h-7" />
            </div>
          </div>
        </div>

        {/* Odds + Betting side by side on desktop (bettor focus) */}
        <div className="grid lg:grid-cols-2 gap-4">
          {prediction && (
            <div className="border border-white/10 bg-white/[0.015] p-4">
              <WinProbabilityBar
                prediction={prediction}
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                liveOdds={liveOdds ?? undefined}
              />
              {loadingOdds && <p className="text-[10px] tracking-wider text-gray-600 mt-2">CHECKING POLYMARKET…</p>}
            </div>
          )}
          {bettingSuggestions.length > 0 && (
            <BettingSuggestions suggestions={bettingSuggestions} />
          )}
        </div>

        {/* Pitch */}
        <div className="border border-white/10 bg-white/[0.015] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] tracking-[0.2em] text-gray-400">▸ STARTING XI — CLICK A PLAYER</span>
            <span className="text-[10px] tracking-wider text-gray-600">4-3-3</span>
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
            <div className="text-center py-10 text-gray-600 text-sm tracking-wider">NO LINEUP DATA</div>
          )}
        </div>

        {/* Team stats */}
        {homeTeam && awayTeam && (
          <div className="border border-white/10 bg-white/[0.015] p-4">
            <span className="text-[11px] tracking-[0.2em] text-gray-400">▸ TEAM COMPARISON</span>
            <div className="mt-3 space-y-2">
              {[
                { label: 'FIFA RANKING', home: `#${homeTeam.rank}`, away: `#${awayTeam.rank}` },
                { label: 'FIFA POINTS', home: homeTeam.points.toFixed(0), away: awayTeam.points.toFixed(0) },
                { label: 'AVG GOALS SCORED', home: homeTeam.avgGoalsScored.toFixed(2), away: awayTeam.avgGoalsScored.toFixed(2) },
                { label: 'PROJECTED xG', home: String(prediction?.xGHome ?? '–'), away: String(prediction?.xGAway ?? '–') },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 text-[12px] tabular-nums">
                  <span className="text-accent w-16 text-right">{row.home}</span>
                  <span className="flex-1 text-center text-gray-600 text-[10px] tracking-wider">{row.label}</span>
                  <span className="text-sky-400 w-16">{row.away}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

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

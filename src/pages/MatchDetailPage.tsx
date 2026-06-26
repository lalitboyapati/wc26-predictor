import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { getMatch, getTeam, getLineup, formatMatchTimeET, formatMatchDate } from '../lib/dataHelpers';
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

  useEffect(() => {
    if (match) {
      document.title = `${match.homeTeam} vs ${match.awayTeam} — WC26`;
      return () => { document.title = 'WC26 Predictor'; };
    }
  }, [match]);

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
          <p className="text-gray-400 mb-4">Match not found.</p>
          <button onClick={() => navigate('/')} className="text-gold hover:underline text-sm font-medium">← Back to matches</button>
        </div>
      </div>
    );
  }

  const playerProjection = selectedPlayer ? projectPlayerStats(selectedPlayer) : null;

  return (
    <div className="min-h-screen text-gray-100">
      <TopNav />

      {/* breadcrumb */}
      <div className="border-b border-white/[0.06] bg-ink-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 py-2.5 flex items-center gap-2.5 text-[12px] text-gray-400">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gold transition-colors font-medium">← Back</button>
          <span className="text-gray-700">·</span>
          <span>{formatMatchDate(match.date)}</span>
          <span className="text-gray-700">·</span>
          <span>{match.round}</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-5 py-6 space-y-4">

        {/* Hero */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.014] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <Flag code={homeTeam?.flagCode ?? ''} name={match.homeTeam} size={80} className="w-12 h-8 rounded-md" />
              <div className="min-w-0">
                <p className="font-bold text-lg text-white truncate">{match.homeTeam}</p>
                <p className="text-xs text-gray-400">#{homeTeam?.rank ?? '–'} · {homeTeam?.points?.toFixed(0) ?? '–'} pts</p>
              </div>
            </div>

            <div className="text-center px-3 flex-shrink-0">
              {predictedScore ? (
                <span className="text-4xl font-extrabold text-white tabular-nums">
                  {predictedScore.homeGoals}<span className="text-gray-700 text-2xl mx-1">–</span>{predictedScore.awayGoals}
                </span>
              ) : (
                <span className="text-2xl font-bold text-gray-600">VS</span>
              )}
              <p className="text-[11px] font-semibold text-gold/80 mt-1">Predicted score</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{formatMatchTimeET(match)}</p>
            </div>

            <div className="flex-1 flex items-center gap-3 justify-end min-w-0">
              <div className="text-right min-w-0">
                <p className="font-bold text-lg text-white truncate">{match.awayTeam}</p>
                <p className="text-xs text-gray-400">#{awayTeam?.rank ?? '–'} · {awayTeam?.points?.toFixed(0) ?? '–'} pts</p>
              </div>
              <Flag code={awayTeam?.flagCode ?? ''} name={match.awayTeam} size={80} className="w-12 h-8 rounded-md" />
            </div>
          </div>
        </div>

        {/* Odds + Betting (bettor focus) */}
        <div className="grid lg:grid-cols-2 gap-4">
          {prediction && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.014] p-5">
              <WinProbabilityBar
                prediction={prediction}
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                liveOdds={liveOdds ?? undefined}
              />
              {loadingOdds && <div className="mt-2 h-1 w-20 rounded-full bg-white/10 animate-pulse" />}
            </div>
          )}
          {bettingSuggestions.length > 0 && (
            <BettingSuggestions suggestions={bettingSuggestions} />
          )}
        </div>

        {/* Pitch */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.014] p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Starting XI <span className="font-normal text-gray-400">— tap a player</span></h3>
            <span className="text-xs text-gray-600">4-3-3</span>
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
            <div className="text-center py-10 text-gray-600 text-sm">No lineup data.</div>
          )}
        </div>

        {/* Team stats */}
        {homeTeam && awayTeam && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.014] p-5">
            <h3 className="text-sm font-bold text-white mb-4">Team Comparison</h3>
            <div className="space-y-2.5">
              {[
                { label: 'FIFA Ranking', home: `#${homeTeam.rank}`, away: `#${awayTeam.rank}` },
                { label: 'FIFA Points', home: homeTeam.points.toFixed(0), away: awayTeam.points.toFixed(0) },
                { label: 'Avg Goals Scored', home: homeTeam.avgGoalsScored.toFixed(2), away: awayTeam.avgGoalsScored.toFixed(2) },
                { label: 'Projected xG', home: String(prediction?.xGHome ?? '–'), away: String(prediction?.xGAway ?? '–') },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 text-[13px] tabular-nums">
                  <span className="text-sky-300 font-semibold w-16 text-right">{row.home}</span>
                  <span className="flex-1 text-center text-gray-400 text-[12px]">{row.label}</span>
                  <span className="text-rose-300 font-semibold w-16">{row.away}</span>
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

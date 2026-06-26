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

function barWidths(homeVal: number, awayVal: number) {
  const max = Math.max(homeVal, awayVal);
  if (max === 0) return { homeWidth: 50, awayWidth: 50 };
  return { homeWidth: (homeVal / max) * 100, awayWidth: (awayVal / max) * 100 };
}

function BarCompare({
  label, homeDisplay, awayDisplay, homeWidth, awayWidth,
}: {
  label: string; homeDisplay: string; awayDisplay: string;
  homeWidth: number; awayWidth: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-[12px]">
        <span className="text-sky-300 font-semibold tabular-nums w-16">{homeDisplay}</span>
        <span className="flex-1 text-center text-gray-500 text-[11px]">{label}</span>
        <span className="text-rose-300 font-semibold tabular-nums w-16 text-right">{awayDisplay}</span>
      </div>
      <div className="flex gap-0.5 h-2">
        <div className="flex-1 flex justify-end rounded-l-full overflow-hidden bg-white/[0.05]">
          <div className="bg-sky-400/80 h-full rounded-l-full" style={{ width: `${homeWidth}%` }} />
        </div>
        <div className="flex-1 flex justify-start rounded-r-full overflow-hidden bg-white/[0.05]">
          <div className="bg-rose-400/80 h-full rounded-r-full" style={{ width: `${awayWidth}%` }} />
        </div>
      </div>
    </div>
  );
}

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

      {/* Breadcrumb */}
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

        {/* ── Hero Zone ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08]">
          {/* Directional team color bands */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-sky-500/[0.08]" />
            <div className="absolute inset-y-0 right-0 w-1/2 bg-rose-500/[0.08]" />
          </div>

          {/* Mobile layout */}
          <div className="relative sm:hidden p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Flag code={homeTeam?.flagCode ?? ''} name={match.homeTeam} size={80} className="w-10 h-[27px] rounded-md flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[16px] font-extrabold text-white leading-none truncate">{match.homeTeam}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">#{homeTeam?.rank ?? '–'} · {homeTeam ? homeTeam.points.toFixed(0) : '–'} pts</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end">
                <div className="min-w-0 text-right">
                  <p className="text-[16px] font-extrabold text-white leading-none truncate">{match.awayTeam}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">#{awayTeam?.rank ?? '–'} · {awayTeam ? awayTeam.points.toFixed(0) : '–'} pts</p>
                </div>
                <Flag code={awayTeam?.flagCode ?? ''} name={match.awayTeam} size={80} className="w-10 h-[27px] rounded-md flex-shrink-0" />
              </div>
            </div>
            <div className="text-center">
              {predictedScore ? (
                <span className="text-4xl font-extrabold text-white tabular-nums font-mono">
                  {predictedScore.homeGoals}<span className="text-gray-700 mx-1.5">–</span>{predictedScore.awayGoals}
                </span>
              ) : (
                <span className="text-2xl font-bold text-gray-600">VS</span>
              )}
              <p className="text-[11px] font-semibold text-gold/80 mt-1">Predicted score · {formatMatchTimeET(match)}</p>
            </div>
            {prediction && (
              <div>
                <div className="flex h-3.5 w-full overflow-hidden rounded-full gap-px">
                  <div className="bg-sky-400 rounded-l-full" style={{ width: `${prediction.homeWin}%` }} />
                  <div className="bg-zinc-600" style={{ width: `${prediction.draw}%` }} />
                  <div className="bg-rose-400 rounded-r-full" style={{ width: `${prediction.awayWin}%` }} />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] tabular-nums font-medium">
                  <span className="text-sky-300">{prediction.homeWin}%</span>
                  <span className="text-gray-500">{prediction.draw}%</span>
                  <span className="text-rose-300">{prediction.awayWin}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop layout (≥ sm) */}
          <div className="relative hidden sm:grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-7 sm:p-9">
            {/* Home team */}
            <div className="min-w-0 space-y-3">
              <Flag code={homeTeam?.flagCode ?? ''} name={match.homeTeam} size={120} className="w-[68px] h-[46px] rounded-lg shadow-md" />
              <div className="min-w-0">
                <p className="text-2xl lg:text-[30px] font-extrabold text-white tracking-tight leading-none truncate">
                  {match.homeTeam}
                </p>
                <p className="text-xs text-gray-400 mt-1.5">
                  #{homeTeam?.rank ?? '–'} · {homeTeam ? homeTeam.points.toFixed(0) : '–'} pts
                  {homeTeam ? ` · ${homeTeam.avgGoalsScored.toFixed(2)} avg` : ''}
                </p>
              </div>
            </div>

            {/* Center: score + probability bar */}
            <div className="text-center px-5 flex flex-col items-center gap-3 flex-shrink-0">
              {predictedScore ? (
                <div className="text-5xl font-extrabold text-white tabular-nums font-mono leading-none">
                  {predictedScore.homeGoals}
                  <span className="text-gray-700 mx-2 text-3xl" style={{ fontFamily: 'inherit' }}>–</span>
                  {predictedScore.awayGoals}
                </div>
              ) : (
                <div className="text-3xl font-bold text-gray-600">VS</div>
              )}
              <div>
                <p className="text-[11px] font-semibold text-gold/80">Predicted score</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{formatMatchTimeET(match)}</p>
              </div>
              {prediction && (
                <div className="w-44 md:w-52">
                  <div className="flex h-4 w-full overflow-hidden rounded-full gap-px">
                    <div className="bg-sky-400 rounded-l-full" style={{ width: `${prediction.homeWin}%` }} />
                    <div className="bg-zinc-600" style={{ width: `${prediction.draw}%` }} />
                    <div className="bg-rose-400 rounded-r-full" style={{ width: `${prediction.awayWin}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] tabular-nums font-medium">
                    <span className="text-sky-300">{prediction.homeWin}%</span>
                    <span className="text-gray-500">{prediction.draw}%</span>
                    <span className="text-rose-300">{prediction.awayWin}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Away team */}
            <div className="min-w-0 space-y-3 flex flex-col items-end text-right">
              <Flag code={awayTeam?.flagCode ?? ''} name={match.awayTeam} size={120} className="w-[68px] h-[46px] rounded-lg shadow-md" />
              <div className="min-w-0">
                <p className="text-2xl lg:text-[30px] font-extrabold text-white tracking-tight leading-none truncate">
                  {match.awayTeam}
                </p>
                <p className="text-xs text-gray-400 mt-1.5">
                  #{awayTeam?.rank ?? '–'} · {awayTeam ? awayTeam.points.toFixed(0) : '–'} pts
                  {awayTeam ? ` · ${awayTeam.avgGoalsScored.toFixed(2)} avg` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Analysis section: pitch + sticky panel ── */}
        <div className="grid lg:grid-cols-[3fr_2fr] gap-4 items-start">
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
              <div className="text-center py-10 text-gray-400 text-sm">Lineups announced closer to kickoff.</div>
            )}
          </div>

          {/* Sticky analysis panel */}
          <div className="space-y-4 lg:sticky lg:top-[80px]">
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
        </div>

        {/* ── Head-to-Head comparison ── */}
        {homeTeam && awayTeam && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.014] p-5">
            <h3 className="text-sm font-bold text-white mb-5">Head-to-Head</h3>
            <div className="space-y-4">
              <BarCompare
                label="FIFA Ranking"
                homeDisplay={`#${homeTeam.rank}`}
                awayDisplay={`#${awayTeam.rank}`}
                {...barWidths(Math.max(0, 100 - homeTeam.rank), Math.max(0, 100 - awayTeam.rank))}
              />
              <BarCompare
                label="FIFA Points"
                homeDisplay={homeTeam.points.toFixed(0)}
                awayDisplay={awayTeam.points.toFixed(0)}
                {...barWidths(homeTeam.points, awayTeam.points)}
              />
              <BarCompare
                label="Avg Goals Scored"
                homeDisplay={homeTeam.avgGoalsScored.toFixed(2)}
                awayDisplay={awayTeam.avgGoalsScored.toFixed(2)}
                {...barWidths(homeTeam.avgGoalsScored, awayTeam.avgGoalsScored)}
              />
              {prediction && (
                <BarCompare
                  label="Projected xG"
                  homeDisplay={prediction.xGHome.toFixed(2)}
                  awayDisplay={prediction.xGAway.toFixed(2)}
                  {...barWidths(prediction.xGHome, prediction.xGAway)}
                />
              )}
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

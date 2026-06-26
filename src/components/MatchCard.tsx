import type { Match, Team } from '../types';
import { formatMatchTimeET } from '../lib/dataHelpers';
import { getPredictedScore } from '../lib/predictedScore';
import { predictMatch } from '../lib/predictor';
import Flag from './Flag';

interface Props {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  onClick: () => void;
}

export default function MatchCard({ match, homeTeam, awayTeam, onClick }: Props) {
  const { homeGoals, awayGoals } = getPredictedScore(match);
  const pred = homeTeam && awayTeam ? predictMatch(homeTeam, awayTeam) : null;

  // favourite chip
  let fav: { name: string; pct: number } | null = null;
  if (pred) {
    if (pred.homeWin >= pred.awayWin && pred.homeWin >= pred.draw) fav = { name: match.homeTeam, pct: pred.homeWin };
    else if (pred.awayWin >= pred.draw) fav = { name: match.awayTeam, pct: pred.awayWin };
    else fav = { name: 'Draw', pct: pred.draw };
  }

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border border-white/[0.06] bg-white/[0.012] p-4
        transition-colors duration-150 hover:bg-white/[0.035] hover:border-white/[0.12]"
    >
      {/* meta */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">{formatMatchTimeET(match)}</span>
        {fav && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            {fav.name} {fav.pct}%
          </span>
        )}
      </div>

      {/* teams + score */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Flag code={homeTeam?.flagCode ?? ''} name={match.homeTeam} size={40} className="w-8 h-[21px] rounded flex-shrink-0" />
          <span className="text-[15px] font-semibold text-gray-100 truncate">{match.homeTeam}</span>
        </div>
        <div className="flex items-center gap-1.5 text-lg font-bold text-white tabular-nums">
          <span>{homeGoals}</span><span className="text-gray-600 text-sm">–</span><span>{awayGoals}</span>
        </div>
        <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
          <span className="text-[15px] font-semibold text-gray-100 truncate text-right">{match.awayTeam}</span>
          <Flag code={awayTeam?.flagCode ?? ''} name={match.awayTeam} size={40} className="w-8 h-[21px] rounded flex-shrink-0" />
        </div>
      </div>

      {/* win-probability bar */}
      {pred && (
        <div className="mt-3.5">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full gap-0.5">
            <div className="bg-home rounded-l-full" style={{ width: `${pred.homeWin}%` }} />
            <div className="bg-draw" style={{ width: `${pred.draw}%` }} />
            <div className="bg-away rounded-r-full" style={{ width: `${pred.awayWin}%` }} />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[11px] text-gray-400">
            <span className="text-sky-300/90">{pred.homeWin}%</span>
            <span>Draw {pred.draw}%</span>
            <span className="text-rose-300/90">{pred.awayWin}%</span>
          </div>
        </div>
      )}
    </button>
  );
}

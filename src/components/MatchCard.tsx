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

  return (
    <button
      onClick={onClick}
      className="w-full text-left border border-white/10 bg-white/[0.015] transition-colors cursor-pointer group
        hover:border-accent/40 hover:bg-white/[0.03]"
    >
      <div className="p-3.5">
        {/* meta row */}
        <div className="flex items-center justify-between mb-2.5 text-[10px] tracking-wider text-gray-600">
          <span>{formatMatchTimeET(match)}</span>
          <span className="text-accent/60">PREDICTED</span>
        </div>

        {/* teams + score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Flag code={homeTeam?.flagCode ?? ''} name={match.homeTeam} size={40} className="w-7 h-[18px] flex-shrink-0" />
            <span className="text-sm text-gray-200 truncate group-hover:text-white">{match.homeTeam}</span>
          </div>
          <span className="text-base font-bold text-white tabular-nums px-1">{homeGoals}<span className="text-gray-600">:</span>{awayGoals}</span>
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className="text-sm text-gray-200 truncate text-right group-hover:text-white">{match.awayTeam}</span>
            <Flag code={awayTeam?.flagCode ?? ''} name={match.awayTeam} size={40} className="w-7 h-[18px] flex-shrink-0" />
          </div>
        </div>

        {/* win-probability mini bar */}
        {pred && (
          <div className="mt-3">
            <div className="flex h-1.5 w-full overflow-hidden gap-px">
              <div className="bg-accent" style={{ width: `${pred.homeWin}%` }} />
              <div className="bg-gray-600" style={{ width: `${pred.draw}%` }} />
              <div className="bg-sky-400/80" style={{ width: `${pred.awayWin}%` }} />
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[10px] tracking-wider text-gray-600">
              <span className="text-accent/80">{pred.homeWin}%</span>
              <span>DRAW {pred.draw}%</span>
              <span className="text-sky-400/80">{pred.awayWin}%</span>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}

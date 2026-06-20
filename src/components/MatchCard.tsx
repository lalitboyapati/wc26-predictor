import type { Match, Team } from '../types';
import { formatMatchTimeET } from '../lib/dataHelpers';
import { getPredictedScore } from '../lib/predictedScore';
import Flag from './Flag';

interface Props {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  onClick: () => void;
}

export default function MatchCard({ match, homeTeam, awayTeam, onClick }: Props) {
  const { homeGoals, awayGoals } = getPredictedScore(match);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-gray-700/80 bg-gray-800/50 transition-all duration-200 cursor-pointer group
        hover:bg-gray-800 hover:border-fuchsia-500/50 hover:shadow-lg hover:shadow-fuchsia-900/20"
    >
      <div className="p-4">
        {/* Status row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500 font-mono">{formatMatchTimeET(match)}</span>
          <span className="text-[10px] uppercase tracking-wide text-fuchsia-400/70 bg-fuchsia-500/10 border border-fuchsia-500/20 px-2 py-0.5 rounded-full font-semibold">
            Predicted
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-3">
          {/* Home */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Flag code={homeTeam?.flagCode ?? ''} name={match.homeTeam} size={40} className="w-8 h-5 flex-shrink-0" />
            <span className="font-semibold text-gray-100 text-sm truncate group-hover:text-white">
              {match.homeTeam}
            </span>
          </div>

          {/* Predicted scoreline */}
          <div className="flex-shrink-0 text-center px-2">
            <span className="font-black text-lg font-mono text-gray-200">
              {homeGoals}–{awayGoals}
            </span>
          </div>

          {/* Away */}
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className="font-semibold text-gray-100 text-sm truncate text-right group-hover:text-white">
              {match.awayTeam}
            </span>
            <Flag code={awayTeam?.flagCode ?? ''} name={match.awayTeam} size={40} className="w-8 h-5 flex-shrink-0" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
          <span>#{homeTeam?.rank ?? '–'}</span>
          <span className="text-fuchsia-500/60 group-hover:text-fuchsia-400 transition-colors">View prediction →</span>
          <span>#{awayTeam?.rank ?? '–'}</span>
        </div>
      </div>
    </button>
  );
}

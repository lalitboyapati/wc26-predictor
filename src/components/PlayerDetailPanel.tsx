import { useEffect } from 'react';
import type { Player, PlayerProjection } from '../types';
import BettingSuggestions from './BettingSuggestions';

interface Props {
  player: Player;
  projection: PlayerProjection;
  onClose: () => void;
}

const POS_LABEL: Record<string, string> = { GK: 'Goalkeeper', DF: 'Defender', MF: 'Midfielder', FW: 'Forward' };
const POS_COLOR: Record<string, string> = {
  GK: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  DF: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  MF: 'text-green-400 bg-green-400/10 border-green-400/30',
  FW: 'text-red-400 bg-red-400/10 border-red-400/30',
};

function StatCompare({
  label, actual, projected, unit = '',
}: {
  label: string; actual: number; projected: number; unit?: string;
}) {
  const better = projected > actual;
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-gray-800 last:border-0">
      <span className="text-gray-500 text-xs w-28 shrink-0">{label}</span>
      <div className="flex items-center gap-3 ml-auto">
        <div className="text-center">
          <div className="text-gray-300 font-mono font-semibold text-sm">{actual.toFixed(actual % 1 === 0 ? 0 : 2)}{unit}</div>
          <div className="text-gray-600 text-[10px]">Actual</div>
        </div>
        <div className="text-gray-700 text-xs">→</div>
        <div className="text-center">
          <div className={`font-mono font-semibold text-sm ${better ? 'text-green-400' : 'text-gray-300'}`}>
            {projected.toFixed(projected % 1 === 0 ? 0 : 2)}{unit}
          </div>
          <div className="text-gray-600 text-[10px]">Projected</div>
        </div>
      </div>
    </div>
  );
}

export default function PlayerDetailPanel({ player, projection, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const posColor = POS_COLOR[player.position] ?? 'text-gray-400 bg-gray-700 border-gray-600';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto player-panel-enter
        md:fixed md:inset-y-0 md:right-0 md:left-auto md:w-[420px] md:max-h-full
        bg-gray-900 border-t border-gray-700 md:border-t-0 md:border-l rounded-t-2xl md:rounded-none shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-5 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${posColor}`}>
                {POS_LABEL[player.position]}
              </span>
              {player.club && (
                <span className="text-xs text-gray-500">{player.club}</span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">{player.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{player.team} · Age {player.age}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 -mr-1 mt-0.5"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-6">

          {/* Form score */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-800 border border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{player.formScore.toFixed(1)}</div>
              <div className="text-xs text-gray-500">Form /10</div>
            </div>
            <div className="h-8 w-px bg-gray-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{player.games}</div>
              <div className="text-xs text-gray-500">Games</div>
            </div>
            <div className="h-8 w-px bg-gray-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{player.starts}</div>
              <div className="text-xs text-gray-500">Starts</div>
            </div>
            <div className="h-8 w-px bg-gray-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{Math.round(player.minutes)}</div>
              <div className="text-xs text-gray-500">Mins</div>
            </div>
          </div>

          {/* Stats comparison: Actual vs Projected */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
              Actual vs Projected (this match)
            </h3>
            <div className="bg-gray-800/60 rounded-lg px-4 border border-gray-700">
              {player.position === 'GK' ? (
                <>
                  <StatCompare label="Saves" actual={player.gkSaves} projected={Math.round(player.gkSaves / Math.max(player.games, 1) * 1.1)} />
                  <StatCompare label="Save %" actual={player.gkSavePct} projected={Math.min(100, player.gkSavePct + 2)} unit="%" />
                  <StatCompare label="Clean Sheets" actual={player.gkCleanSheets} projected={player.gkCleanSheets / Math.max(player.games, 1)} />
                  <StatCompare label="Goals Conceded" actual={player.gkGoalsAgainst} projected={player.gkGoalsAgainst / Math.max(player.games, 1)} />
                </>
              ) : (
                <>
                  <StatCompare label="Goals" actual={player.goals} projected={projection.projectedGoals} />
                  <StatCompare label="Assists" actual={player.assists} projected={projection.projectedAssists} />
                  <StatCompare label="Shots" actual={player.shots} projected={projection.projectedShots} />
                  <StatCompare label="Shots on Target" actual={player.shotsOnTarget} projected={projection.projectedShotsOT} />
                  {player.position === 'DF' && (
                    <>
                      <StatCompare label="Interceptions" actual={player.interceptions} projected={player.interceptions / Math.max(player.games, 1)} />
                      <StatCompare label="Tackles Won" actual={player.tacklesWon} projected={player.tacklesWon / Math.max(player.games, 1)} />
                    </>
                  )}
                  {player.position === 'MF' && (
                    <StatCompare label="Crosses" actual={player.crosses} projected={player.crosses / Math.max(player.games, 1)} />
                  )}
                  <StatCompare label="+/−" actual={player.plusMinus} projected={player.plusMinus * 1.05} />
                </>
              )}
            </div>
          </div>

          {/* Player prop suggestion */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
              Suggested Player Prop
            </h3>
            <BettingSuggestions suggestions={[projection.propSuggestion]} />
          </div>

          {/* Per-90 stats */}
          {player.position !== 'GK' && player.minutes > 0 && (
            <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Per 90 Minutes</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Goals/90: </span>
                  <span className="text-gray-200 font-mono">{player.goalsP90.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Assists/90: </span>
                  <span className="text-gray-200 font-mono">{player.assistsP90.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Shots/90: </span>
                  <span className="text-gray-200 font-mono">{player.shotsP90.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">SOT/90: </span>
                  <span className="text-gray-200 font-mono">{player.shotsOTP90.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

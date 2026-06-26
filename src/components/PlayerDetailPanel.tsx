import { useEffect, useId, useRef } from 'react';
import type { Player, PlayerProjection } from '../types';
import BettingSuggestions from './BettingSuggestions';
import { POS_TEXT_CLASSES } from '../lib/positionColors';

interface Props {
  player: Player;
  projection: PlayerProjection;
  onClose: () => void;
}

const POS_LABEL: Record<string, string> = {
  GK: 'Goalkeeper',
  DF: 'Defender',
  MF: 'Midfielder',
  FW: 'Forward',
};

function StatCompare({
  label, actual, projected, unit = '',
}: {
  label: string; actual: number; projected: number; unit?: string;
}) {
  const better = projected > actual;
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-gray-800 last:border-0">
      <span className="text-gray-400 text-xs w-28 shrink-0">{label}</span>
      <div className="flex items-center gap-3 ml-auto">
        <div className="text-center">
          <div className="text-gray-300 font-mono font-semibold text-sm">{actual.toFixed(actual % 1 === 0 ? 0 : 2)}{unit}</div>
          <div className="text-gray-600 text-[10px]">Actual</div>
        </div>
        <div className="text-gray-700 text-xs">→</div>
        <div className="text-center">
          <div className={`tabular-nums font-semibold text-sm ${better ? 'text-gold' : 'text-gray-300'}`}>
            {projected.toFixed(projected % 1 === 0 ? 0 : 2)}{unit}
          </div>
          <div className="text-gray-600 text-[10px]">Projected</div>
        </div>
      </div>
    </div>
  );
}

export default function PlayerDetailPanel({ player, projection, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Move focus to first focusable element on open
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();
  }, []);

  // Escape key + focus trap
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const el = panelRef.current;
      if (!el) return;
      const focusable = Array.from(
        el.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(node => !node.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const posColor = POS_TEXT_CLASSES[player.position] ?? 'text-gray-400 border-gray-600';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto player-panel-enter
          md:fixed md:inset-y-0 md:right-0 md:left-auto md:w-[420px] md:max-h-full
          bg-ink-800 border-t border-white/10 md:border-t-0 md:border-l rounded-t-2xl md:rounded-none"
      >
        {/* Header */}
        <div className="sticky top-0 bg-ink-800/95 backdrop-blur border-b border-white/10 px-5 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 border ${posColor}`}>
                {POS_LABEL[player.position] ?? player.position}
              </span>
              {player.club && (
                <span className="text-xs text-gray-400">{player.club}</span>
              )}
            </div>
            <h2 id={titleId} className="text-lg font-bold text-white leading-tight">{player.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{player.team} · Age {player.age}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close player details"
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
              <div className="text-xs text-gray-400">Form /10</div>
            </div>
            <div className="h-8 w-px bg-gray-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{player.games}</div>
              <div className="text-xs text-gray-400">Games</div>
            </div>
            <div className="h-8 w-px bg-gray-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{player.starts}</div>
              <div className="text-xs text-gray-400">Starts</div>
            </div>
            <div className="h-8 w-px bg-gray-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{Math.round(player.minutes)}</div>
              <div className="text-xs text-gray-400">Mins</div>
            </div>
          </div>

          {/* Stats comparison */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Actual vs Projected</h3>
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
            <h3 className="text-sm font-semibold text-white mb-3">Suggested player prop</h3>
            <BettingSuggestions suggestions={[projection.propSuggestion]} />
          </div>

          {/* Per-90 stats */}
          {player.position !== 'GK' && player.minutes > 0 && (
            <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">Per 90</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Goals/90: </span>
                  <span className="text-gray-200 font-mono">{player.goalsP90.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Assists/90: </span>
                  <span className="text-gray-200 font-mono">{player.assistsP90.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Shots/90: </span>
                  <span className="text-gray-200 font-mono">{player.shotsP90.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400">SOT/90: </span>
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

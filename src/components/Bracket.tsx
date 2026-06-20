import type { BracketRound, BracketMatch, BracketTeam } from '../lib/bracket';
import Flag from './Flag';

function TeamRow({
  team, goals, isWinner, side,
}: {
  team: BracketTeam | null;
  goals: number | null;
  isWinner: boolean;
  side: 'home' | 'away';
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 ${side === 'home' ? 'border-b border-gray-700/60' : ''}
        ${isWinner ? 'bg-emerald-500/10' : ''}`}
    >
      <Flag code={team?.flagCode ?? ''} name={team?.name ?? ''} size={20} className="w-5 h-3.5 flex-shrink-0" />
      <span className={`text-xs truncate flex-1 ${isWinner ? 'text-white font-semibold' : 'text-gray-400'}`}>
        {team?.name ?? 'TBD'}
      </span>
      {goals !== null && (
        <span className={`text-xs font-mono font-bold ${isWinner ? 'text-emerald-400' : 'text-gray-600'}`}>
          {goals}
        </span>
      )}
    </div>
  );
}

function MatchBox({ match }: { match: BracketMatch }) {
  return (
    <div className="bg-gray-800/80 border border-gray-700 rounded-lg overflow-hidden w-44 shadow-md hover:border-gray-500 transition-colors">
      <TeamRow team={match.home} goals={match.homeGoals} isWinner={match.winner === 'home'} side="home" />
      <TeamRow team={match.away} goals={match.awayGoals} isWinner={match.winner === 'away'} side="away" />
    </div>
  );
}

export default function Bracket({ rounds }: { rounds: BracketRound[] }) {
  const champion = (() => {
    const final = rounds[rounds.length - 1]?.matches[0];
    if (!final?.winner) return null;
    return final.winner === 'home' ? final.home : final.away;
  })();

  return (
    <div className="space-y-6">
      {/* Champion banner */}
      {champion && (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-yellow-500/40">
            <span className="text-2xl">🏆</span>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-yellow-500/80">Projected Champion</div>
              <div className="flex items-center gap-2 mt-0.5">
                <Flag code={champion.flagCode} name={champion.name} size={40} className="w-7 h-5" />
                <span className="text-lg font-bold text-white">{champion.name}</span>
              </div>
            </div>
            <span className="text-2xl">🏆</span>
          </div>
        </div>
      )}

      {/* Bracket — horizontal scroll on small screens */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max px-2">
          {rounds.map((round, ri) => (
            <div key={round.name} className="flex flex-col">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">
                {round.name}
              </h3>
              <div
                className="flex flex-col justify-around flex-1 gap-3"
                style={{ minHeight: ri === 0 ? 'auto' : '100%' }}
              >
                {round.matches.map(m => (
                  <MatchBox key={m.id} match={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

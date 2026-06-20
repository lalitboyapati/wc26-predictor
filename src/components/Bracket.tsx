import type { BracketRound, BracketMatch, BracketTeam } from '../lib/bracket';
import Flag from './Flag';

function TeamRow({ team, goals, isWinner, divider }: {
  team: BracketTeam | null;
  goals: number | null;
  isWinner: boolean;
  divider: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 px-2 py-1 ${divider ? 'border-b border-white/10' : ''} ${isWinner ? 'bg-accent/10' : ''}`}>
      <Flag code={team?.flagCode ?? ''} name={team?.name ?? ''} size={20} className="w-4 h-[11px] flex-shrink-0" />
      <span className={`text-[11px] truncate flex-1 ${isWinner ? 'text-white' : 'text-gray-500'}`}>
        {team?.name ?? 'TBD'}
      </span>
      {goals !== null && (
        <span className={`text-[11px] tabular-nums ${isWinner ? 'text-accent font-bold' : 'text-gray-600'}`}>{goals}</span>
      )}
    </div>
  );
}

function MatchBox({ match }: { match: BracketMatch }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] w-44 hover:border-accent/30 transition-colors">
      <TeamRow team={match.home} goals={match.homeGoals} isWinner={match.winner === 'home'} divider />
      <TeamRow team={match.away} goals={match.awayGoals} isWinner={match.winner === 'away'} divider={false} />
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
    <div className="space-y-5">
      {champion && (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3 px-5 py-2.5 border border-accent/40 bg-accent/[0.06]">
            <span className="text-[10px] tracking-[0.2em] text-accent/70">PROJECTED CHAMPION</span>
            <Flag code={champion.flagCode} name={champion.name} size={40} className="w-6 h-4" />
            <span className="text-sm font-bold tracking-wider text-white">{champion.name.toUpperCase()}</span>
            <span className="text-accent">★</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto pb-3">
        <div className="flex gap-5 min-w-max px-1">
          {rounds.map((round, ri) => (
            <div key={round.name} className="flex flex-col">
              <h3 className="text-[10px] tracking-[0.2em] text-gray-600 mb-2.5 text-center">
                {round.name.toUpperCase()}
              </h3>
              <div className="flex flex-col justify-around flex-1 gap-2.5" style={{ minHeight: ri === 0 ? 'auto' : '100%' }}>
                {round.matches.map(m => <MatchBox key={m.id} match={m} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import type { BracketRound, BracketMatch, BracketTeam } from '../lib/bracket';
import Flag from './Flag';

function TeamRow({ team, goals, isWinner, divider }: {
  team: BracketTeam | null;
  goals: number | null;
  isWinner: boolean;
  divider: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 ${divider ? 'border-b border-white/[0.06]' : ''} ${isWinner ? 'bg-gold/[0.08]' : ''}`}>
      <Flag code={team?.flagCode ?? ''} name={team?.name ?? ''} size={20} className="w-4 h-3 rounded-sm flex-shrink-0" />
      <span className={`text-[12px] truncate flex-1 ${isWinner ? 'text-white font-semibold' : 'text-gray-400'}`}>
        {team?.name ?? 'TBD'}
      </span>
      {goals !== null && (
        <span className={`text-[12px] tabular-nums ${isWinner ? 'text-gold font-bold' : 'text-gray-600'}`}>{goals}</span>
      )}
    </div>
  );
}

function MatchBox({ match }: { match: BracketMatch }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.014] w-44 overflow-hidden hover:border-white/15 transition-colors">
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
    <div className="space-y-6">
      {champion && (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gold/8 border border-gold/25">
            <span className="text-xl">🏆</span>
            <div className="text-center">
              <div className="text-[11px] text-gold/80 font-medium">Projected Champion</div>
              <div className="flex items-center gap-2 mt-0.5">
                <Flag code={champion.flagCode} name={champion.name} size={40} className="w-6 h-4 rounded-sm" />
                <span className="text-lg font-extrabold text-white">{champion.name}</span>
              </div>
            </div>
            <span className="text-xl">🏆</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto pb-3">
        <div className="flex gap-6 min-w-max px-1">
          {rounds.map((round, ri) => (
            <div key={round.name} className="flex flex-col">
              <h3 className="text-[11px] font-semibold text-gray-400 mb-3 text-center">{round.name}</h3>
              <div className="flex flex-col justify-around flex-1 gap-3" style={{ minHeight: ri === 0 ? 'auto' : '100%' }}>
                {round.matches.map(m => <MatchBox key={m.id} match={m} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

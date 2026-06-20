import { useNavigate } from 'react-router-dom';
import type { Match } from '../types';
import { allTeams, groupMatchesByDate, relativeDayLabel, todayISO } from '../lib/dataHelpers';
import MatchCard from './MatchCard';

export default function MatchDayList({ matches }: { matches: Match[] }) {
  const navigate = useNavigate();
  const byDate = groupMatchesByDate(matches);
  const dates = Object.keys(byDate).sort();
  const today = todayISO();

  if (dates.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-10 text-center text-gray-500">
        No matches to show.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {dates.map(date => {
        const label = relativeDayLabel(date);
        const isToday = date === today;
        return (
          <section key={date}>
            <div className="flex items-center gap-3 mb-3.5">
              <h2 className="text-sm font-bold text-gray-200">{label}</h2>
              {isToday && (
                <span className="text-[11px] font-semibold text-gold bg-gold/10 rounded-full px-2 py-0.5">Live day</span>
              )}
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-gray-600">{byDate[date].length} matches</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {byDate[date].map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  homeTeam={allTeams[match.homeTeam]}
                  awayTeam={allTeams[match.awayTeam]}
                  onClick={() => navigate(`/match/${match.id}`)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

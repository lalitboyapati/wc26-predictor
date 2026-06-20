import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { allMatches, allTeams, groupMatchesByDate, formatMatchDate } from '../lib/dataHelpers';
import MatchCard from '../components/MatchCard';
import TopNav from '../components/TopNav';

export default function MatchListPage() {
  const navigate = useNavigate();
  const byDate = useMemo(() => groupMatchesByDate(allMatches), []);
  const sortedDates = useMemo(() => Object.keys(byDate).sort(), [byDate]);

  return (
    <div className="min-h-screen text-gray-200">
      <TopNav />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* heading */}
        <div className="mb-6 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-base tracking-[0.2em] text-white">MATCH SCHEDULE</h1>
            <p className="text-[11px] tracking-wider text-gray-500 mt-1">
              {allMatches.length} GROUP-STAGE FIXTURES · TAP A MATCH FOR FULL ANALYSIS &amp; BETS
            </p>
          </div>
          <p className="text-[10px] tracking-wider text-gray-600">SCORES = AI PREDICTIONS · TIMES IN ET</p>
        </div>

        {sortedDates.map(date => (
          <section key={date} className="mb-7">
            <div className="flex items-center gap-3 mb-2.5">
              <span className="text-[11px] tracking-[0.2em] text-accent/80">{formatMatchDate(date).toUpperCase()}</span>
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] tracking-wider text-gray-600">{byDate[date].length} MATCHES</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
        ))}

        <footer className="pt-6 pb-4 text-center text-[10px] tracking-wider text-gray-700">
          DATA: FIFA RANKINGS JUN 2026 · WC2026 SQUAD STATS · PREDICTIONS BY AI MODEL · FOR ENTERTAINMENT ONLY
        </footer>
      </main>
    </div>
  );
}

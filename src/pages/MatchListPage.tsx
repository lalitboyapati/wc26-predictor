import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { allMatches, allTeams, groupMatchesByDate, formatMatchDate } from '../lib/dataHelpers';
import MatchCard from '../components/MatchCard';
import TopNav from '../components/TopNav';

export default function MatchListPage() {
  const navigate = useNavigate();

  const byDate = useMemo(() => groupMatchesByDate(allMatches), []);
  const sortedDates = Object.keys(byDate).sort();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <TopNav />

      {/* Hero band */}
      <div className="bg-gradient-to-b from-violet-900/30 to-transparent border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <h2 className="text-lg font-bold text-white">Match Schedule</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Tap any fixture for win probabilities, lineups &amp; betting picks. Scores shown are AI predictions.
          </p>
        </div>
      </div>

      {/* Match list */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {sortedDates.map(date => (
          <section key={date}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                {formatMatchDate(date)}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent" />
              <span className="text-xs text-gray-600">{byDate[date].length} matches</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
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

        <footer className="pt-8 pb-4 text-center text-xs text-gray-700">
          Data: FIFA Rankings (Jun 2026) · Player stats: WC 2026 squads · Predictions: AI model
        </footer>
      </main>
    </div>
  );
}

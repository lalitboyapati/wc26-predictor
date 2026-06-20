import { useMemo } from 'react';
import { allMatches, todayISO } from '../lib/dataHelpers';
import MatchDayList from '../components/MatchDayList';
import TopNav from '../components/TopNav';

export default function UpcomingPage() {
  const upcoming = useMemo(() => {
    const today = todayISO();
    const future = allMatches.filter(m => m.date >= today);
    // Before the tournament every match is upcoming; if it's already over,
    // fall back to the full list so the page is never empty.
    return future.length > 0 ? future : allMatches;
  }, []);

  return (
    <div className="min-h-screen text-gray-100">
      <TopNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-5 py-7">
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Upcoming Matches</h1>
          <p className="text-sm text-gray-500 mt-1">
            Today and beyond — tap a fixture for the full prediction, lineups and betting picks.
          </p>
        </div>
        <MatchDayList matches={upcoming} />
        <footer className="pt-10 pb-4 text-center text-xs text-gray-600">
          FIFA rankings (Jun 2026) · WC2026 squad stats · AI predictions · for entertainment only
        </footer>
      </main>
    </div>
  );
}

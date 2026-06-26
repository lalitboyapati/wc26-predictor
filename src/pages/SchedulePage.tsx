import { useEffect } from 'react';
import { allMatches } from '../lib/dataHelpers';
import MatchDayList from '../components/MatchDayList';
import TopNav from '../components/TopNav';

export default function SchedulePage() {
  useEffect(() => { document.title = 'All Fixtures — WC26'; }, []);

  return (
    <div className="min-h-screen text-gray-100">
      <TopNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-5 py-7">
        <div className="mb-7 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">All Fixtures</h1>
            <p className="text-sm text-gray-400 mt-1">
              Full group stage — {allMatches.length} matches. Scores shown are AI predictions.
            </p>
          </div>
          <span className="text-xs text-gray-600">Kickoff times in ET</span>
        </div>
        <MatchDayList matches={allMatches} />
        <footer className="pt-10 pb-4 text-center text-xs text-gray-600">
          FIFA rankings (Jun 2026) · WC2026 squad stats · AI predictions · for entertainment only
        </footer>
      </main>
    </div>
  );
}

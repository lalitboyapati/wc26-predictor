import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { deriveGroups } from '../lib/groups';
import GroupStandings from '../components/GroupStandings';
import TopNav from '../components/TopNav';

export default function GroupsPage() {
  const navigate = useNavigate();
  const groups = useMemo(() => deriveGroups(), []);

  return (
    <div className="min-h-screen text-gray-100">
      <TopNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-5 py-7">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Group Standings</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Projected final tables. Top 2 plus the 8 best third-placed teams{' '}
              <button onClick={() => navigate('/bracket')} className="text-gold hover:underline font-medium">
                advance to the bracket
              </button>.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Qualify</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gold" /> Best 3rd</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(g => (
            <GroupStandings key={g.label} group={g} />
          ))}
        </div>
      </main>
    </div>
  );
}

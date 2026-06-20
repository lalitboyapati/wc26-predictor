import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { deriveGroups } from '../lib/groups';
import GroupStandings from '../components/GroupStandings';
import TopNav from '../components/TopNav';

export default function GroupsPage() {
  const navigate = useNavigate();
  const groups = useMemo(() => deriveGroups(), []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <TopNav />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-white">Group Standings</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Projected final tables — the AI model plays out all 6 group games for every team.
              The top 2 (🟢) and the 8 best 3rd-placed teams (🟡)
              <button onClick={() => navigate('/bracket')} className="text-fuchsia-400 hover:underline mx-1">
                seed the bracket</button>.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Qualify
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Best-3rd
            </span>
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

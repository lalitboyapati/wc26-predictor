import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { deriveGroups } from '../lib/groups';
import GroupStandings from '../components/GroupStandings';
import TopNav from '../components/TopNav';

export default function GroupsPage() {
  const navigate = useNavigate();
  const groups = useMemo(() => deriveGroups(), []);

  return (
    <div className="min-h-screen text-gray-200">
      <TopNav />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-base tracking-[0.2em] text-white">GROUP STANDINGS</h1>
            <p className="text-[11px] tracking-wider text-gray-500 mt-1 max-w-2xl leading-relaxed">
              PROJECTED FINAL TABLES — MODEL PLAYS OUT ALL 6 GROUP GAMES. TOP 2 +{' '}
              8 BEST 3RD-PLACED TEAMS{' '}
              <button onClick={() => navigate('/bracket')} className="text-accent hover:underline">
                SEED THE BRACKET →
              </button>
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px] tracking-wider text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-accent" /> QUALIFY</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-500" /> BEST-3RD</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(g => (
            <GroupStandings key={g.label} group={g} />
          ))}
        </div>
      </main>
    </div>
  );
}

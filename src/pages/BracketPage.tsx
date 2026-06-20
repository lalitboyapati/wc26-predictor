import { useMemo } from 'react';
import { buildBracket } from '../lib/bracket';
import { deriveGroups, getQualifiers } from '../lib/groups';
import Bracket from '../components/Bracket';
import TopNav from '../components/TopNav';

export default function BracketPage() {
  const rounds = useMemo(() => {
    const groups = deriveGroups();
    return buildBracket(getQualifiers(groups));
  }, []);

  return (
    <div className="min-h-screen text-gray-200">
      <TopNav />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-5">
          <h1 className="text-base tracking-[0.2em] text-white">KNOCKOUT BRACKET</h1>
          <p className="text-[11px] tracking-wider text-gray-500 mt-1 max-w-2xl leading-relaxed">
            FULL TOURNAMENT PROJECTION — 32 QUALIFIERS SEEDED FROM THE GROUP TABLES, EACH TIE RESOLVED
            BY THE MODEL THROUGH TO A PREDICTED CHAMPION.
          </p>
        </div>

        <div className="border border-white/10 bg-white/[0.01] p-4">
          <Bracket rounds={rounds} />
        </div>

        <p className="text-[10px] tracking-wider text-gray-600 mt-4">
          ▸ GREEN ROWS = PROJECTED WINNERS · QUALIFIERS PULLED DIRECTLY FROM PREDICTED GROUP STANDINGS
        </p>
      </main>
    </div>
  );
}

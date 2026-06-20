import { useMemo } from 'react';
import { buildBracket } from '../lib/bracket';
import { deriveGroups, getQualifiers } from '../lib/groups';
import Bracket from '../components/Bracket';
import TopNav from '../components/TopNav';

export default function BracketPage() {
  const rounds = useMemo(() => {
    const groups = deriveGroups();
    const qualifiers = getQualifiers(groups);
    return buildBracket(qualifiers);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <TopNav />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-white">Knockout Bracket</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            The AI model projects the full tournament: every group is played out, the 32 qualifiers
            are seeded from the group tables, and each knockout tie is resolved through to a
            predicted champion.
          </p>
        </div>

        <div className="rounded-xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 p-4">
          <Bracket rounds={rounds} />
        </div>

        <p className="text-xs text-gray-600 mt-4">
          🟩 Highlighted rows are projected winners. Qualifiers come straight from the predicted
          group standings.
        </p>
      </main>
    </div>
  );
}

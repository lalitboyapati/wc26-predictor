import { useEffect, useMemo } from 'react';
import { buildBracket } from '../lib/bracket';
import { deriveGroups, getQualifiers } from '../lib/groups';
import Bracket from '../components/Bracket';
import TopNav from '../components/TopNav';

export default function BracketPage() {
  useEffect(() => { document.title = 'Knockout Bracket — WC26'; }, []);

  const rounds = useMemo(() => {
    const groups = deriveGroups();
    return buildBracket(getQualifiers(groups));
  }, []);

  return (
    <div className="min-h-screen text-gray-100">
      <TopNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-5 py-7">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Knockout Bracket</h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            The full tournament projected out — 32 qualifiers seeded from the group tables, every tie
            resolved by the model through to a predicted champion.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <Bracket rounds={rounds} />
        </div>

        <p className="text-xs text-gray-600 mt-4">
          Gold rows are projected winners · qualifiers pulled from the predicted group standings.
        </p>
      </main>
    </div>
  );
}

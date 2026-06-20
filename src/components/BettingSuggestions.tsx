import type { BettingSuggestion } from '../types';

const TYPE_LABEL: Record<string, string> = {
  'over-under': 'TOTALS',
  'anytime-goalscorer': 'GOALSCORER',
  'btts': 'BTTS',
  'asian-handicap': 'HANDICAP',
  'player-shots': 'PLAYER PROP',
  'match-result': 'MATCH RESULT',
  'double-chance': 'DOUBLE CHANCE',
};

function confColor(v: number) {
  return v >= 65 ? 'text-accent' : v >= 50 ? 'text-amber-400' : 'text-gray-400';
}
function confBar(v: number) {
  return v >= 65 ? 'bg-accent' : v >= 50 ? 'bg-amber-400' : 'bg-gray-500';
}

export default function BettingSuggestions({ suggestions }: { suggestions: BettingSuggestion[] }) {
  return (
    <div className="border border-accent/20 bg-accent/[0.03]">
      {/* header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-accent/20">
        <span className="text-[11px] tracking-[0.2em] text-accent">▸ TOP BETTING PICKS</span>
        <span className="text-[10px] tracking-wider text-gray-600">MODEL CONFIDENCE · EST. ODDS</span>
      </div>

      <div className="divide-y divide-white/5">
        {suggestions.map((s, i) => (
          <div key={i} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] tracking-wider text-gray-500 border border-white/10 px-1.5 py-0.5">
                    {TYPE_LABEL[s.type] ?? 'BET'}
                  </span>
                  <span className="text-sm text-white font-semibold leading-tight">{s.label}</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{s.rationale}</p>
              </div>

              {/* odds + confidence */}
              <div className="flex-shrink-0 text-right">
                <div className="text-base font-bold text-accent tabular-nums">{s.oddsEstimate}</div>
                <div className={`text-[10px] tracking-wider tabular-nums ${confColor(s.confidence)}`}>{s.confidence}%</div>
              </div>
            </div>

            {/* confidence bar */}
            <div className="mt-2 h-1 w-full bg-white/5 overflow-hidden">
              <div className={`h-full ${confBar(s.confidence)}`} style={{ width: `${s.confidence}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

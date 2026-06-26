import type { BettingSuggestion } from '../types';

const TYPE_LABEL: Record<string, string> = {
  'over-under': 'Totals',
  'anytime-goalscorer': 'Goalscorer',
  'btts': 'BTTS',
  'asian-handicap': 'Handicap',
  'player-shots': 'Player Prop',
  'match-result': 'Match Result',
  'double-chance': 'Double Chance',
};

function ConfidenceRing({ value }: { value: number }) {
  const color = value >= 65 ? 'var(--color-gold)' : value >= 50 ? 'var(--color-sky)' : 'var(--color-muted)';
  const r = 15;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="relative w-11 h-11 flex-shrink-0">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[11px] font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function ValueChip({ edge }: { edge: number }) {
  const positive = edge >= 1.5;
  const negative = edge <= -1.5;
  const cls = positive
    ? 'text-emerald-300 bg-emerald-500/12'
    : negative
    ? 'text-gray-400 bg-white/[0.04]'
    : 'text-gray-400 bg-white/[0.04]';
  const arrow = positive ? '▲' : negative ? '▼' : '•';
  const sign = edge > 0 ? '+' : '';
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded-md px-1.5 py-0.5 ${cls}`}>
      {arrow} {sign}{edge.toFixed(1)}% {positive ? 'value' : 'edge'}
    </span>
  );
}

export default function BettingSuggestions({ suggestions }: { suggestions: BettingSuggestion[] }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.014] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <h3 className="text-sm font-bold text-white">Top Betting Picks</h3>
        <span className="text-[11px] text-gray-400">model % · odds · value</span>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
            <ConfidenceRing value={s.confidence} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-semibold text-gray-400 bg-white/[0.05] rounded-md px-1.5 py-0.5">
                  {TYPE_LABEL[s.type] ?? 'Bet'}
                </span>
                <span className="text-sm font-semibold text-white truncate">{s.label}</span>
              </div>
              <p className="text-[12px] text-gray-400 leading-snug">{s.rationale}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-base font-extrabold text-gold tabular-nums leading-none">{s.oddsEstimate}</div>
              <div className="text-[10px] text-gray-500 mt-0.5 tabular-nums">{s.impliedPct}% implied</div>
              <div className="mt-1.5"><ValueChip edge={s.edge} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2.5 border-t border-white/[0.06] text-[10.5px] text-gray-500 leading-snug">
        <span className="text-emerald-300/80 font-semibold">Value</span> = model probability minus the odds-implied
        probability. Positive means the model rates the bet higher than the price suggests.
      </div>
    </div>
  );
}

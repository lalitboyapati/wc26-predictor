import type { BettingSuggestion } from '../types';

interface Props {
  suggestions: BettingSuggestion[];
}

const TYPE_ICONS: Record<string, string> = {
  'over-under': '⚽',
  'anytime-goalscorer': '🎯',
  'btts': '🔥',
  'asian-handicap': '📊',
  'player-shots': '💥',
};

function ConfidenceRing({ value }: { value: number }) {
  const color =
    value >= 70 ? '#22c55e' :
    value >= 55 ? '#eab308' : '#6b7280';
  const dash = Math.round((value / 100) * 88);
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r="14" fill="none" stroke="#374151" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="14"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${dash} 88`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>
        {value}%
      </span>
    </div>
  );
}

export default function BettingSuggestions({ suggestions }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        Top 3 Betting Suggestions
      </h3>
      {suggestions.map((s, i) => (
        <div
          key={i}
          className="flex items-start gap-4 p-4 rounded-xl bg-indigo-900/20 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors"
        >
          <div className="flex-shrink-0 text-2xl pt-0.5">{TYPE_ICONS[s.type] ?? '🎲'}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-semibold text-white text-sm leading-tight">{s.label}</span>
              <span className="flex-shrink-0 font-mono text-xs text-indigo-300 bg-indigo-900/40 px-2 py-0.5 rounded">
                {s.oddsEstimate}
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">{s.rationale}</p>
          </div>
          <ConfidenceRing value={s.confidence} />
        </div>
      ))}
    </div>
  );
}

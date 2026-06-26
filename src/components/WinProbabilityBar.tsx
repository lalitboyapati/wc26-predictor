import type { MatchPrediction, PolymarketOdds } from '../types';

interface Props {
  prediction: MatchPrediction;
  homeTeam: string;
  awayTeam: string;
  liveOdds?: PolymarketOdds;
}

// Fair model odds — the implied probability of these equals the % shown,
// so the odds and percentages on this board never disagree.
function impliedOdds(pct: number): string {
  if (pct <= 0) return '–';
  return (1 / (pct / 100)).toFixed(2);
}

export default function WinProbabilityBar({ prediction, homeTeam, awayTeam, liveOdds }: Props) {
  const home = liveOdds?.homeWin ?? prediction.homeWin;
  const draw = liveOdds?.draw ?? prediction.draw;
  const away = liveOdds?.awayWin ?? prediction.awayWin;
  const usingLive = liveOdds?.source === 'polymarket';

  const cols = [
    { label: homeTeam, pct: home, accent: 'text-sky-300', bar: 'bg-sky-400' },
    { label: 'Draw', pct: draw, accent: 'text-gray-300', bar: 'bg-zinc-600' },
    { label: awayTeam, pct: away, accent: 'text-rose-300', bar: 'bg-rose-400' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-sm font-bold text-white">Match Odds</h3>
        {usingLive
          ? <span className="text-[11px] font-medium rounded-full px-2 py-0.5 text-emerald-300 bg-emerald-500/10">Polymarket live</span>
          : <span className="text-[11px] font-medium rounded-full px-2 py-0.5 text-gray-300 border border-white/[0.12]">AI model</span>
        }
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-3.5">
        {cols.map((c, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-2 py-3 text-center">
            <div className={`text-[12px] font-medium truncate ${c.accent}`}>{c.label}</div>
            <div className="text-xl font-extrabold text-white tabular-nums leading-tight mt-1">{impliedOdds(c.pct)}</div>
            <div className="text-[11px] text-gray-400 tabular-nums">{c.pct}%</div>
          </div>
        ))}
      </div>

      <div className="flex h-2 w-full overflow-hidden rounded-full gap-0.5">
        <div className="bg-home rounded-l-full" style={{ width: `${home}%` }} />
        <div className="bg-draw" style={{ width: `${draw}%` }} />
        <div className="bg-away rounded-r-full" style={{ width: `${away}%` }} />
      </div>

      <div className="flex justify-between items-center text-[12px] text-gray-400 mt-3">
        <span>xG <span className="text-sky-300 font-semibold tabular-nums">{prediction.xGHome}</span></span>
        <span className="text-gray-400 capitalize">{prediction.confidence} confidence</span>
        <span>xG <span className="text-rose-300 font-semibold tabular-nums">{prediction.xGAway}</span></span>
      </div>

      {usingLive && liveOdds?.marketUrl && (
        <a href={liveOdds.marketUrl} target="_blank" rel="noopener noreferrer"
          className="inline-block mt-3 text-[12px] text-emerald-300/80 hover:text-emerald-300">
          View on Polymarket →
        </a>
      )}
    </div>
  );
}

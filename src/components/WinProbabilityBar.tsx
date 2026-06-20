import type { MatchPrediction, PolymarketOdds } from '../types';

interface Props {
  prediction: MatchPrediction;
  homeTeam: string;
  awayTeam: string;
  liveOdds?: PolymarketOdds;
}

// Fair decimal odds from a probability (with a small book margin).
function impliedOdds(pct: number): string {
  if (pct <= 0) return '–';
  return ((1 / (pct / 100)) * 0.94).toFixed(2);
}

export default function WinProbabilityBar({ prediction, homeTeam, awayTeam, liveOdds }: Props) {
  const displayHome = liveOdds?.homeWin ?? prediction.homeWin;
  const displayDraw = liveOdds?.draw    ?? prediction.draw;
  const displayAway = liveOdds?.awayWin ?? prediction.awayWin;
  const usingLive = liveOdds?.source === 'polymarket';

  const cols = [
    { label: homeTeam, pct: displayHome, color: 'text-accent', bar: 'bg-accent' },
    { label: 'DRAW', pct: displayDraw, color: 'text-gray-300', bar: 'bg-gray-600' },
    { label: awayTeam, pct: displayAway, color: 'text-sky-400', bar: 'bg-sky-400/80' },
  ];

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] tracking-[0.2em] text-gray-400">▸ MATCH ODDS (1X2)</span>
        <span className={`text-[10px] tracking-wider px-1.5 py-0.5 border ${usingLive ? 'border-accent/40 text-accent' : 'border-white/10 text-gray-500'}`}>
          {usingLive ? 'POLYMARKET LIVE' : 'AI MODEL'}
        </span>
      </div>

      {/* three outcome cells with implied odds */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {cols.map((c, i) => (
          <div key={i} className="border border-white/10 bg-white/[0.02] px-2 py-2 text-center">
            <div className={`text-[10px] tracking-wider truncate ${c.color}`}>{c.label}</div>
            <div className="text-lg font-bold text-white tabular-nums leading-tight mt-0.5">{impliedOdds(c.pct)}</div>
            <div className="text-[10px] text-gray-500 tabular-nums">{c.pct}%</div>
          </div>
        ))}
      </div>

      {/* stacked bar */}
      <div className="flex h-2 w-full overflow-hidden gap-px">
        <div className="bg-accent" style={{ width: `${displayHome}%` }} />
        <div className="bg-gray-600" style={{ width: `${displayDraw}%` }} />
        <div className="bg-sky-400/80" style={{ width: `${displayAway}%` }} />
      </div>

      {/* xG + confidence */}
      <div className="flex justify-between items-center text-[11px] text-gray-500 mt-3">
        <span>xG <span className="text-accent tabular-nums">{prediction.xGHome}</span></span>
        <span className="tracking-wider text-gray-600">{prediction.confidence.toUpperCase()} CONFIDENCE</span>
        <span>xG <span className="text-sky-400 tabular-nums">{prediction.xGAway}</span></span>
      </div>

      {usingLive && liveOdds?.marketUrl && (
        <a href={liveOdds.marketUrl} target="_blank" rel="noopener noreferrer"
          className="inline-block mt-3 text-[11px] text-accent/70 hover:text-accent tracking-wider">
          VIEW ON POLYMARKET →
        </a>
      )}
    </div>
  );
}

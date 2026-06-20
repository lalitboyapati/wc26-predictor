import type { MatchPrediction, PolymarketOdds } from '../types';

interface Props {
  prediction: MatchPrediction;
  homeTeam: string;
  awayTeam: string;
  liveOdds?: PolymarketOdds;
}

export default function WinProbabilityBar({ prediction, homeTeam, awayTeam, liveOdds }: Props) {
  const { homeWin, draw, awayWin } = prediction;

  // Use Polymarket odds if available, otherwise fall back to our prediction
  const displayHome = liveOdds?.homeWin ?? homeWin;
  const displayDraw = liveOdds?.draw    ?? draw;
  const displayAway = liveOdds?.awayWin ?? awayWin;
  const usingLive   = liveOdds?.source === 'polymarket';

  return (
    <div className="space-y-3">
      {/* Source badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Win Probability
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
          ${usingLive
            ? 'bg-green-500/10 border-green-500/40 text-green-400'
            : 'bg-gray-700/50 border-gray-600 text-gray-500'
          }`}
        >
          {usingLive ? '🟢 Polymarket Live' : '🤖 AI Model'}
        </span>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-sm font-semibold mb-1">
        <span className="text-green-400">{homeTeam}</span>
        <span className="text-yellow-400">Draw</span>
        <span className="text-blue-400">{awayTeam}</span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-8 rounded-lg overflow-hidden gap-0.5">
        <div
          className="flex items-center justify-center bg-green-600 text-white text-xs font-bold transition-all duration-700"
          style={{ width: `${displayHome}%` }}
        >
          {displayHome}%
        </div>
        <div
          className="flex items-center justify-center bg-yellow-600 text-white text-xs font-bold transition-all duration-700"
          style={{ width: `${displayDraw}%`, minWidth: displayDraw > 0 ? '32px' : 0 }}
        >
          {displayDraw > 5 ? `${displayDraw}%` : ''}
        </div>
        <div
          className="flex items-center justify-center bg-blue-600 text-white text-xs font-bold transition-all duration-700"
          style={{ width: `${displayAway}%` }}
        >
          {displayAway}%
        </div>
      </div>

      {/* xG row */}
      <div className="flex justify-between text-xs text-gray-500 pt-1">
        <span>xG: <span className="text-gray-300 font-mono">{prediction.xGHome}</span></span>
        <span className={`text-xs ${
          prediction.confidence === 'high' ? 'text-green-500' :
          prediction.confidence === 'medium' ? 'text-yellow-500' : 'text-gray-500'
        }`}>
          {prediction.confidence} confidence
        </span>
        <span>xG: <span className="text-gray-300 font-mono">{prediction.xGAway}</span></span>
      </div>

      {usingLive && liveOdds?.marketUrl && (
        <a
          href={liveOdds.marketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-green-400/70 hover:text-green-400 underline"
        >
          View on Polymarket →
        </a>
      )}
    </div>
  );
}

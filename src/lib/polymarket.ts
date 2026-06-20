import type { PolymarketOdds } from '../types';

interface PolymarketMarket {
  id: string;
  question: string;
  outcomePrices?: string;   // JSON array of stringified numbers
  outcomes?: string;        // JSON array of outcome labels
  active: boolean;
  closed: boolean;
  volume?: number;
}

/**
 * Fetch real-time match odds from Polymarket's public Gamma API.
 * No API key required. Falls back gracefully on CORS/network errors.
 */
export async function fetchPolymarketOdds(
  homeTeam: string,
  awayTeam: string
): Promise<PolymarketOdds> {
  try {
    const query = encodeURIComponent(`${homeTeam} ${awayTeam} 2026`);
    const url = `https://gamma-api.polymarket.com/markets?q=${query}&closed=false&limit=10`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const markets: PolymarketMarket[] = await res.json();

    // Find a market that mentions both teams and has outcome prices
    const matchMarket = markets.find(m => {
      const q = m.question.toLowerCase();
      const h = homeTeam.toLowerCase();
      const a = awayTeam.toLowerCase();
      return (q.includes(h) || q.includes(h.split(' ')[0])) &&
             (q.includes(a) || q.includes(a.split(' ')[0])) &&
             m.outcomePrices && m.active;
    });

    if (!matchMarket) {
      // Try broader search — just home team "win"
      const broader = markets.find(m => {
        const q = m.question.toLowerCase();
        return q.includes(homeTeam.toLowerCase().split(' ')[0]) && q.includes('win');
      });
      if (!broader?.outcomePrices) return { source: 'none' };
      return parseWinMarket(broader);
    }

    return parseWinMarket(matchMarket);
  } catch {
    return { source: 'none' };
  }
}

function parseWinMarket(market: PolymarketMarket): PolymarketOdds {
  try {
    const prices: number[] = JSON.parse(market.outcomePrices ?? '[]').map(Number);
    const outcomes: string[] = JSON.parse(market.outcomes ?? '[]');

    if (prices.length === 0) return { source: 'none' };

    // 3-way market (Win / Draw / Win)
    if (prices.length === 3) {
      const [p0, p1, p2] = prices;
      return {
        homeWin: Math.round(p0 * 100),
        draw:    Math.round(p1 * 100),
        awayWin: Math.round(p2 * 100),
        marketUrl: `https://polymarket.com/market/${market.id}`,
        source: 'polymarket',
      };
    }

    // 2-way market — just home/away
    if (prices.length === 2) {
      const [p0, p1] = prices;
      const homeLabel = outcomes[0]?.toLowerCase() ?? '';
      if (homeLabel.includes('draw') || homeLabel.includes('tie')) {
        return {
          draw:    Math.round(p0 * 100),
          awayWin: Math.round(p1 * 100),
          source: 'polymarket',
          marketUrl: `https://polymarket.com/market/${market.id}`,
        };
      }
      return {
        homeWin: Math.round(p0 * 100),
        awayWin: Math.round(p1 * 100),
        source: 'polymarket',
        marketUrl: `https://polymarket.com/market/${market.id}`,
      };
    }

    return { source: 'none' };
  } catch {
    return { source: 'none' };
  }
}

// External API data fetching utilities
import { PricePoint, LongShortData, PortfolioItem } from './types.js';

const COIN_ID_MAP: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'DOT': 'polkadot',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'MATIC': 'matic-network'
};

export async function searchCoinGecko(query: string): Promise<{ id: string; symbol: string; name: string } | null> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (data.coins && data.coins.length > 0) {
      return {
        id: data.coins[0].id,
        symbol: data.coins[0].symbol.toUpperCase(),
        name: data.coins[0].name
      };
    }
    return null;
  } catch (error) {
    console.error("CoinGecko Search Error:", error);
    return null;
  }
}

export async function getPriceAction(coinId: string): Promise<{ history: PricePoint[], currentPrice: number } | null> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7&interval=daily`);
    const data = await response.json();
    
    if (!data.prices || data.prices.length === 0) return null;

    const history: PricePoint[] = data.prices.map((p: [number, number]) => {
      const date = new Date(p[0]);
      return {
        time: `${date.getMonth() + 1}/${date.getDate()}`,
        price: p[1]
      };
    });

    const currentPrice = data.prices[data.prices.length - 1][1];
    return { history, currentPrice };
  } catch (error) {
    console.error("Price Action Error:", error);
    return null;
  }
}

export async function getSentiment(): Promise<number> {
  try {
    const response = await fetch('https://api.alternative.me/fng/?limit=1');
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return parseInt(data.data[0].value, 10);
    }
    return 50;
  } catch (error) {
    console.error("Sentiment Error:", error);
    return 50;
  }
}

export async function getLongShortRatio(symbol: string): Promise<LongShortData[] | null> {
  try {
    const pair = `${symbol}USDT`;
    const response = await fetch(`https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=${pair}&period=1d&limit=7`);
    
    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data)) return null;

    return data.map((item: any) => {
        const date = new Date(item.timestamp);
        return {
            time: `${date.getMonth() + 1}/${date.getDate()}`,
            long: parseFloat((parseFloat(item.longAccount) * 100).toFixed(1)),
            short: parseFloat((parseFloat(item.shortAccount) * 100).toFixed(1))
        };
    });
  } catch (error) {
    console.warn(`Binance L/S Error for ${symbol}:`, error);
    return null;
  }
}

export async function updatePortfolioRealTime(portfolio: PortfolioItem[]): Promise<PortfolioItem[]> {
  try {
    const coinIds = portfolio.map(p => COIN_ID_MAP[p.symbol] || p.symbol.toLowerCase()).join(',');
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`);
    const prices = await response.json();

    return portfolio.map(item => {
      const coinId = COIN_ID_MAP[item.symbol] || item.symbol.toLowerCase();
      const newPrice = prices[coinId]?.usd || item.currentPrice;
      return { ...item, currentPrice: newPrice };
    });
  } catch (error) {
    console.error("Portfolio Update Error:", error);
    return portfolio;
  }
}

import { MarketData } from '../types/chat';

const API_KEY = import.meta.env.VITE_POLYGON_API_KEY;
const BASE_URL = 'https://api.polygon.io/v2';

// Fallback data in case the API is unavailable
const FALLBACK_DATA: MarketData[] = [
  { symbol: 'SPY', price: 500.00, change: 0, changePercent: 0 },
  { symbol: 'AGG', price: 108.00, change: 0, changePercent: 0 },
  { symbol: 'BIL', price: 91.50, change: 0, changePercent: 0 }
];

export async function getMarketData(symbols: string[]): Promise<MarketData[]> {
  if (!API_KEY) {
    console.warn('Polygon API key not found. Using fallback market data.');
    return FALLBACK_DATA;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/snapshot/locale/us/markets/stocks/tickers?tickers=${symbols.join(',')}&apiKey=${API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error (${response.status}): ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.tickers || !Array.isArray(data.tickers) || data.tickers.length === 0) {
      console.warn('No market data available from API. Using fallback data.');
      return FALLBACK_DATA;
    }

    return data.tickers.map((ticker: any) => ({
      symbol: ticker.ticker,
      price: ticker.lastTrade?.p || ticker.prevDay?.c || 0,
      change: ticker.todaysChange || 0,
      changePercent: ticker.todaysChangePerc || 0,
    }));
  } catch (error) {
    console.error('Error fetching market data:', error);
    return FALLBACK_DATA;
  }
}

export function getInvestmentRecommendation(
  riskTolerance: string,
  age: number
): { stocks: number; bonds: number; cash: number } {
  // Basic asset allocation based on risk tolerance and age
  const baseAllocation = {
    low: { stocks: 40, bonds: 50, cash: 10 },
    moderate: { stocks: 60, bonds: 35, cash: 5 },
    high: { stocks: 80, bonds: 15, cash: 5 },
  }[riskTolerance] || { stocks: 60, bonds: 35, cash: 5 };

  // Adjust for age (reduce stocks as age increases)
  const ageAdjustment = Math.min(Math.max(age - 30, 0), 30) / 2;
  
  return {
    stocks: Math.max(baseAllocation.stocks - ageAdjustment, 20),
    bonds: Math.min(baseAllocation.bonds + ageAdjustment, 70),
    cash: baseAllocation.cash,
  };
}
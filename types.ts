export interface RawFundData {
  [key: string]: any;
}

export interface FundDataPoint {
  date: string;
  price: number; // NAV or Unit Price
  timestamp: number;
}

export interface FundCollection {
  [fundName: string]: FundDataPoint[];
}

export interface FundSummary {
  name: string;
  currentPrice: number;
  oneYearReturn: number;
  ytdReturn: number;
  volatility: number; // Standard deviation of returns
  minPrice: number;
  maxPrice: number;
  lastUpdated: string;
}

export enum ViewMode {
  MANAGER = 'MANAGER',
  INVESTOR = 'INVESTOR'
}

export interface AiAnalysisResult {
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  keyPoints: string[];
}

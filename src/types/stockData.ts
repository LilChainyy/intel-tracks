// Simplified stock data structure - education-focused, no fluff

export interface StockProfile {
  // Identity
  ticker: string;
  name: string;
  description: string; // What the company does, 2-3 sentences

  // Classification
  sector: string;
  industry: string;
  themes: string[]; // Your curated theme tags

  // Size/Price
  marketCap: number;
  marketCapDisplay: string; // "$2.8T"
  price: number;
  priceDisplay: string; // "$175.43"

  // Learning Context
  keyProducts: string[]; // Max 5
  whyItMatters: string; // Investment relevance, 1-2 sentences

  // Activity
  news: NewsItem[]; // Last 5, from past 30 days

  // Metadata
  updatedAt: string; // ISO timestamp
}

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

export interface StockError {
  type: 'not_found' | 'rate_limit' | 'service_down';
  message: string;
  suggestion?: string; // "Did you mean AAPL?"
}

export type StockResult =
  | { ok: true; data: StockProfile }
  | { ok: false; error: StockError };

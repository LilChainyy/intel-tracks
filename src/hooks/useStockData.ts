import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StockQuote {
  ticker: string;
  currentPrice: number;
  ytdChange: number;
  isPositive: boolean;
  lastUpdated: string;
}

interface StockDataState {
  data: Record<string, StockQuote | null>;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

// Local storage cache key
const CACHE_KEY = 'stock_data_cache';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData {
  data: Record<string, StockQuote | null>;
  timestamp: number;
}

function getFromCache(): CachedData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsed: CachedData = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveToCache(data: Record<string, StockQuote | null>) {
  try {
    const cacheData: CachedData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

export function useStockData(tickers: string[]) {
  const [state, setState] = useState<StockDataState>({
    data: {},
    isLoading: true,
    error: null,
    lastFetched: null,
  });

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Check local cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = getFromCache();
      if (cached) {
        // Check if we have all requested tickers
        const missingTickers = tickers.filter(t => !(t in cached.data));
        if (missingTickers.length === 0) {
          setState({
            data: cached.data,
            isLoading: false,
            error: null,
            lastFetched: new Date(cached.timestamp),
          });
          return;
        }
      }
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
        body: { tickers },
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch stock data');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const stockData = data.data as Record<string, StockQuote | null>;
      
      // Save to local cache
      saveToCache(stockData);

      setState({
        data: stockData,
        isLoading: false,
        error: null,
        lastFetched: new Date(),
      });
    } catch (error) {
      console.error('Error fetching stock data:', error);
      
      // Try to use cached data as fallback
      const cached = getFromCache();
      if (cached) {
        setState({
          data: cached.data,
          isLoading: false,
          error: 'Using cached data. Live data unavailable.',
          lastFetched: new Date(cached.timestamp),
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch stock data',
        }));
      }
    }
  }, [tickers.join(',')]);

  useEffect(() => {
    if (tickers.length > 0) {
      fetchData();
    }
  }, [fetchData, tickers.length]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const getStockData = useCallback((ticker: string): StockQuote | null => {
    return state.data[ticker] || null;
  }, [state.data]);

  const formatYtdChange = useCallback((ticker: string): string => {
    const stock = state.data[ticker];
    if (!stock) return 'N/A';
    const sign = stock.isPositive ? '+' : '';
    return `${sign}${stock.ytdChange.toFixed(1)}%`;
  }, [state.data]);

  return {
    ...state,
    refresh,
    getStockData,
    formatYtdChange,
  };
}

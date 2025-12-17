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

export function useStockData(tickers: string[]) {
  const [state, setState] = useState<StockDataState>({
    data: {},
    isLoading: true,
    error: null,
    lastFetched: null,
  });

  const fetchData = useCallback(async () => {
    if (tickers.length === 0) {
      setState({ data: {}, isLoading: false, error: null, lastFetched: new Date() });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch from database directly - instant!
      const { data, error } = await supabase
        .from('stock_quotes')
        .select('*')
        .in('ticker', tickers);

      if (error) {
        throw new Error(error.message);
      }

      const stockData: Record<string, StockQuote | null> = {};
      
      // Initialize all requested tickers with null
      tickers.forEach(ticker => {
        stockData[ticker] = null;
      });

      // Map database results to our format
      if (data) {
        data.forEach((row: { ticker: string; current_price: number | null; ytd_change: number | null; is_positive: boolean | null; last_updated: string | null }) => {
          stockData[row.ticker] = {
            ticker: row.ticker,
            currentPrice: row.current_price || 0,
            ytdChange: row.ytd_change || 0,
            isPositive: row.is_positive || false,
            lastUpdated: row.last_updated || new Date().toISOString(),
          };
        });
      }

      setState({
        data: stockData,
        isLoading: false,
        error: null,
        lastFetched: new Date(),
      });
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stock data',
      }));
    }
  }, [tickers.join(',')]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
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

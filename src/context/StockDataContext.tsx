import React, { createContext, useContext, useMemo } from 'react';
import { useStockData, StockQuote } from '@/hooks/useStockData';
import { playlists } from '@/data/playlists';

interface StockDataContextType {
  data: Record<string, StockQuote | null>;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  refresh: () => void;
  getStockData: (ticker: string) => StockQuote | null;
  formatYtdChange: (ticker: string) => string;
  getBenchmarkPerformance: (playlistId: string) => {
    performance: string;
    isPositive: boolean;
    isLoading: boolean;
  };
}

const StockDataContext = createContext<StockDataContextType | undefined>(undefined);

export function StockDataProvider({ children }: { children: React.ReactNode }) {
  // Collect all unique tickers from playlists
  const allTickers = useMemo(() => {
    const tickerSet = new Set<string>();
    
    playlists.forEach(playlist => {
      // Add benchmark ticker
      tickerSet.add(playlist.benchmarkTicker);
      
      // Add stock tickers (only non-private ones that have valid tickers)
      playlist.stocks.forEach(stock => {
        if (!stock.isPrivate && stock.ticker && stock.ticker.length <= 5) {
          tickerSet.add(stock.ticker);
        }
      });
    });
    
    return Array.from(tickerSet);
  }, []);

  const stockData = useStockData(allTickers);

  const getBenchmarkPerformance = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return { performance: 'N/A', isPositive: false, isLoading: false };
    }

    if (stockData.isLoading) {
      return { performance: 'Loading...', isPositive: true, isLoading: true };
    }

    const benchmarkData = stockData.getStockData(playlist.benchmarkTicker);
    if (!benchmarkData) {
      // Fallback to hardcoded data if API fails
      return {
        performance: playlist.benchmarkPerformance,
        isPositive: playlist.isPositivePerformance,
        isLoading: false,
      };
    }

    const sign = benchmarkData.isPositive ? '+' : '';
    return {
      performance: `${sign}${benchmarkData.ytdChange.toFixed(0)}% YTD`,
      isPositive: benchmarkData.isPositive,
      isLoading: false,
    };
  };

  const value: StockDataContextType = {
    ...stockData,
    getBenchmarkPerformance,
  };

  return (
    <StockDataContext.Provider value={value}>
      {children}
    </StockDataContext.Provider>
  );
}

export function useStockDataContext() {
  const context = useContext(StockDataContext);
  if (context === undefined) {
    throw new Error('useStockDataContext must be used within a StockDataProvider');
  }
  return context;
}

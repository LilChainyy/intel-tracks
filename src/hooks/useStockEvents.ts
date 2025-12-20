import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChartDataPoint {
  date: string;
  timestamp: number;
  price: number;
}

export interface StockEvent {
  date: string;
  type: 'earnings' | 'dividend' | 'fed_meeting' | 'cpi' | 'jobs_report' | 'gdp';
  name: string;
  description?: string;
  importance?: string;
}

export interface StockEventsData {
  chartData: ChartDataPoint[];
  events: StockEvent[];
  currentPrice: number;
  periodChange: number;
  periodChangePercent: number;
}

type TimeRange = '1W' | '1M' | '3M' | '1Y' | 'YTD';

interface UseStockEventsReturn {
  data: StockEventsData | null;
  isLoading: boolean;
  error: string | null;
  range: TimeRange;
  setRange: (range: TimeRange) => void;
}

export function useStockEvents(ticker: string): UseStockEventsReturn {
  const [data, setData] = useState<StockEventsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>('1M');

  const fetchData = useCallback(async () => {
    if (!ticker) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('stock-events', {
        body: { ticker, range }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (functionData?.error) {
        throw new Error(functionData.error);
      }

      setData(functionData as StockEventsData);
    } catch (err) {
      console.error('Error fetching stock events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setIsLoading(false);
    }
  }, [ticker, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, range, setRange };
}

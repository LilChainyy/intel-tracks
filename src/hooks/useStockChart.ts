import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChartDataPoint {
  timestamp: number;
  date: string;
  price: number;
}

export interface StockEvent {
  date: string;
  timestamp: number;
  type: 'earnings' | 'dividend' | 'ex-dividend' | 'fed_meeting' | 'cpi' | 'jobs_report';
  title: string;
}

export interface MacroEvent {
  id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  importance: string | null;
  description: string | null;
}

export interface StockChartData {
  ticker: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  chartData: ChartDataPoint[];
  events: StockEvent[];
  range: string;
  isPositive: boolean;
}

export type ChartRange = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y';

export function useStockChart(ticker: string) {
  const [data, setData] = useState<StockChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<ChartRange>('YTD');

  const fetchChartData = useCallback(async (selectedRange: ChartRange) => {
    if (!ticker) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch chart data from edge function
      const { data: chartResponse, error: chartError } = await supabase.functions.invoke('stock-chart', {
        body: { ticker, range: selectedRange },
      });

      if (chartError) {
        throw new Error(chartError.message);
      }

      // Fetch macro events from database
      const today = new Date().toISOString().split('T')[0];
      const { data: macroEvents, error: macroError } = await supabase
        .from('macro_events')
        .select('*')
        .gte('event_date', today)
        .order('event_date', { ascending: true });

      if (macroError) {
        console.error('Error fetching macro events:', macroError);
      }

      // Combine stock events with macro events
      const allEvents: StockEvent[] = [...(chartResponse.events || [])];
      
      if (macroEvents) {
        macroEvents.forEach((event: MacroEvent) => {
          allEvents.push({
            date: event.event_date,
            timestamp: new Date(event.event_date).getTime() / 1000,
            type: event.event_type as StockEvent['type'],
            title: event.event_name,
          });
        });
      }

      // Sort events by date
      allEvents.sort((a, b) => a.timestamp - b.timestamp);

      setData({
        ...chartResponse,
        events: allEvents,
        isPositive: chartResponse.priceChangePercent >= 0,
      });
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
    } finally {
      setIsLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchChartData(range);
  }, [fetchChartData, range]);

  const changeRange = useCallback((newRange: ChartRange) => {
    setRange(newRange);
  }, []);

  return {
    data,
    isLoading,
    error,
    range,
    changeRange,
    refresh: () => fetchChartData(range),
  };
}

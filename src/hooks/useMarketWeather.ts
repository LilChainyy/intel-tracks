import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MarketIndicators {
  vix: { value: number; change: number };
  sp500: { price: number; ma200: number; aboveMa: boolean };
  sectors: { tech: number; energy: number; finance: number; healthcare: number };
}

export interface MarketWeatherData {
  id: string;
  regime_type: string;
  headline: string;
  summary: string;
  indicators: MarketIndicators;
  created_at: string;
  expires_at: string;
}

interface UseMarketWeatherReturn {
  data: MarketWeatherData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMarketWeather(): UseMarketWeatherReturn {
  const [data, setData] = useState<MarketWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('market-weather');

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (functionData?.error) {
        throw new Error(functionData.error);
      }

      setData(functionData as MarketWeatherData);
    } catch (err) {
      console.error('Error fetching market weather:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market weather');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return { data, isLoading, error, refresh: fetchWeather };
}

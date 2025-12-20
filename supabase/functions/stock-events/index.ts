import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChartDataPoint {
  date: string;
  timestamp: number;
  price: number;
}

interface StockEvent {
  date: string;
  type: 'earnings' | 'dividend' | 'fed_meeting' | 'cpi' | 'jobs_report' | 'gdp';
  name: string;
  description?: string;
  importance?: string;
}

interface StockEventsResponse {
  chartData: ChartDataPoint[];
  events: StockEvent[];
  currentPrice: number;
  periodChange: number;
  periodChangePercent: number;
}

async function fetchYahooChartData(
  ticker: string,
  range: string
): Promise<{ chartData: ChartDataPoint[]; currentPrice: number; events: StockEvent[] } | null> {
  try {
    // Map range to Yahoo Finance parameters
    const rangeMap: Record<string, { range: string; interval: string }> = {
      '1W': { range: '5d', interval: '15m' },
      '1M': { range: '1mo', interval: '1h' },
      '3M': { range: '3mo', interval: '1d' },
      '1Y': { range: '1y', interval: '1d' },
      'YTD': { range: 'ytd', interval: '1d' },
    };

    const params = rangeMap[range] || rangeMap['1M'];
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=${params.range}&interval=${params.interval}&events=div,earnings`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      console.error(`Yahoo Finance error for ${ticker}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result) {
      console.error(`No data for ${ticker}`);
      return null;
    }

    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    const currentPrice = result.meta?.regularMarketPrice || closes[closes.length - 1];

    // Build chart data
    const chartData: ChartDataPoint[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] !== null && closes[i] !== undefined) {
        const date = new Date(timestamps[i] * 1000);
        chartData.push({
          date: date.toISOString(),
          timestamp: timestamps[i],
          price: closes[i],
        });
      }
    }

    // Extract events from Yahoo response
    const events: StockEvent[] = [];
    
    // Earnings events
    if (result.events?.earnings) {
      for (const [timestamp, earning] of Object.entries(result.events.earnings)) {
        const earnEvent = earning as { earningsDate: number };
        const date = new Date(earnEvent.earningsDate * 1000);
        events.push({
          date: date.toISOString().split('T')[0],
          type: 'earnings',
          name: 'Earnings Report',
          description: `${ticker} quarterly earnings`,
          importance: 'high',
        });
      }
    }

    // Dividend events
    if (result.events?.dividends) {
      for (const [timestamp, div] of Object.entries(result.events.dividends)) {
        const divEvent = div as { date: number; amount: number };
        const date = new Date(divEvent.date * 1000);
        events.push({
          date: date.toISOString().split('T')[0],
          type: 'dividend',
          name: 'Ex-Dividend',
          description: `$${divEvent.amount?.toFixed(2) || 'N/A'} per share`,
          importance: 'medium',
        });
      }
    }

    return { chartData, currentPrice, events };
  } catch (error) {
    console.error(`Error fetching chart data for ${ticker}:`, error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, range = '1M' } = await req.json();
    
    if (!ticker) {
      return new Response(JSON.stringify({ error: 'Ticker is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch chart data and company events from Yahoo
    const yahooData = await fetchYahooChartData(ticker, range);
    
    if (!yahooData || yahooData.chartData.length === 0) {
      return new Response(JSON.stringify({ error: 'Failed to fetch chart data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch macro events from database
    const startDate = yahooData.chartData[0]?.date.split('T')[0];
    const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: macroEvents } = await supabase
      .from('macro_events')
      .select('*')
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .order('event_date', { ascending: true });

    // Merge macro events with company events
    const allEvents: StockEvent[] = [...yahooData.events];
    
    if (macroEvents) {
      for (const macro of macroEvents) {
        allEvents.push({
          date: macro.event_date,
          type: macro.event_type as StockEvent['type'],
          name: macro.event_name,
          description: macro.description,
          importance: macro.importance,
        });
      }
    }

    // Sort events by date
    allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate period change
    const firstPrice = yahooData.chartData[0]?.price || 0;
    const lastPrice = yahooData.currentPrice;
    const periodChange = lastPrice - firstPrice;
    const periodChangePercent = firstPrice > 0 ? (periodChange / firstPrice) * 100 : 0;

    const response: StockEventsResponse = {
      chartData: yahooData.chartData,
      events: allEvents,
      currentPrice: yahooData.currentPrice,
      periodChange,
      periodChangePercent,
    };

    console.log(`${ticker} (${range}): ${yahooData.chartData.length} data points, ${allEvents.length} events`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Stock events error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

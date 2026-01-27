// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: any; // Declare Deno global for TypeScript

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChartDataPoint {
  timestamp: number;
  date: string;
  price: number;
}

interface StockEvent {
  date: string;
  timestamp: number;
  type: 'earnings' | 'dividend' | 'ex-dividend';
  title: string;
}

interface ChartResponse {
  ticker: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  chartData: ChartDataPoint[];
  events: StockEvent[];
  range: string;
}

// Map range to Yahoo Finance parameters
function getRangeParams(range: string): { period1: number; period2: number; interval: string } {
  const now = Math.floor(Date.now() / 1000);
  let period1: number;
  let interval: string;

  switch (range) {
    case '1D':
      period1 = now - 86400;
      interval = '5m';
      break;
    case '1W':
      period1 = now - 7 * 86400;
      interval = '15m';
      break;
    case '1M':
      period1 = now - 30 * 86400;
      interval = '1h';
      break;
    case '3M':
      period1 = now - 90 * 86400;
      interval = '1d';
      break;
    case '1Y':
      period1 = now - 365 * 86400;
      interval = '1d';
      break;
    case 'YTD':
    default:
      // Start from Dec 30, 2024 to capture Dec 31 close
      period1 = Math.floor(new Date('2024-12-30').getTime() / 1000);
      interval = '1d';
      break;
  }

  return { period1, period2: now, interval };
}

// Validate ticker symbol format: 1-10 alphanumeric chars, may include hyphen and dot
function isValidTicker(ticker: string): boolean {
  if (!ticker || typeof ticker !== 'string') return false;
  const tickerRegex = /^[A-Z0-9.-]{1,10}$/i;
  return tickerRegex.test(ticker.trim());
}

const validRanges = ['1D', '1W', '1M', '3M', '1Y', 'YTD'];

// Helper function to create error responses
function createErrorResponse(error: string, status: number, details?: any): Response {
  console.error(`Error Response: Status ${status}, Error: ${error}, Details:`, details);
  return new Response(
    JSON.stringify({ error, details }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let requestBody: any;
    try {
      requestBody = await req.json();
      console.log('Parsed request body:', JSON.stringify(requestBody).substring(0, 500));
    } catch (parseError) {
      console.warn('Could not parse request body as JSON, assuming empty object:', parseError);
      requestBody = {};
    }

    let { ticker, range = 'YTD' } = requestBody;

    // Default values for testing in Supabase dashboard
    if (!ticker || !isValidTicker(ticker)) {
      console.log('Invalid or missing ticker, using default for testing.');
      ticker = 'AAPL';
    }

    if (!range || !validRanges.includes(range)) {
      console.log('Invalid or missing range, using default for testing.');
      range = 'YTD';
    }

    const safeTicker = encodeURIComponent(ticker.toUpperCase().trim());
    console.log(`Fetching chart data for ${safeTicker}, range: ${range}`);
    
    const { period1, period2, interval } = getRangeParams(range);
    
    // Fetch chart data with events from Yahoo Finance
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${safeTicker}?period1=${period1}&period2=${period2}&interval=${interval}&events=div,earnings`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error(`Yahoo Finance API error: ${response.status}`);
      return createErrorResponse('Failed to fetch chart data from Yahoo Finance', 500, { status: response.status });
    }
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result) {
      console.error(`No data for ${ticker}`);
      return createErrorResponse(`No chart data available for ticker: ${ticker}`, 404);
    }
    
    const meta = result.meta;
    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    
    // Build chart data points
    const chartData: ChartDataPoint[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] !== null) {
        const date = new Date(timestamps[i] * 1000);
        chartData.push({
          timestamp: timestamps[i],
          date: date.toISOString(),
          price: parseFloat(closes[i].toFixed(2)),
        });
      }
    }
    
    // Extract events from Yahoo Finance
    const events: StockEvent[] = [];
    const yahooEvents = result.events || {};
    const now = Date.now();
    
    // Earnings events
    if (yahooEvents.earnings) {
      Object.values(yahooEvents.earnings).forEach((event: any) => {
        const eventDate = new Date(event.startDate * 1000);
        // Only include future events
        if (eventDate.getTime() > now) {
          events.push({
            date: eventDate.toISOString().split('T')[0],
            timestamp: event.startDate,
            type: 'earnings',
            title: 'Earnings Report',
          });
        }
      });
    }
    
    // Dividend events
    if (yahooEvents.dividends) {
      Object.values(yahooEvents.dividends).forEach((event: any) => {
        const eventDate = new Date(event.date * 1000);
        // Only include future events
        if (eventDate.getTime() > now) {
          events.push({
            date: eventDate.toISOString().split('T')[0],
            timestamp: event.date,
            type: 'dividend',
            title: `Dividend: $${event.amount.toFixed(2)}`,
          });
        }
      });
    }
    
    // Calculate price change
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose || (chartData.length > 1 ? chartData[0].price : currentPrice);
    const priceChange = currentPrice - previousClose;
    const priceChangePercent = ((priceChange / previousClose) * 100);
    
    // For YTD, calculate from Dec 31 close
    let ytdChange = priceChangePercent;
    if (range === 'YTD' && chartData.length > 0) {
      // Find Dec 31 close
      let dec31Close = chartData[0].price;
      for (const point of chartData) {
        const pointDate = new Date(point.date);
        if (pointDate.getFullYear() === 2024) {
          dec31Close = point.price;
        }
      }
      ytdChange = ((currentPrice - dec31Close) / dec31Close) * 100;
    }
    
    const chartResponse: ChartResponse = {
      ticker: safeTicker,
      currentPrice,
      priceChange: range === 'YTD' ? (currentPrice - (chartData[0]?.price || currentPrice)) : priceChange,
      priceChangePercent: range === 'YTD' ? ytdChange : priceChangePercent,
      chartData,
      events,
      range,
    };
    
    console.log(`${ticker}: ${chartData.length} data points, ${events.length} future events`);
    
    return new Response(
      JSON.stringify(chartResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in stock-chart function:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error && error.stack ? `\n\nStack: ${error.stack.substring(0, 500)}` : '';
    return createErrorResponse(`Internal server error: ${errorMessage}${errorDetails}`, 500);
  }
});

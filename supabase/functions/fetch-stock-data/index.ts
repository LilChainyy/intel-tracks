import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StockQuote {
  ticker: string;
  currentPrice: number;
  ytdChange: number;
  isPositive: boolean;
  lastUpdated: string;
}

interface CacheEntry {
  data: StockQuote;
  timestamp: number;
}

// In-memory cache (survives for function instance lifetime)
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache

async function fetchStockData(ticker: string, apiKey: string): Promise<StockQuote | null> {
  // Check cache first
  const cached = cache.get(ticker);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    console.log(`Cache hit for ${ticker}`);
    return cached.data;
  }

  console.log(`Fetching data for ${ticker} from Finnhub`);
  
  try {
    // Fetch current quote from Finnhub
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();

    // Check for errors
    if (quoteData.error) {
      console.error(`Finnhub error for ${ticker}:`, quoteData.error);
      return null;
    }

    // c = current price, pc = previous close, d = change, dp = percent change
    if (!quoteData.c || quoteData.c === 0) {
      console.error(`No data found for ${ticker}`, quoteData);
      return null;
    }

    const currentPrice = quoteData.c;
    
    // For YTD change, we need to get the price from start of year
    // Finnhub provides 52-week high/low but not YTD directly
    // We'll calculate approximate YTD from the daily change percentage as a fallback
    // Better approach: fetch candles for Jan 1st
    let ytdChange = quoteData.dp || 0; // Daily percent change as fallback
    
    // Try to get YTD data using candles endpoint
    try {
      const now = Math.floor(Date.now() / 1000);
      const startOfYear = Math.floor(new Date(new Date().getFullYear(), 0, 1).getTime() / 1000);
      
      const candleUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=D&from=${startOfYear}&to=${startOfYear + 86400 * 7}&token=${apiKey}`;
      const candleResponse = await fetch(candleUrl);
      const candleData = await candleResponse.json();
      
      if (candleData.c && candleData.c.length > 0) {
        const startOfYearPrice = candleData.c[0];
        ytdChange = ((currentPrice - startOfYearPrice) / startOfYearPrice) * 100;
        console.log(`YTD change for ${ticker}: ${ytdChange.toFixed(2)}% (from ${startOfYearPrice} to ${currentPrice})`);
      }
    } catch (e) {
      console.log(`Using daily change for ${ticker} as YTD fallback`);
    }
    
    const stockQuote: StockQuote = {
      ticker,
      currentPrice,
      ytdChange: parseFloat(ytdChange.toFixed(2)),
      isPositive: ytdChange >= 0,
      lastUpdated: new Date().toISOString(),
    };

    // Cache the result
    cache.set(ticker, { data: stockQuote, timestamp: Date.now() });
    
    return stockQuote;
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tickers } = await req.json();
    
    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide an array of ticker symbols' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!apiKey) {
      console.error('FINNHUB_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing request for ${tickers.length} tickers`);

    // Fetch data for all tickers with small delay to respect rate limits (60/min)
    const results: Record<string, StockQuote | null> = {};
    
    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      results[ticker] = await fetchStockData(ticker, apiKey);
      
      // Add small delay between requests (60 calls/min = 1 per second)
      if (i < tickers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      }
    }

    const successCount = Object.values(results).filter(r => r !== null).length;
    console.log(`Successfully fetched ${successCount}/${tickers.length} stocks`);

    return new Response(
      JSON.stringify({ 
        data: results,
        cached: Object.keys(results).filter(t => cache.has(t)),
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-stock-data function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// @ts-ignore - Deno types are available at runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// @ts-ignore - Deno global is available at runtime
declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
}

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
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hour cache

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
    
    if (!quoteResponse.ok) {
      console.error(`Finnhub API error for ${ticker}: ${quoteResponse.status}`);
      return null;
    }
    
    const quoteData = await quoteResponse.json();

    // Finnhub returns: { c: currentPrice, d: change, dp: changePercent, h: high, l: low, o: open, pc: previousClose, t: timestamp }
    if (!quoteData.c || quoteData.c === 0) {
      console.error(`No data found for ${ticker}`, quoteData);
      return null;
    }

    const currentPrice = quoteData.c;
    // dp is change percent, d is change amount
    const changePercent = quoteData.dp || 0;
    
    console.log(`${ticker}: price=$${currentPrice.toFixed(2)}, change=${changePercent.toFixed(2)}%`);
    
    const stockQuote: StockQuote = {
      ticker,
      currentPrice,
      ytdChange: parseFloat(changePercent.toFixed(2)),
      isPositive: changePercent >= 0,
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

// Validate ticker symbol format: 1-10 alphanumeric chars, may include hyphen and dot
function isValidTicker(ticker: string): boolean {
  if (!ticker || typeof ticker !== 'string') return false;
  const tickerRegex = /^[A-Z0-9.-]{1,10}$/i;
  return tickerRegex.test(ticker.trim());
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let requestBody: any = {}
    try {
      requestBody = await req.json()
    } catch (parseError) {
      // If no body, use defaults for testing
      requestBody = { tickers: ['AAPL', 'MSFT'] }
    }

    const { tickers } = requestBody
    
    // Use defaults for testing if tickers are missing
    const tickerList = tickers || ['AAPL', 'MSFT']
    
    if (!Array.isArray(tickerList) || tickerList.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide an array of ticker symbols. Example: {"tickers": ["AAPL", "MSFT"]}' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate all tickers before processing
    const invalidTickers = tickerList.filter(t => !isValidTicker(t));
    if (invalidTickers.length > 0) {
      return new Response(
        JSON.stringify({ error: `Invalid ticker symbols: ${invalidTickers.join(', ')}. Must be 1-10 alphanumeric characters.` }),
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

    console.log(`Processing request for ${tickerList.length} tickers`);

    // Fetch data for all tickers (Finnhub allows 60 calls/minute, so we can be faster)
    const results: Record<string, StockQuote | null> = {};
    
    for (let i = 0; i < tickerList.length; i++) {
      const ticker = tickerList[i];
      const safeTicker = encodeURIComponent(ticker.toUpperCase().trim());
      results[ticker] = await fetchStockData(safeTicker, apiKey);
      
      // Add 1-second delay between requests (60 requests per minute limit = 1 per second)
      if (i < tickerList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = Object.values(results).filter(r => r !== null).length;
    console.log(`Successfully fetched ${successCount}/${tickerList.length} stocks`);

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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get allowed origin from environment or default to Lovable preview
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://lovable.dev';

function getCorsHeaders(origin: string | null) {
  // Allow localhost for development, and the configured allowed origin
  const allowedOrigins = [
    ALLOWED_ORIGIN,
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  // Also allow any lovableproject.com subdomain
  const isLovableProject = origin?.includes('.lovableproject.com') || origin?.includes('.lovable.app');
  const isAllowed = origin && (allowedOrigins.includes(origin) || isLovableProject);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

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

// Ticker validation: 1-5 uppercase letters
const TICKER_REGEX = /^[A-Z]{1,5}$/;
const MAX_TICKERS = 10;

function validateTicker(ticker: unknown): ticker is string {
  return typeof ticker === 'string' && TICKER_REGEX.test(ticker);
}

async function fetchStockData(ticker: string, apiKey: string): Promise<StockQuote | null> {
  // Check cache first
  const cached = cache.get(ticker);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    console.log(`Cache hit for ${ticker}`);
    return cached.data;
  }

  console.log(`Fetching data for ${ticker} from Alpha Vantage`);
  
  try {
    // Fetch current quote from Alpha Vantage
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${apiKey}`;
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();

    // Check for rate limiting or API errors
    if (quoteData.Note) {
      console.error(`Alpha Vantage rate limit for ${ticker}:`, quoteData.Note);
      return null;
    }
    
    if (quoteData.Information) {
      console.error(`Alpha Vantage API info for ${ticker}:`, quoteData.Information);
      return null;
    }

    const globalQuote = quoteData['Global Quote'];
    if (!globalQuote || !globalQuote['05. price']) {
      console.error(`No data found for ${ticker}`, quoteData);
      return null;
    }

    const currentPrice = parseFloat(globalQuote['05. price']);
    // Use the change percent from Alpha Vantage (this is daily change)
    const changePercentStr = globalQuote['10. change percent'] || '0%';
    const changePercent = parseFloat(changePercentStr.replace('%', ''));
    
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

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tickers } = await req.json();
    
    // Input validation: check tickers is an array
    if (!tickers || !Array.isArray(tickers)) {
      return new Response(
        JSON.stringify({ error: 'Please provide an array of ticker symbols' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Input validation: check array length
    if (tickers.length === 0 || tickers.length > MAX_TICKERS) {
      return new Response(
        JSON.stringify({ error: `Tickers must be an array of 1-${MAX_TICKERS} symbols` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Input validation: validate each ticker format
    for (const ticker of tickers) {
      if (!validateTicker(ticker)) {
        return new Response(
          JSON.stringify({ error: `Invalid ticker format: ${String(ticker).substring(0, 10)}. Must be 1-5 uppercase letters.` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      console.error('ALPHA_VANTAGE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing request for ${tickers.length} tickers`);

    // Fetch data for all tickers with delay to respect rate limits (5 requests/minute)
    const results: Record<string, StockQuote | null> = {};
    
    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      results[ticker] = await fetchStockData(ticker, apiKey);
      
      // Add 12-second delay between requests (5 requests per minute limit)
      if (i < tickers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 12000));
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

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
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hour cache

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
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;
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
    const { tickers } = await req.json();
    
    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide an array of ticker symbols' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate all tickers before processing
    const invalidTickers = tickers.filter(t => !isValidTicker(t));
    if (invalidTickers.length > 0) {
      return new Response(
        JSON.stringify({ error: `Invalid ticker symbols: ${invalidTickers.join(', ')}. Must be 1-10 alphanumeric characters.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      const safeTicker = encodeURIComponent(ticker.toUpperCase().trim());
      results[ticker] = await fetchStockData(safeTicker, apiKey);
      
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

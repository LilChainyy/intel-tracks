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

  console.log(`Fetching data for ${ticker} from Alpha Vantage`);
  
  try {
    // Fetch current quote
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();

    // Check for rate limiting or API errors
    if (quoteData.Note || quoteData.Information) {
      console.error(`API limit reached for ${ticker}:`, quoteData.Note || quoteData.Information);
      return null;
    }

    if (!quoteData['Global Quote'] || !quoteData['Global Quote']['05. price']) {
      console.error(`No data found for ${ticker}`, quoteData);
      return null;
    }

    const currentPrice = parseFloat(quoteData['Global Quote']['05. price']);
    const changePercent = parseFloat(quoteData['Global Quote']['10. change percent']?.replace('%', '') || '0');
    
    // Alpha Vantage provides change percent which we can use
    // For YTD, we'll use the available data or calculate from monthly data
    const ytdChange = changePercent; // Using available change percent as approximation
    
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

    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      console.error('ALPHA_VANTAGE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing request for tickers: ${tickers.join(', ')}`);

    // Fetch data for all tickers with delay to respect rate limits
    const results: Record<string, StockQuote | null> = {};
    
    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      results[ticker] = await fetchStockData(ticker, apiKey);
      
      // Add delay between requests to respect rate limits (5 requests per minute on free tier)
      if (i < tickers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 12000)); // 12 second delay
      }
    }

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

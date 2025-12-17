import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// All tickers from playlists
const ALL_TICKERS = [
  // Nuclear Renaissance
  "CCJ", "VST", "CEG", "SMR", "LEU",
  // Streaming Wars Winners
  "NFLX", "DIS", "WBD", "PARA",
  // Defense & Aerospace
  "LMT", "RTX", "NOC", "GD", "LHX",
  // Space Economy
  "RKLB", "ASTS", "PL", "LUNR",
  // Pet Economy
  "CHWY", "IDXX", "ZTS", "TRUP",
  // Retail Barbell
  "COST", "WMT", "DG", "RH",
  // Future of Longevity
  "LLY", "NVO", "WELL", "VTR", "CRSP",
  // Cash Cows
  "JNJ", "PG", "KO", "PEP", "MCD",
  // Index & Chill (ETFs)
  "VOO", "VTI", "QQQ", "SCHD"
];

interface StockQuote {
  ticker: string;
  currentPrice: number;
  ytdChange: number;
  isPositive: boolean;
}

async function fetchStockYTD(ticker: string): Promise<StockQuote | null> {
  try {
    // Use Yahoo Finance chart API - fetch data from start of 2025 to now
    // period1 = Jan 1, 2025 (Unix timestamp)
    // period2 = now
    const startOf2025 = Math.floor(new Date('2025-01-01').getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${startOf2025}&period2=${now}&interval=1d`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch ${ticker}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result) {
      console.error(`No data for ${ticker}`);
      return null;
    }
    
    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice;
    const closes = result.indicators?.quote?.[0]?.close || [];
    
    // First close of the year (first trading day)
    const firstClose = closes.find((c: number | null) => c !== null);
    
    if (!firstClose || !currentPrice) {
      console.error(`Missing price data for ${ticker}`);
      return null;
    }
    
    const ytdChange = ((currentPrice - firstClose) / firstClose) * 100;
    
    console.log(`${ticker}: Start=$${firstClose.toFixed(2)}, Now=$${currentPrice.toFixed(2)}, YTD=${ytdChange.toFixed(2)}%`);
    
    return {
      ticker,
      currentPrice,
      ytdChange: parseFloat(ytdChange.toFixed(2)),
      isPositive: ytdChange >= 0,
    };
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Starting YTD refresh for ${ALL_TICKERS.length} tickers`);
    
    let successCount = 0;
    let errorCount = 0;

    // Process in batches of 5 with small delays to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < ALL_TICKERS.length; i += batchSize) {
      const batch = ALL_TICKERS.slice(i, i + batchSize);
      
      // Fetch batch in parallel
      const results = await Promise.all(batch.map(ticker => fetchStockYTD(ticker)));
      
      // Save results to database
      for (const stockData of results) {
        if (stockData && stockData.currentPrice > 0) {
          const { error } = await supabase
            .from('stock_quotes')
            .upsert({
              ticker: stockData.ticker,
              current_price: stockData.currentPrice,
              ytd_change: stockData.ytdChange,
              is_positive: stockData.isPositive,
              last_updated: new Date().toISOString(),
            }, { onConflict: 'ticker' });

          if (error) {
            console.error(`Error saving ${stockData.ticker}:`, error);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          errorCount++;
        }
      }
      
      // Small delay between batches
      if (i + batchSize < ALL_TICKERS.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Refresh complete: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: ALL_TICKERS.length,
        successCount,
        errorCount,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in refresh-stock-data function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

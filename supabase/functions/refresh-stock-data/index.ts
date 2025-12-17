import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// All tickers from playlists (hardcoded to avoid importing from frontend)
// Nuclear, Streaming, Defense, Space, Pets, Barbell, Longevity, Cash Cows, Index & Chill
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

async function fetchStockData(ticker: string, apiKey: string): Promise<StockQuote | null> {
  console.log(`Fetching YTD data for ${ticker} from Alpha Vantage`);
  
  try {
    // Get current quote
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();

    if (quoteData.Note || quoteData.Information) {
      console.error(`Alpha Vantage rate limit/info for ${ticker}:`, quoteData.Note || quoteData.Information);
      return null;
    }

    const globalQuote = quoteData['Global Quote'];
    if (!globalQuote || !globalQuote['05. price']) {
      console.error(`No quote data for ${ticker}`, quoteData);
      return null;
    }

    const currentPrice = parseFloat(globalQuote['05. price']);

    // Get monthly data for YTD calculation (free tier supports this)
    const monthlyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${ticker}&apikey=${apiKey}`;
    const monthlyResponse = await fetch(monthlyUrl);
    const monthlyData = await monthlyResponse.json();

    let ytdChange = 0;
    let startOfYearPrice = currentPrice;

    if (monthlyData['Monthly Time Series']) {
      const monthly = monthlyData['Monthly Time Series'];
      const dates = Object.keys(monthly).sort((a, b) => b.localeCompare(a));
      
      // Find December 2024 close price (end of year = start of 2025)
      const dec2024 = dates.find(d => d.startsWith('2024-12'));
      if (dec2024) {
        startOfYearPrice = parseFloat(monthly[dec2024]['4. close']);
        ytdChange = ((currentPrice - startOfYearPrice) / startOfYearPrice) * 100;
        console.log(`${ticker}: current=$${currentPrice.toFixed(2)}, Dec2024=$${startOfYearPrice.toFixed(2)}, YTD=${ytdChange.toFixed(2)}%`);
      } else {
        // Fallback: use oldest available 2025 data
        const jan2025 = dates.find(d => d.startsWith('2025-01'));
        if (jan2025) {
          startOfYearPrice = parseFloat(monthly[jan2025]['1. open']);
          ytdChange = ((currentPrice - startOfYearPrice) / startOfYearPrice) * 100;
          console.log(`${ticker}: current=$${currentPrice.toFixed(2)}, Jan2025Open=$${startOfYearPrice.toFixed(2)}, YTD=${ytdChange.toFixed(2)}%`);
        }
      }
    } else {
      console.warn(`No monthly data for ${ticker}, using daily change`);
      const changePercentStr = globalQuote['10. change percent'] || '0%';
      ytdChange = parseFloat(changePercentStr.replace('%', ''));
    }
    
    return {
      ticker,
      currentPrice,
      ytdChange: parseFloat(ytdChange.toFixed(2)),
      isPositive: ytdChange >= 0,
    };
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      console.error('ALPHA_VANTAGE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Starting scheduled refresh for ${ALL_TICKERS.length} tickers`);
    
    let successCount = 0;
    let errorCount = 0;

    // Process tickers with 15-second delay (Alpha Vantage: 5 calls/min, we make 2 calls per ticker)
    for (let i = 0; i < ALL_TICKERS.length; i++) {
      const ticker = ALL_TICKERS[i];
      const stockData = await fetchStockData(ticker, apiKey);
      
      if (stockData) {
        // Upsert into database
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
          console.error(`Error saving ${ticker}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      } else {
        errorCount++;
      }
      
      // Add 25-second delay (Alpha Vantage: 5 calls/min, we make 2 calls per ticker)
      if (i < ALL_TICKERS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 25000));
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

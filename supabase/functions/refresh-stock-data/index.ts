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
  console.log(`Fetching data for ${ticker} from Alpha Vantage`);
  
  try {
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();

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
    const changePercentStr = globalQuote['10. change percent'] || '0%';
    const changePercent = parseFloat(changePercentStr.replace('%', ''));
    
    console.log(`${ticker}: price=$${currentPrice.toFixed(2)}, change=${changePercent.toFixed(2)}%`);
    
    return {
      ticker,
      currentPrice,
      ytdChange: parseFloat(changePercent.toFixed(2)),
      isPositive: changePercent >= 0,
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

    // Process tickers with 12-second delay between each (Alpha Vantage rate limit: 5/min)
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
      
      // Add 12-second delay between requests
      if (i < ALL_TICKERS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 12000));
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

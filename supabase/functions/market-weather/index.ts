import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface MarketSignals {
  vix: { value: number; change: number };
  sp500: { price: number; ma200: number; aboveMa: boolean };
  sectors: { tech: number; energy: number; finance: number; healthcare: number };
}

async function fetchYahooQuote(ticker: string): Promise<{ price: number; change: number } | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1d`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta) return null;
    
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose;
    const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
    
    return { price, change };
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error);
    return null;
  }
}

async function fetchSP500WithMA(): Promise<{ price: number; ma200: number; aboveMa: boolean } | null> {
  try {
    // Fetch 250 days of data for 200-day MA calculation
    const now = Math.floor(Date.now() / 1000);
    const oneYearAgo = now - (365 * 24 * 60 * 60);
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?period1=${oneYearAgo}&period2=${now}&interval=1d`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;
    
    const closes = result.indicators?.quote?.[0]?.close || [];
    const validCloses = closes.filter((c: number | null) => c !== null);
    
    const price = result.meta.regularMarketPrice;
    
    // Calculate 200-day moving average
    const last200 = validCloses.slice(-200);
    const ma200 = last200.reduce((sum: number, val: number) => sum + val, 0) / last200.length;
    
    return {
      price,
      ma200,
      aboveMa: price > ma200
    };
  } catch (error) {
    console.error('Error fetching S&P 500:', error);
    return null;
  }
}

async function fetchMarketSignals(): Promise<MarketSignals | null> {
  try {
    const [vixData, sp500Data, xlk, xle, xlf, xlv] = await Promise.all([
      fetchYahooQuote('^VIX'),
      fetchSP500WithMA(),
      fetchYahooQuote('XLK'), // Tech
      fetchYahooQuote('XLE'), // Energy
      fetchYahooQuote('XLF'), // Finance
      fetchYahooQuote('XLV'), // Healthcare
    ]);

    if (!vixData || !sp500Data) {
      console.error('Failed to fetch core market data');
      return null;
    }

    return {
      vix: { value: vixData.price, change: vixData.change },
      sp500: sp500Data,
      sectors: {
        tech: xlk?.change || 0,
        energy: xle?.change || 0,
        finance: xlf?.change || 0,
        healthcare: xlv?.change || 0,
      }
    };
  } catch (error) {
    console.error('Error fetching market signals:', error);
    return null;
  }
}

function determineRegime(signals: MarketSignals): { type: string; headline: string } {
  const { vix, sp500, sectors } = signals;
  
  // Risk-off conditions
  if (vix.value > 25 && !sp500.aboveMa) {
    return { type: 'risk-off', headline: 'Risk-off mode' };
  }
  
  // High fear but still trending up
  if (vix.value > 25 && sp500.aboveMa) {
    return { type: 'volatile', headline: 'Volatile but trending up' };
  }
  
  // Strong momentum
  if (vix.value < 15 && sp500.aboveMa && sectors.tech > 0.5) {
    return { type: 'momentum', headline: 'Momentum rally' };
  }
  
  // Calm risk-on
  if (vix.value < 18 && sp500.aboveMa) {
    return { type: 'risk-on', headline: 'Risk-on mode' };
  }
  
  // Sideways/choppy
  if (vix.value >= 18 && vix.value <= 25) {
    return { type: 'sideways', headline: 'Sideways chop' };
  }
  
  // Default
  return { type: 'neutral', headline: 'Mixed signals' };
}

async function generateAISummary(signals: MarketSignals, regime: { type: string; headline: string }): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.log('No LOVABLE_API_KEY, using fallback summary');
    return generateFallbackSummary(signals, regime);
  }
  
  try {
    const leadingSector = Object.entries(signals.sectors)
      .sort(([, a], [, b]) => b - a)[0];
    
    const prompt = `You are a market analyst providing a brief market update for retail investors. Generate a 2-sentence summary based on these signals:

VIX: ${signals.vix.value.toFixed(1)} (${signals.vix.change > 0 ? '+' : ''}${signals.vix.change.toFixed(1)}% today)
S&P 500: ${signals.sp500.aboveMa ? 'Above' : 'Below'} 200-day moving average
Leading sector: ${leadingSector[0]} (${leadingSector[1] > 0 ? '+' : ''}${leadingSector[1].toFixed(1)}%)
Market regime: ${regime.headline}

Keep it casual and actionable. No financial advice. Focus on what the data suggests about market sentiment.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a concise market analyst. Respond with exactly 2 sentences.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI gateway error:', response.status);
      return generateFallbackSummary(signals, regime);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || generateFallbackSummary(signals, regime);
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return generateFallbackSummary(signals, regime);
  }
}

function generateFallbackSummary(signals: MarketSignals, regime: { type: string }): string {
  const leadingSector = Object.entries(signals.sectors)
    .sort(([, a], [, b]) => b - a)[0];
  
  const sectorName = leadingSector[0].charAt(0).toUpperCase() + leadingSector[0].slice(1);
  
  switch (regime.type) {
    case 'risk-off':
      return `VIX elevated at ${signals.vix.value.toFixed(0)} with S&P below its 200-day average. Defensive positioning may be prudent until conditions stabilize.`;
    case 'momentum':
      return `Low volatility environment with ${sectorName} leading gains. Momentum strategies tend to work well in these conditions.`;
    case 'risk-on':
      return `Calm markets with VIX at ${signals.vix.value.toFixed(0)}. ${sectorName} is outperforming as investors favor growth.`;
    case 'sideways':
      return `Markets are choppy with mixed signals. ${sectorName} showing relative strength but conviction is low.`;
    case 'volatile':
      return `Elevated VIX but S&P holding above key support. Watch for resolution as markets digest uncertainty.`;
    default:
      return `Mixed signals today with ${sectorName} leading. Stay balanced and watch for clearer direction.`;
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing required environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for cached data
    const { data: cached } = await supabase
      .from('market_regime')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      console.log('Returning cached market weather');
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching fresh market signals...');
    const signals = await fetchMarketSignals();
    
    if (!signals) {
      return new Response(JSON.stringify({ error: 'Failed to fetch market data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const regime = determineRegime(signals);
    console.log(`Regime: ${regime.type} - ${regime.headline}`);
    
    const summary = await generateAISummary(signals, regime);
    console.log(`Summary: ${summary}`);

    // Cache for 4 hours
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    
    const newRegime = {
      regime_type: regime.type,
      headline: regime.headline,
      summary,
      indicators: signals,
      expires_at: expiresAt,
    };

    const { data: inserted, error } = await supabase
      .from('market_regime')
      .insert(newRegime)
      .select()
      .single();

    if (error) {
      console.error('Error caching market regime:', error);
      // Return the data anyway, just not cached
      return new Response(JSON.stringify(newRegime), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(inserted), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Market weather error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

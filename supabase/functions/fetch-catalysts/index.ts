// @ts-ignore - Deno types are available at runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno types are available at runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

interface FinnhubNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string; // Comma-separated tickers
  source: string;
  summary: string;
  url: string;
}

interface Catalyst {
  id: string;
  title: string;
  description: string;
  category: string;
  time: string;
  companies: string[];
  themeId: string;
  impact: 'High' | 'Medium' | 'Low';
  sourceUrl?: string;
}

// Map Finnhub categories to your categories (only for SIGNALS)
function mapCategory(finnhubCategory: string, headline: string, summary: string): string {
  const text = (headline + ' ' + summary).toLowerCase();
  
  // Earnings & Financials
  if (text.match(/\b(earnings|revenue|profit|loss|guidance|forecast|outlook|analyst|upgrade|downgrade|price target|eps|ebitda)\b/)) {
    return 'Earnings';
  }
  
  // FDA & Regulatory
  if (text.match(/\b(fda|approval|rejection|clinical trial|drug|regulatory|fcc|sec|doj)\b/)) {
    return 'FDA';
  }
  
  // M&A
  if (text.match(/\b(merger|acquisition|deal|takeover|buyout|spin-off|ipo|offering|consolidation)\b/)) {
    return 'Mergers';
  }
  
  // Partnerships & Contracts
  if (text.match(/\b(partnership|collaboration|contract|agreement|alliance|joint venture)\b/)) {
    return 'Partnership';
  }
  
  // Production & Operations
  if (text.match(/\b(production|manufacturing|supply chain|shortage|surplus|capacity|factory|plant|facility)\b/)) {
    return 'Production';
  }
  
  // Economic & Macro (affects broader market)
  if (text.match(/\b(interest rate|fed|federal reserve|monetary policy|inflation|deflation|gdp|unemployment|geopolitical|war|conflict|sanctions|trade|tariff|oil price|commodity|economic|recession|growth|stimulus)\b/)) {
    return 'Economic';
  }
  
  // Default to Economic for other market-moving signals
  return 'Economic';
}

// Determine impact: Institutional-grade assessment (only High, never Medium/Low)
// STRICT: Only return 'High' for truly market-moving events
function determineImpact(headline: string, summary: string, source: string, tickers: string[]): 'High' | 'Medium' {
  const text = (headline + ' ' + summary).toLowerCase();
  
  // HIGH IMPACT indicators - Must be truly market-moving
  const highImpactPatterns = [
    // Major market events (extreme movements)
    /\b(breakthrough|major|significant|record|surge|plunge|crash|rally|crisis|collapse|soar|tumble|plummet|spike)\b/,
    // Fed/Macro decisions (affects entire market)
    /\b(fed|federal reserve|interest rate|rate cut|rate hike|fomc|monetary policy|quantitative easing|qe|tapering)\b/,
    // Major M&A (large deals)
    /\b(merger|acquisition|takeover|buyout|spin-off|ipo|billion.*deal|major.*deal)\b/,
    // Regulatory approvals/rejections (FDA, SEC, antitrust)
    /\b(fda approval|fda rejection|regulatory approval|sec|antitrust|doj|regulatory action)\b/,
    // Major economic data (market-moving releases)
    /\b(cpi|pce|pmi|inflation|deflation|gdp|unemployment|recession|depression|nonfarm payroll|retail sales)\b/,
    // Geopolitical (affects global markets)
    /\b(war|conflict|sanctions|trade war|tariff|embargo|government shutdown|geopolitical|military)\b/,
    // Major company events (bankruptcies, major breaches, closures)
    /\b(bankruptcy|restructuring|major.*layoff|closure|data breach|cyber attack|hack|security breach)\b/,
    // Earnings surprises (beats/misses that move markets)
    /\b(earnings.*beat|earnings.*miss|blowout|crush|disappoint|surprise|guidance.*raise|guidance.*cut)\b/,
  ];
  
  // Count matches
  const highCount = highImpactPatterns.filter(pattern => pattern.test(text)).length;
  
  // Premium sources boost credibility
  const premiumSources = ['Bloomberg', 'Reuters', 'Wall Street Journal', 'CNBC', 'Financial Times', 'MarketWatch', 'Barron\'s', 'WSJ'];
  const isPremiumSource = premiumSources.some(ps => source.includes(ps));
  
  // Multiple tickers = higher impact (affects multiple companies)
  const tickerCount = tickers.length;
  
  // STRICT: Only return 'High' if it meets strong criteria
  // Must have at least 2 high-impact patterns OR 1 pattern + premium source + multiple tickers
  if (highCount >= 2) {
    return 'High';
  }
  if (highCount >= 1 && isPremiumSource && tickerCount >= 2) {
    return 'High';
  }
  if (highCount >= 1 && (text.includes('billion') || text.includes('record') || text.includes('surge') || text.includes('crash'))) {
    return 'High';
  }
  
  // Everything else is Medium (but will be filtered out)
  return 'Medium';
}

// Icon function removed - no longer using icons

// Map theme based on ticker (you can expand this)
function getThemeId(tickers: string[]): string {
  // This is a simplified mapping - you'd want to expand this based on your playlists
  const themeMap: Record<string, string> = {
    'CEG': 'nuclear',
    'CCJ': 'nuclear',
    'VST': 'nuclear',
    'RKLB': 'space',
    'ASTS': 'space',
    'PL': 'space',
    'NFLX': 'netflix',
    'DIS': 'netflix',
    'WBD': 'netflix',
    'LMT': 'defense',
    'RTX': 'defense',
    'NOC': 'defense',
    'GD': 'defense',
    'COST': 'barbell',
    'WMT': 'barbell',
    'CHWY': 'pets',
    'IDXX': 'pets',
    'ZTS': 'pets',
    'TRUP': 'pets',
  };
  
  // Return first matching theme, or default
  for (const ticker of tickers) {
    if (themeMap[ticker]) {
      return themeMap[ticker];
    }
  }
  return 'general';
}

// Format time relative to now
function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000; // Finnhub uses seconds
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  }
  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  return 'Just now';
}

// Institutional-grade filtering: Only market-moving, forward-looking, institutional-relevant events
// Returns true if SIGNAL, false if NOISE (STRICT: discard if meets any exclusion criteria)
function isSignal(item: FinnhubNewsItem): boolean {
  const text = (item.headline + ' ' + item.summary).toLowerCase();
  
  // ========== EXCLUSION CRITERIA (STRICT - discard if matches any) ==========
  
  // Retail Fluff: Personal finance advice
  if (/\b(how to invest|retirement planning|personal finance|save money|budget|401k|ira|roth|tips for|guide to|learn how|what is|explained|understanding)\b/.test(text)) {
    return false;
  }
  
  // How-to guides and educational content (unless it references specific ticker/economic data)
  if (/\b(how to|step by step|tutorial|beginner guide|getting started|what you need to know|explained|learn about|understanding)\b/.test(text)) {
    // Exception: Keep if it has ticker symbols or economic data
    const hasTickers = !!(item.related && item.related.trim().length > 0);
    const hasEconomicData = /\b(cpi|pmi|gdp|inflation|unemployment|fed|interest rate|earnings|revenue)\b/.test(text);
    if (!hasTickers && !hasEconomicData) {
      return false;
    }
  }
  
  // Opinion/Educational: General education without specific ticker or economic data
  if (/\b(opinion|editorial|analysis|why|what does|explained|understanding|learn about)\b/.test(text)) {
    const hasTickers = !!(item.related && item.related.trim().length > 0);
    const hasEconomicData = /\b(cpi|pmi|gdp|inflation|unemployment|fed|interest rate|earnings|revenue|guidance)\b/.test(text);
    if (!hasTickers && !hasEconomicData) {
      return false;
    }
  }
  
  // Human interest / Lifestyle
  if (/\b(ceo's personal|founder's story|behind the scenes|human interest|feel-good|inspirational|success story|lifestyle|celebrity gossip)\b/.test(text)) {
    return false;
  }
  
  // Local/Small Business (no broader economic ripple)
  if (/\b(local business|small business|mom and pop|neighborhood|community|town|city council|local shop|bakery|restaurant|retail store)\b/.test(text)) {
    // Exception: Keep if it's about a publicly traded company (has ticker)
    const hasTickers = !!(item.related && item.related.trim().length > 0);
    if (!hasTickers) {
      return false;
    }
  }
  
  // Historical recaps (not forward-looking) - prioritize current/unfolding events
  if (/\b(recap|summary|roundup|this week|this month|in review|looking back|retrospective)\b/.test(text)) {
    // Exception: Keep if it's about major market-moving event or has tickers
    const hasTickers = !!(item.related && item.related.trim().length > 0);
    const isMajorEvent = /\b(earnings|fed|inflation|cpi|pmi|merger|acquisition|fda approval|guidance)\b/.test(text);
    if (!hasTickers && !isMajorEvent) {
      return false;
    }
  }
  
  // ========== INCLUSION CRITERIA (Must meet at least one) ==========
  
  // Market Moving: Valuation-affecting events
  const marketMovingPatterns = [
    // Earnings & Financials
    /\b(earnings|revenue|profit|loss|guidance|forecast|outlook|analyst|upgrade|downgrade|price target|eps|ebitda|margin)\b/,
    // M&A
    /\b(merger|acquisition|deal|takeover|buyout|spin-off|ipo|offering|consolidation)\b/,
    // FDA & Regulatory
    /\b(fda|approval|rejection|clinical trial|drug|regulatory|fcc|sec|doj|antitrust)\b/,
    // Macro Economic Data
    /\b(cpi|pmi|pce|gdp|unemployment|jobless|nonfarm payroll|retail sales|industrial production)\b/,
    // Fed & Monetary Policy
    /\b(interest rate|fed|federal reserve|monetary policy|fomc|rate cut|rate hike|quantitative easing|qe|tapering)\b/,
    // Inflation/Deflation
    /\b(inflation|deflation|deflationary|stagflation|hyperinflation)\b/,
  ];
  
  // Geopolitical/Infrastructure: Structural business environment
  const geopoliticalPatterns = [
    // Geopolitical
    /\b(geopolitical|war|conflict|sanctions|trade war|tariff|embargo|export ban|import ban)\b/,
    // Infrastructure
    /\b(power outage|data center|storm|hurricane|natural disaster|infrastructure|grid|supply chain disruption)\b/,
    // Government
    /\b(government shutdown|budget|fiscal policy|stimulus|bailout|subsidy)\b/,
  ];
  
  // Forward-Looking Events (currently happening or will happen)
  const forwardLookingPatterns = [
    // Upcoming events
    /\b(announce|will|expected|scheduled|upcoming|to report|to release|to announce|set to)\b/,
    // Current events
    /\b(reports|announces|reveals|discloses|confirms|denies|warns|forecasts)\b/,
    // Real-time
    /\b(live|breaking|just|now|today|this week|this month)\b/,
  ];
  
  // Company-Specific Catalysts
  const companyCatalystPatterns = [
    // Operations
    /\b(production|manufacturing|supply chain|shortage|surplus|capacity|factory|plant|facility|facilities)\b/,
    // Partnerships
    /\b(partnership|collaboration|contract|agreement|alliance|joint venture|strategic partnership)\b/,
    // Leadership
    /\b(ceo|executive|management|leadership change|resignation|appointment|departure)\b/,
    // Legal/Regulatory
    /\b(lawsuit|legal|settlement|fine|investigation|regulatory action|antitrust|monopoly)\b/,
    // Restructuring
    /\b(restructuring|layoff|hiring|expansion|closure|bankruptcy|reorganization)\b/,
    // Innovation
    /\b(breakthrough|innovation|patent|technology|product launch|r&d|research)\b/,
  ];
  
  // Check if it matches inclusion criteria
  const hasMarketMoving = marketMovingPatterns.some(pattern => pattern.test(text));
  const hasGeopolitical = geopoliticalPatterns.some(pattern => pattern.test(text));
  const hasForwardLooking = forwardLookingPatterns.some(pattern => pattern.test(text));
  const hasCompanyCatalyst = companyCatalystPatterns.some(pattern => pattern.test(text));
  const hasTickers = !!(item.related && item.related.trim().length > 0);
  
  // Must meet at least one inclusion criterion
  return hasMarketMoving || hasGeopolitical || hasForwardLooking || hasCompanyCatalyst || hasTickers;
}

// Score news items for relevance (higher = more important)
function scoreNewsItem(item: FinnhubNewsItem): number {
  let score = 0;
  
  // Premium sources get higher scores
  const premiumSources = ['Bloomberg', 'Reuters', 'Wall Street Journal', 'CNBC', 'Financial Times', 'MarketWatch', 'Barron\'s'];
  if (premiumSources.some(ps => item.source.includes(ps))) {
    score += 10;
  }
  
  // More tickers = more important (strong signal)
  const tickerCount = item.related ? item.related.split(',').filter(t => t.trim()).length : 0;
  score += tickerCount * 3; // Increased weight
  
  // Impact keywords and forward-looking prioritization
  const text = (item.headline + ' ' + item.summary).toLowerCase();
  
  if (text.includes('breakthrough') || text.includes('major') || text.includes('record') || text.includes('surge') || text.includes('plunge')) {
    score += 5;
  }
  
  // Macro events get higher scores (affects many companies)
  if (text.includes('interest rate') || text.includes('fed') || text.includes('inflation') || text.includes('geopolitical') || text.includes('trade war')) {
    score += 4;
  }
  
  // Forward-looking prioritization (current/unfolding events score higher)
  if (/\b(announce|will|expected|scheduled|upcoming|to report|to release|breaking|just|now|today)\b/.test(text)) {
    score += 4; // Boost forward-looking events
  }
  
  // Recency (newer = slightly higher score)
  const hoursOld = (Date.now() - item.datetime * 1000) / (1000 * 60 * 60);
  if (hoursOld < 24) score += 3;
  else if (hoursOld < 48) score += 1;
  
  return score;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'FINNHUB_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching market news from Finnhub...');

    // Fetch general market news (last 7 days)
    const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
    const newsUrl = `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`;
    
    const response = await fetch(newsUrl);
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const newsItems: FinnhubNewsItem[] = await response.json();
    
    // Filter: Keep only SIGNALS (discard NOISE)
    // Then filter to last 7 days and score them
    const recentNews = newsItems
      .filter(item => {
        // First check if it's a signal (not noise)
        if (!isSignal(item)) {
          console.log(`Filtered out noise: ${item.headline.substring(0, 50)}...`);
          return false;
        }
        // Then check recency
        return item.datetime >= sevenDaysAgo;
      })
      .map(item => ({
        item,
        score: scoreNewsItem(item),
      }))
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 20); // Top 20 signals only

    console.log(`Found ${recentNews.length} relevant news items`);

    // Convert to Catalyst format and filter to only High impact
    const catalysts: Catalyst[] = recentNews
      .map(({ item }, index) => {
        const tickers = item.related 
          ? item.related.split(',').map(t => t.trim().toUpperCase()).filter(t => t.length > 0)
          : [];
        
        const category = mapCategory(item.category, item.headline, item.summary);
        const impact = determineImpact(item.headline, item.summary, item.source, tickers);
        
        return {
          id: `api-${item.id}`,
          title: item.headline,
          description: item.summary || item.headline,
          category,
          time: formatTime(item.datetime),
          icon: '',
          companies: tickers.slice(0, 5), // Limit to 5 companies
          themeId: getThemeId(tickers),
          impact,
          sourceUrl: item.url,
        };
      })
      .filter(catalyst => catalyst.impact === 'High'); // STRICT: Only High impact

    // Store in database (optional - you can also just return them)
    // First, check if catalysts table exists, if not, just return the data
    const { error: dbError } = await supabase
      .from('catalysts')
      .upsert(
        catalysts.map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category,
          time: c.time,
          icon: '',
          companies: c.companies,
          theme_id: c.themeId,
          impact: c.impact,
          source_url: c.sourceUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'id' }
      );

    if (dbError) {
      console.warn('Database error (table might not exist yet):', dbError);
      // Continue anyway - return the data
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: catalysts.length,
        catalysts,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching catalysts:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

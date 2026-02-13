// Enhanced stock data fetcher: Yahoo Finance + curated knowledge
// Returns StockProfile with everything needed for AI advisor

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: { env: { get(key: string): string | undefined } };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Curated stock knowledge (same as frontend stockKnowledge.ts)
const stockKnowledge: Record<string, any> = {
  CCJ: {
    description: "Cameco mines and sells uranium, the fuel that powers nuclear reactors. They control about 15% of global uranium supply. When datacenters need reliable clean energy, they need uranium.",
    keyProducts: ["Uranium mining", "Uranium refining", "Nuclear fuel services"],
    whyItMatters: "AI datacenters need 24/7 power. Nuclear is the only carbon-free option that runs all day, every day. Cameco benefits from this demand surge.",
    themes: ["nuclear"],
  },
  NFLX: {
    description: "Netflix streams movies and TV shows to 260M+ subscribers worldwide. They invented binge-watching and the streaming model everyone else copied. Now they're adding ads and live sports.",
    keyProducts: ["Streaming subscription", "Ad-supported tier", "Live sports (WWE, NFL)", "Original content"],
    whyItMatters: "Netflix survived the streaming wars. They're profitable, growing subscribers, and have pricing power. The competition is dying or consolidating.",
    themes: ["netflix"],
  },
  // Add more as needed - keep in sync with frontend
};

interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

async function fetchYahooQuote(ticker: string): Promise<any> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price,summaryProfile,assetProfile`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible)" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.quoteSummary?.result?.[0];
}

async function fetchYahooNews(ticker: string): Promise<NewsItem[]> {
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${ticker}&newsCount=5`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible)" },
    });
    if (!res.ok) return [];

    const data = await res.json();
    const news = data.news || [];

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    return news
      .filter((item: any) => item.providerPublishTime * 1000 > thirtyDaysAgo)
      .slice(0, 5)
      .map((item: any) => ({
        title: item.title || "Untitled",
        source: item.publisher || "Unknown",
        url: item.link || `https://finance.yahoo.com/quote/${ticker}`,
        publishedAt: new Date(item.providerPublishTime * 1000).toISOString(),
      }));
  } catch (e) {
    console.error("News fetch error:", e);
    return [];
  }
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const ticker = url.searchParams.get("ticker")?.toUpperCase().trim();

    if (!ticker || !/^[A-Z]{1,5}$/.test(ticker)) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: "not_found",
            message: "Invalid ticker symbol",
          },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch Yahoo Finance data
    const quote = await fetchYahooQuote(ticker);
    if (!quote) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: "not_found",
            message: `Ticker ${ticker} not found`,
            suggestion: "Check spelling or try a different symbol",
          },
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const price = quote.price || {};
    const profile = quote.summaryProfile || quote.assetProfile || {};

    const marketCap = price.marketCap?.raw || 0;
    const currentPrice = price.regularMarketPrice?.raw || 0;

    // Get curated knowledge (if available)
    const knowledge = stockKnowledge[ticker];

    // Fetch news
    const news = await fetchYahooNews(ticker);

    // Build StockProfile
    const stockProfile = {
      ticker,
      name: price.longName || price.shortName || ticker,
      description: knowledge?.description || profile.longBusinessSummary || "No description available.",

      sector: profile.sector || "Unknown",
      industry: profile.industry || "Unknown",
      themes: knowledge?.themes || [],

      marketCap,
      marketCapDisplay: formatMarketCap(marketCap),
      price: currentPrice,
      priceDisplay: `$${currentPrice.toFixed(2)}`,

      keyProducts: knowledge?.keyProducts || [],
      whyItMatters: knowledge?.whyItMatters || "",

      news,
      updatedAt: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({ ok: true, data: stockProfile }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fetch error:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          type: "service_down",
          message: "Failed to fetch stock data",
        },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

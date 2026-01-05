import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StockAnalysisRequest {
  ticker: string;
  companyName: string;
  question: 'profitability' | 'growth' | 'valuation';
  followUp?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, companyName, question, followUp } = await req.json() as StockAnalysisRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch real stock data from Yahoo Finance
    const stockData = await fetchStockData(ticker);
    
    // Build prompt based on question type
    const systemPrompt = buildSystemPrompt(question, followUp);
    const userPrompt = buildUserPrompt(ticker, companyName, question, stockData, followUp);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_stock",
              description: "Return structured stock analysis data",
              parameters: {
                type: "object",
                properties: {
                  headline: { type: "string", description: "One-line summary answer" },
                  simpleAnswer: { type: "string", description: "Simple yes/no explanation for beginners" },
                  details: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        point: { type: "string" },
                        metric: { type: "string" },
                        value: { type: "string" }
                      },
                      required: ["point", "metric", "value"]
                    }
                  },
                  metrics: {
                    type: "object",
                    properties: {
                      primary: { type: "string" },
                      primaryValue: { type: "string" },
                      secondary: { type: "string" },
                      secondaryValue: { type: "string" },
                      comparison: { type: "string" },
                      comparisonValue: { type: "string" }
                    }
                  },
                  analogy: { type: "string", description: "Simple analogy to explain the concept" },
                  competitorComparison: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        value: { type: "number" },
                        label: { type: "string" }
                      }
                    }
                  },
                  summaryTag: { type: "string", description: "Emoji + short tag like '💰 Very profitable'" }
                },
                required: ["headline", "simpleAnswer", "details", "metrics", "summaryTag"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_stock" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ 
        analysis,
        rawData: stockData 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No structured response received");
  } catch (error) {
    console.error("Stock analysis error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function fetchStockData(ticker: string) {
  try {
    // Fetch summary data from Yahoo Finance
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=financialData,defaultKeyStatistics,incomeStatementHistory,earnings,price`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`Yahoo Finance error for ${ticker}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = data.quoteSummary?.result?.[0];
    
    if (!result) return null;

    const financialData = result.financialData || {};
    const keyStats = result.defaultKeyStatistics || {};
    const price = result.price || {};
    const earnings = result.earnings || {};

    return {
      ticker,
      name: price.shortName || price.longName || ticker,
      currentPrice: price.regularMarketPrice?.raw,
      marketCap: price.marketCap?.raw,
      marketCapFormatted: price.marketCap?.fmt,
      
      // Profitability metrics
      profitMargins: financialData.profitMargins?.raw,
      profitMarginsFormatted: financialData.profitMargins?.fmt,
      grossMargins: financialData.grossMargins?.raw,
      operatingMargins: financialData.operatingMargins?.raw,
      totalRevenue: financialData.totalRevenue?.raw,
      totalRevenueFormatted: financialData.totalRevenue?.fmt,
      netIncome: keyStats.netIncomeToCommon?.raw,
      netIncomeFormatted: keyStats.netIncomeToCommon?.fmt,
      
      // Growth metrics
      revenueGrowth: financialData.revenueGrowth?.raw,
      revenueGrowthFormatted: financialData.revenueGrowth?.fmt,
      earningsGrowth: financialData.earningsGrowth?.raw,
      earningsGrowthFormatted: financialData.earningsGrowth?.fmt,
      revenuePerShare: financialData.revenuePerShare?.raw,
      earningsQuarterlyGrowth: keyStats.earningsQuarterlyGrowth?.raw,
      
      // Valuation metrics
      peRatio: keyStats.forwardPE?.raw || keyStats.trailingPE?.raw,
      peRatioFormatted: keyStats.forwardPE?.fmt || keyStats.trailingPE?.fmt,
      priceToBook: keyStats.priceToBook?.raw,
      priceToBookFormatted: keyStats.priceToBook?.fmt,
      enterpriseValue: keyStats.enterpriseValue?.raw,
      enterpriseValueFormatted: keyStats.enterpriseValue?.fmt,
      pegRatio: keyStats.pegRatio?.raw,
      
      // Industry info
      sector: price.sector,
      industry: price.industry,
    };
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return null;
  }
}

function buildSystemPrompt(question: string, followUp?: boolean): string {
  const base = `You are a friendly financial educator helping beginners understand stocks. 
Use simple language, avoid jargon, and explain concepts with relatable analogies.
Always be accurate with the data provided but make it accessible.
Format numbers in a human-readable way (e.g., "$97 billion" not "$97,000,000,000").`;

  if (followUp) {
    return base + `\n\nThis is a follow-up question. Provide deeper insight with analogies and competitor comparisons.`;
  }
  
  return base;
}

function buildUserPrompt(ticker: string, companyName: string, question: string, stockData: any, followUp?: boolean): string {
  const dataContext = stockData ? `
Real data for ${ticker} (${companyName}):
- Market Cap: ${stockData.marketCapFormatted || 'N/A'}
- Profit Margins: ${stockData.profitMarginsFormatted || 'N/A'}
- Gross Margins: ${stockData.grossMargins ? (stockData.grossMargins * 100).toFixed(1) + '%' : 'N/A'}
- Operating Margins: ${stockData.operatingMargins ? (stockData.operatingMargins * 100).toFixed(1) + '%' : 'N/A'}
- Total Revenue: ${stockData.totalRevenueFormatted || 'N/A'}
- Net Income: ${stockData.netIncomeFormatted || 'N/A'}
- Revenue Growth: ${stockData.revenueGrowthFormatted || 'N/A'}
- Earnings Growth: ${stockData.earningsGrowthFormatted || 'N/A'}
- P/E Ratio: ${stockData.peRatioFormatted || 'N/A'}
- Price to Book: ${stockData.priceToBookFormatted || 'N/A'}
- PEG Ratio: ${stockData.pegRatio || 'N/A'}
- Sector: ${stockData.sector || 'N/A'}
- Industry: ${stockData.industry || 'N/A'}
` : `No real-time data available. Provide general educational information about ${companyName}.`;

  switch (question) {
    case 'profitability':
      return `${dataContext}

Question: Is ${companyName} making money?

Analyze the profitability of this company. Focus on:
1. Whether the company is profitable (net income positive)
2. Profit margins compared to industry average
3. Revenue scale and sustainability

${followUp ? 'Provide detailed breakdown with 3 numbered reasons and real metrics.' : 'Give a simple, beginner-friendly answer first.'}`;

    case 'growth':
      return `${dataContext}

Question: Is ${companyName} growing?

Analyze the growth trajectory of this company. Focus on:
1. Revenue growth rate year-over-year
2. Earnings growth trends
3. Comparison to industry growth rates

${followUp ? 'Use an analogy (like oak tree vs sapling) to explain what this growth rate means. Include competitor comparisons with real numbers.' : 'Give a simple, beginner-friendly answer about growth.'}`;

    case 'valuation':
      return `${dataContext}

Question: Is ${companyName} expensive?

Analyze the valuation of this company. Focus on:
1. P/E ratio compared to industry and S&P 500 average (~25)
2. Price to book value
3. What this means for potential investors

Explain in plain language what "expensive" means for a stock.`;

    default:
      return `Analyze ${companyName} (${ticker}) based on the available data.`;
  }
}

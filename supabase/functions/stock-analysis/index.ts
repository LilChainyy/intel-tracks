// @ts-ignore - Deno types are available at runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno types are available at runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// @ts-ignore - Deno global is available at runtime
declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
}

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

// Validate ticker symbol format: 1-10 alphanumeric chars, may include hyphen and dot
function isValidTicker(ticker: string): boolean {
  if (!ticker || typeof ticker !== 'string') return false;
  const tickerRegex = /^[A-Z0-9.-]{1,10}$/i;
  return tickerRegex.test(ticker.trim());
}

const validQuestions = ['profitability', 'growth', 'valuation'];

// Helper function to create error responses
function createErrorResponse(error: string, status: number, details?: any): Response {
  console.error(`Error Response: Status ${status}, Error: ${error}, Details:`, details);
  return new Response(
    JSON.stringify({ error, details }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Optional authentication (for testing in Supabase dashboard)
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseAnonKey) {
          console.warn('Supabase URL or anon key not configured');
        } else {
          const supabase = createClient(
            supabaseUrl,
            supabaseAnonKey,
            { global: { headers: { Authorization: authHeader } } }
          );

          const token = authHeader.replace('Bearer ', '');
          const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

          if (!claimsError && claimsData?.claims) {
            userId = claimsData.claims.sub;
            console.log(`Authenticated user: ${userId}`);
          } else {
            console.warn('Auth error (continuing without auth):', claimsError);
          }
        }
      } catch (authErr) {
        console.warn('Auth check failed (continuing without auth):', authErr);
      }
    } else {
      console.log('No auth header provided (testing mode)');
    }

    let requestBody: StockAnalysisRequest;
    try {
      requestBody = await req.json();
      console.log('Parsed request body:', JSON.stringify(requestBody).substring(0, 500));
    } catch (parseError) {
      console.warn('Could not parse request body as JSON, assuming empty object:', parseError);
      requestBody = { ticker: 'AAPL', companyName: 'Apple Inc', question: 'profitability' }; // Default for testing
    }

    let { ticker, companyName, question, followUp } = requestBody;

    // Default values for testing in Supabase dashboard
    if (!ticker || !isValidTicker(ticker)) {
      console.log('Invalid or missing ticker, using default for testing.');
      ticker = 'AAPL';
      companyName = companyName || 'Apple Inc';
    }
    if (!question || !validQuestions.includes(question)) {
      console.log('Invalid or missing question type, using default for testing.');
      question = 'profitability';
    }

    const safeTicker = encodeURIComponent(ticker.toUpperCase().trim());
    
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured in environment variables.');
      return createErrorResponse("GROQ_API_KEY is not configured", 500);
    }

    // Fetch real stock data from Yahoo Finance
    const stockData = await fetchStockData(safeTicker);
    
    // Build prompt based on question type
    const systemPrompt = buildSystemPrompt(question, followUp);
    const userPrompt = buildUserPrompt(ticker, companyName, question, stockData, followUp);

    console.log('Calling Groq API with:', {
      model: "llama-3.1-8b-instant",
      hasApiKey: !!GROQ_API_KEY,
    });

    let response: Response;
    try {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
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
                    simpleAnswer: { type: "string", description: "MAXIMUM 2-3 sentences. Simple yes/no explanation for 15-year-olds. Be super brief and direct." },
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
                },
              },
            }
          ],
          tool_choice: { type: "function", function: { name: "analyze_stock" } },
          max_tokens: 500,
        }),
      });
    } catch (fetchError) {
      console.error('Fetch to Groq API failed:', fetchError);
      return createErrorResponse(`Failed to connect to AI API: ${fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'}`, 500, fetchError);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);

      if (response.status === 401) {
        return createErrorResponse("Invalid Groq API key. Please check your GROQ_API_KEY secret.", 500, errorText);
      } else if (response.status === 429) {
        return createErrorResponse("Rate limits exceeded, please try again later.", 429, errorText);
      } else if (response.status === 404) {
        return createErrorResponse(`Model not found: ${errorText}. Please check the model name.`, 500, errorText);
      } else if (response.status === 400) {
        return createErrorResponse(`Bad request: ${errorText}. Check message format.`, 400, errorText);
      }
      return createErrorResponse(`AI API error (${response.status}): ${errorText}`, 500, errorText);
    }

    const data = await response.json();
    // Groq (OpenAI format) returns tool_calls in choices[0].message
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

    return createErrorResponse("No structured response received from AI. Check AI prompt or model output.", 500, data);
  } catch (error) {
    console.error("Stock analysis error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error && error.stack ? `\n\nStack: ${error.stack.substring(0, 500)}` : '';
    return createErrorResponse(`Internal server error: ${errorMessage}${errorDetails}`, 500);
  }
});

async function fetchStockData(safeTicker: string) {
  try {
    // safeTicker is already validated and URL-encoded
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${safeTicker}?modules=financialData,defaultKeyStatistics,incomeStatementHistory,earnings,price`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`Yahoo Finance error for ${safeTicker}: ${response.status}`);
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
      ticker: safeTicker,
      name: price.shortName || price.longName || safeTicker,
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
  const base = `You're explaining stocks to a 15-year-old. Keep it SHORT and SIMPLE.

CRITICAL RULES:
- MAXIMUM 2-3 sentences for simpleAnswer (cut to 1/3 normal length)
- Use simple words - no jargon
- Write like texting a friend
- Format numbers simply (e.g., "$97 billion" not "$97,000,000,000")
- Be direct - no fluff`;

  if (followUp) {
    return base + `\n\nThis is a follow-up. Still keep it brief but add one quick analogy or comparison.`;
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

Keep your simpleAnswer to MAXIMUM 2-3 sentences. Be direct:
- Are they profitable? (yes/no + one reason)
- How's their profit margin? (compare briefly)

${followUp ? 'Add 2-3 brief details with metrics. Keep it short.' : 'Super brief answer - 2-3 sentences max.'}`;

    case 'growth':
      return `${dataContext}

Question: Is ${companyName} growing?

Keep your simpleAnswer to MAXIMUM 2-3 sentences. Be direct:
- How fast are they growing? (one number)
- Is that good or bad? (brief comparison)

${followUp ? 'Add one quick analogy and 2-3 brief details. Keep it short.' : 'Super brief answer - 2-3 sentences max.'}`;

    case 'valuation':
      return `${dataContext}

Question: Is ${companyName} expensive?

Keep your simpleAnswer to MAXIMUM 2-3 sentences. Be direct:
- What's the P/E ratio? (one number)
- Is that expensive? (yes/no + one reason)

Explain what "expensive" means in simple terms. Super brief - 2-3 sentences max.`;

    default:
      return `Analyze ${companyName} (${ticker}) based on the available data.`;
  }
}

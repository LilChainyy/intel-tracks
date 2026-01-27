// @ts-ignore - Deno types are available at runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

const SYSTEM_PROMPT = `You're explaining companies to a 15-year-old. Keep it SHORT and SIMPLE.

CRITICAL RULES:
- MAXIMUM 2-3 sentences TOTAL (cut to 1/3 normal length)
- One paragraph only - no multiple paragraphs
- Get straight to the point - no fluff
- Write like texting a friend (use "you", contractions)
- NO markdown: no **, no bullets, no formatting
- Replace jargon immediately:
  - "fundamentals" → "how the business is doing"
  - "volatility" → "price swings"
  - "margins" → "profit per sale"
  - "capital" → "money"

EXAMPLES:
BAD (too long): "Apple makes iPhones and computers. They make money by selling these products to millions of people around the world. The company is in the technology industry and competes with companies like Samsung and Google."
GOOD (crisp): "Apple makes iPhones and computers. They sell millions of them and make tons of money."

BAD: "The company faces risks from competition and economic downturns that could affect their sales."
GOOD: "Competition and a bad economy could hurt their sales."

TOPICS: What they do, risks, and if the price is fair. Be direct and super brief.`;

// Validate ticker symbol format: 1-10 alphanumeric chars, may include hyphen and dot
function isValidTicker(ticker: string): boolean {
  if (!ticker || typeof ticker !== 'string') return false;
  const tickerRegex = /^[A-Z0-9.-]{1,10}$/i;
  return tickerRegex.test(ticker.trim());
}

// Helper function to create error responses
function createErrorResponse(error: string, status: number): Response {
  return new Response(
    JSON.stringify({ error }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let requestBody: any = {}
    try {
      requestBody = await req.json()
    } catch (parseError) {
      // If no body, use defaults for testing
      requestBody = {
        messages: [{ role: 'user', content: 'Tell me about Apple' }],
        ticker: 'AAPL',
        companyName: 'Apple Inc'
      }
    }

    const { messages, ticker, companyName } = requestBody
    
    // Use defaults for testing if ticker is missing
    const testTicker = ticker || 'AAPL'
    const testCompanyName = companyName || 'Apple Inc'
    
    if (!isValidTicker(testTicker)) {
      return createErrorResponse(`Invalid ticker symbol: "${testTicker}". Must be 1-10 alphanumeric characters (e.g., AAPL, MSFT, TSLA).`, 400);
    }

    const safeTicker = encodeURIComponent(testTicker.toUpperCase().trim());
    
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Extract messages with fallback
    const messageList = messages || []
    if (!Array.isArray(messageList) || messageList.length === 0) {
      requestBody.messages = [{ role: 'user', content: `Tell me about ${testCompanyName}` }]
    }

    // Fetch real stock data
    const stockData = await fetchStockData(safeTicker);
    
    const contextPrompt = stockData 
      ? `\n\nCurrent data for ${testCompanyName} (${testTicker}):\n${formatStockData(stockData)}`
      : `\n\nNo real-time data available for ${testCompanyName}. Provide general educational information.`;

    // Convert messages to Claude format
    const claudeMessages = requestBody.messages
      .filter((msg: any) => msg && msg.role !== 'system' && msg.content)
      .map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: typeof msg.content === 'string' ? msg.content : String(msg.content || ''),
      }));
    
    if (claudeMessages.length === 0) {
      return createErrorResponse('No valid messages found. Each message must have "role" and "content" fields.', 400);
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        system: SYSTEM_PROMPT + contextPrompt,
        messages: claudeMessages,
        max_tokens: 150,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return createErrorResponse("Rate limits exceeded, please try again later.", 429);
      }
      const errorText = await response.text();
      console.error("Claude API error:", response.status, errorText);
      return createErrorResponse("AI API error", 500);
    }

    // Convert Claude SSE format to OpenAI-compatible format for frontend
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'content_block_delta' && data.delta?.text) {
                    const openAIFormat = {
                      id: 'chatcmpl',
                      object: 'chat.completion.chunk',
                      created: Math.floor(Date.now() / 1000),
                      model: 'claude-3-haiku',
                      choices: [{
                        index: 0,
                        delta: { content: data.delta.text },
                        finish_reason: null,
                      }],
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIFormat)}\n\n`));
                  } else if (data.type === 'message_stop') {
                    const finalChunk = {
                      id: 'chatcmpl',
                      object: 'chat.completion.chunk',
                      created: Math.floor(Date.now() / 1000),
                      model: 'claude-3-haiku',
                      choices: [{
                        index: 0,
                        delta: {},
                        finish_reason: 'stop',
                      }],
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  }
                } catch (e) {
                  // Skip invalid JSON lines
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse(errorMessage, 500);
  }
});

async function fetchStockData(safeTicker: string) {
  try {
    // safeTicker is already validated and URL-encoded
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${safeTicker}?modules=financialData,defaultKeyStatistics,price`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.quoteSummary?.result?.[0];
    if (!result) return null;

    return {
      financialData: result.financialData || {},
      keyStats: result.defaultKeyStatistics || {},
      price: result.price || {},
    };
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return null;
  }
}

function formatStockData(data: any): string {
  const { financialData, keyStats, price } = data;
  
  return `
- Current Price: ${price.regularMarketPrice?.fmt || 'N/A'}
- Market Cap: ${price.marketCap?.fmt || 'N/A'}
- P/E Ratio: ${keyStats.forwardPE?.fmt || keyStats.trailingPE?.fmt || 'N/A'}
- Profit Margin: ${financialData.profitMargins?.fmt || 'N/A'}
- Revenue Growth: ${financialData.revenueGrowth?.fmt || 'N/A'}
- Earnings Growth: ${financialData.earningsGrowth?.fmt || 'N/A'}
- Sector: ${price.sector || 'N/A'}
- Industry: ${price.industry || 'N/A'}
`.trim();
}

// Enhanced advisor-chat with structured prompts and curated stock knowledge
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: { env: { get(key: string): string | undefined } };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

//========================================
// CURATED STOCK KNOWLEDGE (Ground Truth)
//========================================
const STOCK_KNOWLEDGE: Record<string, any> = {
  CCJ: {
    description: "Cameco mines and sells uranium, the fuel that powers nuclear reactors. They control about 15% of global uranium supply.",
    keyProducts: ["Uranium mining", "Uranium refining", "Nuclear fuel services"],
    whyItMatters: "AI datacenters need 24/7 power. Nuclear is the only carbon-free option. Cameco benefits from this AI power surge.",
    themes: ["nuclear"],
  },
  NFLX: {
    description: "Netflix streams movies and TV shows to 260M+ subscribers worldwide. They invented binge-watching and now adding ads + live sports.",
    keyProducts: ["Streaming subscription", "Ad-supported tier", "Live sports", "Original content"],
    whyItMatters: "Netflix survived the streaming wars. They're profitable, growing, and have pricing power while competitors struggle.",
    themes: ["netflix"],
  },
  AAPL: {
    description: "Apple makes iPhones, Macs, iPads, and runs the App Store. They're the world's most valuable company with a cult-like customer base.",
    keyProducts: ["iPhone", "Mac computers", "iPad", "Apple Watch", "App Store"],
    whyItMatters: "Apple has the most loyal customers and highest profit margins in tech. Their ecosystem locks people in for life.",
    themes: ["indexchill"],
  },
  // Add more as needed...
};

//========================================
// PROMPT ENGINEERING
//========================================
const BASE_SYSTEM_PROMPT = `You are the Adamsmyth AI Advisor. Your job is to teach investing in simple, friendly language.

RULES:
1. Keep responses SHORT: 2-3 sentences max
2. No jargon unless explained
3. No markdown formatting
4. Write like a smart friend texting
5. End with ONE follow-up question to keep conversation going
6. Never give "buy/sell" advice - educate only

Replacements:
- "fundamentals" → "how the business is doing"
- "volatility" → "price swings"
- "margins" → "profit per sale"
- "valuation" → "if the price is fair"`;

function buildStockPrompt(ticker: string, stockData: any, userQuestion: string): string {
  const knowledge = STOCK_KNOWLEDGE[ticker];

  let prompt = BASE_SYSTEM_PROMPT + `\n\n`;
  prompt += `CONTEXT FOR ${ticker}:\n`;
  prompt += `Company: ${stockData.name || ticker}\n`;
  prompt += `What it does: ${knowledge?.description || stockData.description || "Unknown"}\n`;
  prompt += `Current price: ${stockData.priceDisplay || "N/A"}\n`;
  prompt += `Market size: ${stockData.marketCapDisplay || "N/A"}\n`;
  prompt += `Sector: ${stockData.sector || "Unknown"}\n\n`;

  if (knowledge?.keyProducts?.length) {
    prompt += `Key products:\n${knowledge.keyProducts.map((p: string) => `- ${p}`).join("\n")}\n\n`;
  }

  if (knowledge?.whyItMatters) {
    prompt += `Why it matters: ${knowledge.whyItMatters}\n\n`;
  }

  if (stockData.news?.length) {
    prompt += `Recent news:\n`;
    stockData.news.slice(0, 3).forEach((n: any) => {
      prompt += `- ${n.title} (${n.source})\n`;
    });
    prompt += `\n`;
  }

  prompt += `USER QUESTION: "${userQuestion}"\n\n`;
  prompt += `RESPONSE GUIDELINES:
- Answer their specific question first
- Use the context above (don't make stuff up!)
- If question is about something not in context, say "I don't have that data" and pivot to what you DO know
- End with ONE follow-up question like "Want to know about their competitors?" or "Should I explain their business model?"`;

  return prompt;
}

//========================================
// YAHOO FINANCE FETCHER
//========================================
async function fetchEnhancedStock(ticker: string): Promise<any> {
  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price,summaryProfile`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible)" },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const result = data.quoteSummary?.result?.[0];
    if (!result) return null;

    const price = result.price || {};
    const profile = result.summaryProfile || {};
    const knowledge = STOCK_KNOWLEDGE[ticker];

    return {
      ticker,
      name: price.longName || price.shortName || ticker,
      description: knowledge?.description || profile.longBusinessSummary || "",
      sector: profile.sector || "Unknown",
      industry: profile.industry || "Unknown",
      price: price.regularMarketPrice?.raw || 0,
      priceDisplay: `$${(price.regularMarketPrice?.raw || 0).toFixed(2)}`,
      marketCap: price.marketCap?.raw || 0,
      marketCapDisplay: formatMarketCap(price.marketCap?.raw || 0),
      themes: knowledge?.themes || [],
      keyProducts: knowledge?.keyProducts || [],
      whyItMatters: knowledge?.whyItMatters || "",
      news: [], // Fetch separately if needed
    };
  } catch (e) {
    console.error("Stock fetch error:", e);
    return null;
  }
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return "$0";
}

//========================================
// MAIN HANDLER
//========================================
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const ticker = body.ticker?.toUpperCase().trim();

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build chat history
    const chatHistory = messages
      .filter((m: any) => m?.role && m?.content)
      .map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || ""),
      }));

    if (chatHistory.length === 0) {
      return new Response(
        JSON.stringify({ error: "No messages provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lastUserMessage = chatHistory.filter((m: any) => m.role === "user").pop()?.content || "";

    // Determine system prompt
    let systemPrompt = BASE_SYSTEM_PROMPT;

    if (ticker && /^[A-Z]{1,5}$/.test(ticker)) {
      // Fetch stock data
      const stockData = await fetchEnhancedStock(ticker);
      if (stockData) {
        systemPrompt = buildStockPrompt(ticker, stockData, lastUserMessage);
      } else {
        systemPrompt = BASE_SYSTEM_PROMPT + `\n\nUser asked about ${ticker}, but we couldn't find data. Politely say you don't have info on that ticker and ask if they meant something else.`;
      }
    }

    // Call Groq
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory,
        ],
        max_tokens: 200, // Keep it concise
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", response.status, err);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream response
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
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const payload = line.slice(6).trim();
              if (payload === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }

              try {
                const parsed = JSON.parse(payload);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`));
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (e) {
          console.error("Stream error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("advisor-chat error:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

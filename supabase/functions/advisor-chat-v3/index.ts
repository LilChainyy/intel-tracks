// Enhanced advisor-chat with structured responses and conversation flow
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: { env: { get(key: string): string | undefined } };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

//========================================
// CURATED STOCK KNOWLEDGE
//========================================
const STOCK_KNOWLEDGE: Record<string, any> = {
  AAPL: {
    name: "Apple",
    description: "Apple designs consumer electronics (iPhone, Mac, iPad) and runs subscription services (Apple Music, iCloud, App Store). They make money from selling devices at high margins and from recurring service fees.",
    whyInvestorsCare: "Apple has 2 billion active devices creating a sticky ecosystem. Once you buy an iPhone, you're likely to buy AirPods and subscribe to iCloud. This generates predictable, growing revenue.",
    keyFacts: [
      "Market leader in premium smartphones globally",
      "Services revenue grew 16% last year (more stable than device sales)",
      "Recently launched Vision Pro headset, entering spatial computing"
    ],
    themes: ["indexchill"],
  },
  NFLX: {
    name: "Netflix",
    description: "Netflix streams movies and TV shows to 260M+ subscribers worldwide. They pioneered binge-watching and are now adding ads and live sports to grow revenue.",
    whyInvestorsCare: "Netflix survived the streaming wars and became profitable while competitors like Disney+ and HBO Max struggle. They have pricing power and loyal subscribers.",
    keyFacts: [
      "Ad-supported tier hit 40M users in 18 months",
      "Password crackdown added 13M subscribers in one quarter",
      "Adding live sports (WWE, NFL) to keep viewers engaged"
    ],
    themes: ["netflix"],
  },
  CCJ: {
    name: "Cameco",
    description: "Cameco mines and sells uranium, the fuel that powers nuclear reactors. They control about 15% of global uranium supply.",
    whyInvestorsCare: "AI datacenters need 24/7 clean power. Nuclear is the only carbon-free option that runs all day. Tech giants like Microsoft are signing long-term uranium contracts, driving demand.",
    keyFacts: [
      "Uranium prices doubled since 2020 due to supply shortage",
      "Microsoft signed deal to restart Three Mile Island reactor",
      "New mines take 10+ years to develop, creating supply squeeze"
    ],
    themes: ["nuclear"],
  },
  // Add more stocks here...
};

//========================================
// SYSTEM PROMPT WITH STRUCTURED TEMPLATE
//========================================
const SYSTEM_PROMPT = `You are a patient and sweet investment education assistant for beginners.

CRITICAL: When a ticker/company is in the context, ALWAYS structure your response EXACTLY like this (regardless of the question):

**What [Company] Does**
[2 sentences max - core business in plain English]

**Why People Invest**
[1-2 sentences - what makes it interesting to investors]

**Key Things to Know**
- [One notable product/service]
- [One market position fact]
- [One recent development or risk]

Then ALWAYS end with: "What would you like to explore next?"

EXAMPLES OF WHEN TO USE THIS FORMAT:
- User says: "apple" → Use format
- User says: "tell me about netflix" → Use format
- User says: "what's the latest on tesla" → Use format
- User says: "is nvidia good" → Use format

ANY ticker mention = Use the structured format above!

CRITICAL RULES:
- ALWAYS end with a question ("What would you like to explore next?")
- Never use jargon without explaining it
- Never give buy/sell recommendations
- If user asks "should I buy X", respond: "I can't tell you what to buy, but I can help you understand the company and the risks. Want to learn about [Company]'s business model or recent performance?"
- If user goes completely off-topic (not about investing/stocks), redirect: "I'm here to help you learn about investing. What company or theme interests you?"
- Always use the context provided (don't make stuff up!)
- Keep it conversational and friendly

FOLLOW-UP OPTIONS:
The system will automatically show 4 clickable buttons after your response. Don't mention them - just end with "What would you like to explore next?"`;

//========================================
// CONVERSATION FLOW LOGIC
//========================================
function generateFollowUpOptions(ticker: string | null, userIntent: string): any[] {
  const options: any[] = [];

  if (ticker) {
    const stock = STOCK_KNOWLEDGE[ticker];
    const stockName = stock?.name || ticker;

    // Intent-based follow-ups
    if (userIntent.includes("news") || userIntent.includes("latest")) {
      options.push(
        { label: `Compare ${stockName} to competitors`, action: { type: "compare", ticker } },
        { label: `View ${stock?.themes?.[0] || "Technology"} theme`, action: { type: "theme", theme: stock?.themes?.[0] } },
        { label: "Learn about market cap and valuation", action: { type: "learn", topic: "valuation" } },
        { label: "Browse all themes", action: { type: "browse_themes" } }
      );
    } else {
      // Default company follow-ups
      options.push(
        { label: `See ${stockName}'s latest news`, action: { type: "news", ticker } },
        { label: `Compare ${stockName} to peers`, action: { type: "compare", ticker } },
        { label: `View ${stock?.themes?.[0] || "related"} stocks`, action: { type: "theme", theme: stock?.themes?.[0] } },
        { label: "Learn investing basics", action: { type: "learn", topic: "basics" } }
      );
    }
  } else {
    // General follow-ups (no ticker)
    options.push(
      { label: "Browse investment themes", action: { type: "browse_themes" } },
      { label: "Search for a company", action: { type: "search" } },
      { label: "Learn about stock basics", action: { type: "learn", topic: "stocks_101" } },
      { label: "Popular stocks right now", action: { type: "popular" } }
    );
  }

  return options;
}

//========================================
// YAHOO FINANCE FETCHER
//========================================
async function fetchStockData(ticker: string): Promise<any> {
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

    return {
      ticker,
      name: price.longName || price.shortName || ticker,
      price: price.regularMarketPrice?.raw || 0,
      priceDisplay: `$${(price.regularMarketPrice?.raw || 0).toFixed(2)}`,
      marketCap: price.marketCap?.raw || 0,
      marketCapDisplay: formatMarketCap(price.marketCap?.raw || 0),
      sector: profile.sector || "Unknown",
      industry: profile.industry || "Unknown",
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
// BUILD CONTEXT FOR AI
//========================================
function buildContext(ticker: string, liveData: any): string {
  const knowledge = STOCK_KNOWLEDGE[ticker];
  if (!knowledge) return `Ticker ${ticker} - No curated knowledge available. Use general info only.`;

  let context = `COMPANY: ${knowledge.name} (${ticker})\n\n`;
  context += `WHAT IT DOES:\n${knowledge.description}\n\n`;
  context += `WHY INVESTORS CARE:\n${knowledge.whyInvestorsCare}\n\n`;
  context += `QUICK FACTS:\n${knowledge.keyFacts.map((f: string) => `- ${f}`).join("\n")}\n\n`;

  if (liveData) {
    context += `LIVE DATA:\n`;
    context += `- Current price: ${liveData.priceDisplay}\n`;
    context += `- Market cap: ${liveData.marketCapDisplay}\n`;
    context += `- Sector: ${liveData.sector}\n`;
  }

  return context;
}

//========================================
// DETECT USER INTENT & ENHANCE QUERY
//========================================
function detectIntent(message: string, lastTicker: string | null): {
  type: string;
  shouldBuyDetected: boolean;
  isFollowUp: boolean;
  enhancedQuery: string;
} {
  const lower = message.toLowerCase();

  // Detect "should I buy" questions
  if (
    lower.includes("should i buy") ||
    lower.includes("should i invest") ||
    lower.includes("is it a good buy") ||
    lower.includes("worth buying")
  ) {
    return { type: "should_buy", shouldBuyDetected: true, isFollowUp: false, enhancedQuery: message };
  }

  // Detect follow-up questions (contextual words without explicit ticker)
  const followUpKeywords = [
    'competition', 'competitors', 'rival', 'compete',
    'their', 'they', 'its', 'it',
    'what about', 'how about',
    'products', 'revenue', 'ceo', 'earnings',
    'debt', 'growth', 'margin', 'profit'
  ];

  const hasFollowUpKeyword = followUpKeywords.some(kw => lower.includes(kw));
  const hasTickerMention = /\b[A-Z]{2,5}\b/.test(message); // Check for explicit ticker

  const isFollowUp = hasFollowUpKeyword && !hasTickerMention && lastTicker;

  // Enhance query with context if it's a follow-up
  let enhancedQuery = message;
  if (isFollowUp && lastTicker) {
    if (lower.includes('competition') || lower.includes('competitor')) {
      enhancedQuery = `Who are ${lastTicker}'s main competitors?`;
    } else if (lower.includes('their') || lower.includes('they')) {
      enhancedQuery = `${message} (talking about ${lastTicker})`;
    } else if (lower.includes('what about') || lower.includes('how about')) {
      enhancedQuery = message.replace(/what about|how about/i, `What about ${lastTicker}'s`);
    } else {
      enhancedQuery = `[User is asking about ${lastTicker}] ${message}`;
    }
  }

  // Detect question types
  if (lower.includes("news") || lower.includes("latest")) {
    return { type: "news", shouldBuyDetected: false, isFollowUp, enhancedQuery };
  }
  if (lower.includes("compare") || lower.includes("vs") || lower.includes("versus")) {
    return { type: "compare", shouldBuyDetected: false, isFollowUp, enhancedQuery };
  }
  if (lower.includes("risk")) {
    return { type: "risks", shouldBuyDetected: false, isFollowUp, enhancedQuery };
  }
  if (lower.includes("price") || lower.includes("valuation")) {
    return { type: "valuation", shouldBuyDetected: false, isFollowUp, enhancedQuery };
  }

  return { type: "general", shouldBuyDetected: false, isFollowUp, enhancedQuery };
}

function extractLastTickerFromHistory(messages: any[]): string | null {
  // Scan message history in reverse to find last mentioned ticker
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === 'assistant' && msg.content) {
      // Look for ticker pattern in assistant messages
      const match = msg.content.match(/\(([A-Z]{2,5})\)/);
      if (match) return match[1];
    }
  }
  return null;
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
    const intent = detectIntent(lastUserMessage);

    // Handle "should I buy" separately
    if (intent.shouldBuyDetected) {
      const quickResponse = `I can't tell you what to buy — that's a decision only you can make after doing your research. But I can help you understand the company, the risks, and what to look for. Want to learn about ${ticker || "investing fundamentals"}?`;

      // Return non-streaming response with follow-ups
      const followUps = generateFollowUpOptions(ticker, "learn");

      return new Response(
        JSON.stringify({
          response: quickResponse,
          followUps,
          disclaimerShown: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch stock data if ticker provided
    let stockContext = SYSTEM_PROMPT;
    let liveData = null;

    if (ticker && /^[A-Z]{1,5}$/.test(ticker)) {
      liveData = await fetchStockData(ticker);
      if (liveData) {
        const context = buildContext(ticker, liveData);
        stockContext = SYSTEM_PROMPT + `\n\n---\nCONTEXT:\n${context}`;
      } else {
        stockContext = SYSTEM_PROMPT + `\n\n---\nUser asked about ${ticker}, but we couldn't find data. Politely say we don't have info on that ticker.`;
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
          { role: "system", content: stockContext },
          ...chatHistory,
        ],
        max_tokens: 300,
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

    // Stream response + append follow-ups at the end
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let fullResponse = "";

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
              if (payload === "[DONE]") continue;

              try {
                const parsed = JSON.parse(payload);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) fullResponse += content;

                // Forward to client
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`));
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }

          // After stream completes, send follow-up options
          const followUps = generateFollowUpOptions(ticker, intent.type);
          const followUpMessage = {
            type: "follow_ups",
            options: followUps,
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(followUpMessage)}\n\n`));
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

// @ts-ignore - Deno types are available at runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno types are available at runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: { env: { get(key: string): string | undefined } };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMPANY_SYSTEM_PROMPT = `You're explaining companies to a 15-year-old. Keep it SHORT and SIMPLE.
CRITICAL RULES: MAXIMUM 2-3 sentences. One paragraph only. No markdown. Write like texting a friend.
Replace jargon: "fundamentals"→"how the business is doing", "volatility"→"price swings", "margins"→"profit per sale".
Topics: What they do, risks, and if the price is fair.`;

const GENERAL_SYSTEM_PROMPT = `You are the Adamsmyth AI Advisor. Explain stocks and investing in simple terms.
Keep answers 2-3 sentences. Write like a smart friend. No financial advice when appropriate.`;

function createErrorResponse(error: string, status: number): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isValidTicker(ticker: string): boolean {
  if (!ticker || typeof ticker !== "string") return false;
  return /^[A-Z0-9.-]{1,10}$/i.test(ticker.trim());
}

async function fetchYahooStockData(ticker: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=financialData,defaultKeyStatistics,price`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const r = data.quoteSummary?.result?.[0];
    if (!r) return null;
    const { financialData, defaultKeyStatistics, price } = r;
    return `
- Current Price: ${price?.regularMarketPrice?.fmt || "N/A"}
- Market Cap: ${price?.marketCap?.fmt || "N/A"}
- P/E: ${defaultKeyStatistics?.forwardPE?.fmt || defaultKeyStatistics?.trailingPE?.fmt || "N/A"}
- Profit Margin: ${financialData?.profitMargins?.fmt || "N/A"}
- Revenue Growth: ${financialData?.revenueGrowth?.fmt || "N/A"}
`.trim();
  } catch (e) {
    console.error("Yahoo fetch error:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
        if (supabaseUrl && supabaseAnonKey) {
          const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
          });
          const token = authHeader.replace("Bearer ", "");
          const { data } = await supabase.auth.getClaims(token);
          if (data?.claims?.sub) userId = data.claims.sub;
        }
      } catch (e) {
        console.warn("Auth check failed:", e);
      }
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = { messages: [{ role: "user", content: "Hello" }] };
    }

    const messages = Array.isArray(body.messages) ? body.messages : [{ role: "user", content: "Hello" }];
    const ticker = body.ticker && isValidTicker(body.ticker) ? body.ticker.toUpperCase().trim() : null;
    const companyName = body.companyName || ticker || "";

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) return createErrorResponse("GROQ_API_KEY not configured", 500);

    const chatMessages = messages
      .filter((m: any) => m?.role && m?.content)
      .map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || ""),
      }));

    if (chatMessages.length === 0) return createErrorResponse("No valid messages", 400);

    let systemPrompt = GENERAL_SYSTEM_PROMPT;
    if (ticker) {
      const stockContext = await fetchYahooStockData(encodeURIComponent(ticker));
      systemPrompt =
        COMPANY_SYSTEM_PROMPT +
        (stockContext
          ? `\n\nCurrent data for ${companyName} (${ticker}):\n${stockContext}`
          : `\n\nNo real-time data for ${companyName}. Provide general educational info.`);
    }

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
          ...chatMessages,
        ],
        max_tokens: ticker ? 150 : 400,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", response.status, err);
      if (response.status === 429) return createErrorResponse("Rate limits exceeded", 429);
      return createErrorResponse("AI API error", 500);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let fullAssistantContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }
        try {
          // Groq streams OpenAI-compatible SSE -- pass through and collect content
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
                const chunk = parsed.choices?.[0]?.delta?.content;
                if (chunk) fullAssistantContent += chunk;
                // Forward the SSE line as-is (already OpenAI format)
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`));
                if (parsed.choices?.[0]?.finish_reason === "stop") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                }
              } catch (e) {
                /* skip invalid JSON */
              }
            }
          }

          if (ticker && userId && fullAssistantContent) {
            try {
              const lastUser = chatMessages.filter((m: any) => m.role === "user").pop();
              const userQ = lastUser?.content || "";
              const analysisRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${GROQ_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "llama-3.1-8b-instant",
                  messages: [
                    {
                      role: "user",
                      content: `Analyze this Q&A about ${companyName} (${ticker}).
User: ${userQ}
AI: ${fullAssistantContent}
Categories: understanding (company_fundamental,financial_health,industry_context), risks (company_risks,external_risks,investment_risks), valuation (current_price,company_valuation,expected_returns)
Return JSON only: {"category":"understanding|risks|valuation|none","subcategory":"...","summary":"one sentence","questions":["q1","q2","q3"]}`,
                    },
                  ],
                  max_tokens: 512,
                }),
              });
              if (analysisRes.ok) {
                const ad = await analysisRes.json();
                const txt = ad.choices?.[0]?.message?.content;
                if (txt) {
                  const cleaned = txt.replace(/```json\n?|\n?```/g, "").trim();
                  const parsed = JSON.parse(cleaned);
                  const meta = {
                    type: "advisor_metadata",
                    classification:
                      parsed.category && parsed.category !== "none"
                        ? {
                            category: parsed.category,
                            subcategory: parsed.subcategory || "",
                            summary: parsed.summary || "",
                          }
                        : null,
                    suggested_questions: Array.isArray(parsed.questions) ? parsed.questions : [],
                  };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(meta)}\n\n`));

                  const supabaseUrl = Deno.env.get("SUPABASE_URL");
                  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
                  if (supabaseUrl && supabaseServiceKey && parsed.category && parsed.category !== "none") {
                    const supabase = createClient(supabaseUrl, supabaseServiceKey);
                    await supabase.from("passive_log").insert({
                      user_id: userId,
                      ticker,
                      category: parsed.category,
                      subcategory: parsed.subcategory || "",
                      summary: parsed.summary || "",
                    });

                    const defaults = {
                      understanding: { company_fundamental: { questionsAsked: 0, summaryPoints: [] }, financial_health: { questionsAsked: 0, summaryPoints: [] }, industry_context: { questionsAsked: 0, summaryPoints: [] } },
                      risks: { company_risks: { questionsAsked: 0, summaryPoints: [] }, external_risks: { questionsAsked: 0, summaryPoints: [] }, investment_risks: { questionsAsked: 0, summaryPoints: [] } },
                      valuation: { current_price: { questionsAsked: 0, summaryPoints: [] }, company_valuation: { questionsAsked: 0, summaryPoints: [] }, expected_returns: { questionsAsked: 0, summaryPoints: [] } },
                    };
                    const { data: existing } = await supabase
                      .from("progress_state")
                      .select("understanding, risks, valuation")
                      .eq("user_id", userId)
                      .eq("ticker", ticker)
                      .single();

                    const cur = (existing as any) || defaults;
                    const cat = parsed.category as keyof typeof defaults;
                    const subcat = parsed.subcategory as string;
                    const section = cur[cat] || defaults[cat];
                    const sub = section[subcat] || { questionsAsked: 0, summaryPoints: [] };
                    sub.questionsAsked = (sub.questionsAsked || 0) + 1;
                    if (parsed.summary && !(sub.summaryPoints || []).includes(parsed.summary)) {
                      sub.summaryPoints = sub.summaryPoints || [];
                      sub.summaryPoints.push(parsed.summary);
                    }
                    const updatedSection = { ...section, [subcat]: sub };
                    const upsertData = {
                      user_id: userId,
                      ticker,
                      understanding: cat === "understanding" ? updatedSection : (cur.understanding || defaults.understanding),
                      risks: cat === "risks" ? updatedSection : (cur.risks || defaults.risks),
                      valuation: cat === "valuation" ? updatedSection : (cur.valuation || defaults.valuation),
                    };
                    await supabase.from("progress_state").upsert(upsertData, {
                      onConflict: "user_id,ticker",
                    });
                  }
                }
              }
            } catch (metaErr) {
              console.error("Metadata/Keyword Store error:", metaErr);
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
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal error",
      500
    );
  }
});

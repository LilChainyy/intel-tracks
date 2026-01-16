import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT_EN = `You are a friendly investment advisor helping beginners understand companies.

RESPONSE RULES (CRITICAL):
- Maximum 4-5 sentences per response
- NO markdown formatting: no **, no ***, no ###, no bullet points
- Write like you're texting a friend - natural, conversational
- Structure your response in 2-3 short paragraphs max
- Keep professional terms but explain them simply inline

YOUR STYLE:
- Warm and encouraging, like chatting with a knowledgeable friend
- Give direct answers first, then brief explanation
- One idea per sentence, simple words

TOPICS YOU COVER:
1. Understanding: What the company does, how it makes money, its industry
2. Risks: What could go wrong, threats to the business
3. Valuation: Is the stock price fair, how it compares to peers

If asked about other topics, gently redirect to these investing basics.`;

const SYSTEM_PROMPT_ZH = `你是一位友好的投资顾问，帮助初学者了解公司。

回答规则（重要）：
- 每次回答最多4-5句话
- 不要使用任何markdown格式：不要**，不要***，不要###，不要项目符号
- 像和朋友聊天一样自然对话
- 回答分2-3个短段落
- 保留专业术语但用简单语言解释

你的风格：
- 温暖鼓励，像和一个懂行的朋友聊天
- 先给直接答案，再简短解释
- 一句话一个观点，用简单的词

你涵盖的主题：
1. 理解：公司做什么，如何赚钱，所在行业
2. 风险：什么可能出错，业务威胁
3. 估值：股价是否合理，与同行比较

如果被问到其他话题，温和地引导回这些投资基础。`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, ticker, companyName, language = 'en' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch real stock data
    const stockData = await fetchStockData(ticker);
    
    const systemPrompt = language === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;
    const contextPrompt = stockData 
      ? `\n\nCurrent data for ${companyName} (${ticker}):\n${formatStockData(stockData)}`
      : `\n\nNo real-time data available for ${companyName}. Provide general educational information.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt + contextPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function fetchStockData(ticker: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=financialData,defaultKeyStatistics,price`;
    
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

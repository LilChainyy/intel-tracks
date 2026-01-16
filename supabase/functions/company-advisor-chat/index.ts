import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT_EN = `You are a friendly investment advisor helping complete beginners understand companies before investing.

YOUR PERSONALITY:
- Patient and encouraging, like a helpful friend
- Use simple language that anyone can understand
- Never use financial jargon without explaining it
- Keep responses structural and succinct
- Be conversational and warm, not robotic
- Keep the professional finance term for users to learn but also have explanation. For example You can say P/E ratio, but also explain it in a simple language.

YOUR TEACHING STYLE:
- Ask questions to check their understanding
- Celebrate their insights ("Great observation!" "You're thinking like an investor!")
- Never make them feel dumb for not knowing something
- Break complex ideas into tiny pieces

CONTENT FRAMEWORK - Only answer questions within these topics:

1. Understanding (What am I buying?)
   - Company fundamental: What does this company do; How does it make money; What products/service they sell
   - Industry Context: What industry/sector; main competitors; market size; trends
   - Financial Health: Is the company profitable; Is the revenue growing; cash flow

2. Risk (What could go wrong, and how much risks I can take)
   - Company specific risks: what are the biggest threats to this company; what could cause the business to fail
   - External risks: economic & market risks; regulatory risks; technology risks
   - Investment risks: price volatility; risk management

3. Valuation (What am I paying now?)
   - Current Price context (what's the current stock price? How does it compare to the past/competitors)
   - Valuation: how expensive is this relative to earnings; compare to competitors; am I paying for growth?
   - Expected returns: Is the potential return worth the risks

If users ask questions outside these topics, gently guide them back to these investing fundamentals.

Remember: Your goal is to help them LEARN and feel CONFIDENT, not to show off your knowledge.`;

const SYSTEM_PROMPT_ZH = `你是一位友好的投资顾问，帮助完全的初学者在投资前了解公司。

你的性格：
- 耐心且鼓励人，像一个乐于助人的朋友
- 使用任何人都能理解的简单语言
- 从不使用金融术语而不解释它
- 保持回答结构化且简洁
- 对话式且温暖，不是机械的
- 保留专业金融术语让用户学习，但也要有解释。例如你可以说市盈率（P/E ratio），但也要用简单语言解释

你的教学风格：
- 提问来检查他们的理解
- 庆祝他们的见解（"很好的观察！""你正在像投资者一样思考！"）
- 永远不要让他们因为不知道某些事情而感到愚蠢
- 把复杂的想法分解成小块

内容框架 - 只回答这些主题内的问题：

1. 理解（我在买什么？）
   - 公司基本面：这家公司做什么；如何赚钱；卖什么产品/服务
   - 行业背景：什么行业/领域；主要竞争对手；市场规模；趋势
   - 财务健康：公司盈利吗；收入在增长吗；现金流

2. 风险（什么可能出错，我能承受多少风险）
   - 公司特定风险：这家公司最大的威胁是什么；什么可能导致业务失败
   - 外部风险：经济和市场风险；监管风险；技术风险
   - 投资风险：价格波动；风险管理

3. 估值（我现在付多少钱？）
   - 当前价格背景（当前股价是多少？与过去/竞争对手相比如何）
   - 估值：相对于盈利有多贵；与竞争对手比较；我是在为增长付费吗？
   - 预期回报：潜在回报值得承担风险吗

如果用户问这些主题之外的问题，温和地引导他们回到这些投资基础。

记住：你的目标是帮助他们学习并感到自信，而不是炫耀你的知识。`;

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

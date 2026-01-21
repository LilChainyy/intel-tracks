import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userQuestion, aiResponse, ticker, companyName, currentProgress, language = 'en' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Analyze the conversation to extract learning progress
    const analysisPrompt = language === 'zh' 
      ? `分析这段对话，判断用户学到了什么关于 ${companyName} (${ticker}) 的内容。

用户问题：${userQuestion}
AI回答：${aiResponse}

分类规则：
- understanding: 公司基本面(company_fundamental)、财务健康(financial_health)、行业背景(industry_context)
- risks: 公司风险(company_risks)、外部风险(external_risks)、投资风险(investment_risks)  
- valuation: 当前价格(current_price)、公司估值(company_valuation)、预期回报(expected_returns)

请返回JSON格式（不要markdown代码块）：
{"category": "understanding或risks或valuation或none", "subcategory": "具体子类别", "summary": "用户学到的一句话总结"}`
      : `Analyze this conversation and determine what the user learned about ${companyName} (${ticker}).

User Question: ${userQuestion}
AI Response: ${aiResponse}

Categories:
- understanding: company_fundamental, financial_health, industry_context
- risks: company_risks, external_risks, investment_risks
- valuation: current_price, company_valuation, expected_returns

Return JSON only (no markdown code blocks):
{"category": "understanding or risks or valuation or none", "subcategory": "specific subcategory", "summary": "one sentence of what they learned"}`;

    // Calculate what topics need more exploration
    const coveredTopics = getCoveredTopics(currentProgress);
    const uncoveredTopics = getUncoveredTopics(currentProgress);

    const questionPrompt = language === 'zh'
      ? `为 ${companyName} 生成3个后续问题。

已覆盖：${coveredTopics.join(', ') || '无'}
未覆盖：${uncoveredTopics.join(', ')}

规则：
- 每个问题必须4-5个字以内
- 只用最重要的关键词
- 优先未覆盖的主题
- 每类别最多一个问题

返回JSON（不要markdown）：
{"questions": [{"text": "4-5字问题", "category": "understanding或risks或valuation"}]}`
      : `Generate 3 follow-up questions for ${companyName}.

Covered: ${coveredTopics.join(', ') || 'none'}
Uncovered: ${uncoveredTopics.join(', ')}

Rules:
- Each question MUST be 4-5 words MAX
- Use only key words, no filler words
- Prioritize uncovered topics
- One question per category max

Return JSON only (no markdown):
{"questions": [{"text": "4-5 word question", "category": "understanding or risks or valuation"}]}`;

    // Make parallel calls for analysis and question generation
    const [analysisResponse, questionsResponse] = await Promise.all([
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: analysisPrompt }],
        }),
      }),
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: questionPrompt }],
        }),
      }),
    ]);

    let progressUpdate = null;
    let suggestedQuestions = [];

    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      const content = analysisData.choices?.[0]?.message?.content;
      if (content) {
        try {
          const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.category && parsed.category !== 'none') {
            progressUpdate = parsed;
          }
        } catch (e) {
          console.error("Error parsing analysis:", e);
        }
      }
    }

    if (questionsResponse.ok) {
      const questionsData = await questionsResponse.json();
      const content = questionsData.choices?.[0]?.message?.content;
      if (content) {
        try {
          const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.questions) {
            suggestedQuestions = parsed.questions;
          }
        } catch (e) {
          console.error("Error parsing questions:", e);
        }
      }
    }

    return new Response(
      JSON.stringify({ progressUpdate, suggestedQuestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getCoveredTopics(progress: any): string[] {
  const covered: string[] = [];
  
  for (const [section, subsections] of Object.entries(progress)) {
    for (const [name, data] of Object.entries(subsections as Record<string, any>)) {
      if (data.questionsAsked > 0) {
        covered.push(`${section}.${name}`);
      }
    }
  }
  
  return covered;
}

function getUncoveredTopics(progress: any): string[] {
  const uncovered: string[] = [];
  
  for (const [section, subsections] of Object.entries(progress)) {
    for (const [name, data] of Object.entries(subsections as Record<string, any>)) {
      if (data.questionsAsked === 0) {
        uncovered.push(`${section}.${name}`);
      }
    }
  }
  
  return uncovered;
}

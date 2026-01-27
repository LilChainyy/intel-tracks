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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userQuestion, aiResponse, ticker, companyName, currentProgress } = await req.json();

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Analyze the conversation to extract learning progress
    const analysisPrompt = `Analyze this conversation and determine what the user learned about ${companyName} (${ticker}).

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

    const questionPrompt = `Generate 3 super short, fun follow-up questions about ${companyName}.

Covered: ${coveredTopics.join(", ") || "none"}
Uncovered: ${uncoveredTopics.join(", ")}

Rules - MUST FOLLOW:
- Each question MAX 3-4 words
- Make them casual and fun (use "?", "💰", keep it light)
- Prioritize uncovered topics
- One question per category max
- Examples: "Worth buying? 💰", "Any red flags?", "How's the CEO?"

Return JSON only (no markdown):
{"questions": [{"text": "3-4 word fun question", "category": "understanding or risks or valuation"}]}`;

    // Make parallel calls for analysis and question generation
    const [analysisResponse, questionsResponse] = await Promise.all([
      fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          messages: [{ role: "user", content: analysisPrompt }],
          max_tokens: 1024,
        }),
      }),
      fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          messages: [{ role: "user", content: questionPrompt }],
          max_tokens: 1024,
        }),
      }),
    ]);

    let progressUpdate = null;
    let suggestedQuestions = [];

    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      // Claude returns content in content array with text blocks
      const textBlock = analysisData.content?.find((block: any) => block.type === 'text');
      const content = textBlock?.text;
      if (content) {
        try {
          const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.category && parsed.category !== "none") {
            progressUpdate = parsed;
          }
        } catch (e) {
          console.error("Error parsing analysis:", e);
        }
      }
    }

    if (questionsResponse.ok) {
      const questionsData = await questionsResponse.json();
      const textBlock = questionsData.content?.find((block: any) => block.type === 'text');
      const content = textBlock?.text;
      if (content) {
        try {
          const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.questions) {
            suggestedQuestions = parsed.questions;
          }
        } catch (e) {
          console.error("Error parsing questions:", e);
        }
      }
    }

    return new Response(JSON.stringify({ progressUpdate, suggestedQuestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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

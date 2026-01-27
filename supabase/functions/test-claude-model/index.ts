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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not found" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // Try different model names
    const modelsToTest = [
      "claude-3-sonnet-20240229",
      "claude-3-5-sonnet-20240620",
      "claude-3-5-sonnet",
      "claude-3-sonnet",
      "claude-3-opus-20240229",
      "claude-3-haiku-20240307"
    ]

    const results: Array<{
      model: string
      status: string
      response?: string
      error?: string
      statusCode?: number
    }> = []

    for (const model of modelsToTest) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 10,
            messages: [{ role: "user", content: "Hi" }]
          }),
        })

        const result = await response.json()
        
        if (response.ok) {
          results.push({ model, status: "✅ WORKS", response: "Success" })
          break // Found a working model, stop testing
        } else {
          results.push({ 
            model, 
            status: "❌ FAILED", 
            error: result.error?.message || result.error?.type || "Unknown error",
            statusCode: response.status
          })
        }
      } catch (error) {
        results.push({ 
          model, 
          status: "❌ ERROR", 
          error: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }

    return new Response(JSON.stringify({
      results,
      recommendation: results.find(r => r.status === "✅ WORKS")?.model || "No working model found"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})

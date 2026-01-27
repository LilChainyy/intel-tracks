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
    const anthropic = Deno.env.get("ANTHROPIC_API_KEY")
    const finnhub = Deno.env.get("FINNHUB_API_KEY")
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
    
    return new Response(JSON.stringify({
      success: true,
      secrets: {
        hasAnthropic: !!anthropic,
        hasFinnhub: !!finnhub,
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseAnonKey: !!supabaseAnonKey,
        anthropicPrefix: anthropic ? anthropic.substring(0, 10) + "..." : "missing",
        finnhubPrefix: finnhub ? finnhub.substring(0, 10) + "..." : "missing",
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})

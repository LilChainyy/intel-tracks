// @ts-ignore - Deno types are available at runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno types are available at runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
    // Optional authentication (for testing in Supabase dashboard)
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
        
        if (!supabaseUrl || !supabaseAnonKey) {
          console.warn('Supabase URL or anon key not configured');
        } else {
          const supabase = createClient(
            supabaseUrl,
            supabaseAnonKey,
            { global: { headers: { Authorization: authHeader } } }
          );

          const token = authHeader.replace('Bearer ', '');
          const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
          
          if (!claimsError && claimsData?.claims) {
            userId = claimsData.claims.sub;
            console.log(`Authenticated user: ${userId}`);
          } else {
            console.warn('Auth error (continuing without auth):', claimsError);
          }
        }
      } catch (authErr) {
        console.warn('Auth check failed (continuing without auth):', authErr);
      }
    } else {
      console.log('No auth header provided (testing mode)');
    }

    // Parse request body with error handling
    let requestBody: any = {}
    try {
      requestBody = await req.json()
    } catch (parseError) {
      // If no body or invalid JSON, use default
      requestBody = {
        messages: [
          {
            role: 'user',
            content: 'Hello, can you explain what a stock is?'
          }
        ]
      }
    }

    // Extract optional overrides (backward compatible — omitting these preserves current behavior)
    const customSystemPrompt = requestBody?.systemPrompt || null;
    const customMaxTokens = requestBody?.maxTokens || null;

    // Extract messages with fallback
    const messages = requestBody?.messages || []
    
    if (!Array.isArray(messages) || messages.length === 0) {
      // Use default if no valid messages
      requestBody.messages = [
        {
          role: 'user',
          content: 'Hello, can you explain what a stock is?'
        }
      ]
    }
    
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")
    
    if (!ANTHROPIC_API_KEY) {
      return createErrorResponse("ANTHROPIC_API_KEY is not configured", 500);
    }

    const systemPrompt = `You explain stocks to 15-year-olds. Keep it SHORT and SIMPLE.

CRITICAL RULES:
1. MAXIMUM 2-3 sentences TOTAL per response (cut to 1/3 of normal length)
2. One paragraph only - no multiple paragraphs
3. Get straight to the point - no fluff
4. Write like texting a friend (use "you", contractions, simple words)
5. Replace ALL jargon:
   - "fundamentals" → "how the business is doing"
   - "volatility" → "price swings"
   - "bearish" → "prices dropping"
   - "capital" → "money"
   - "equity" → "stock"
   - "margins" → "profit per sale"
   - "headwinds" → "problems"

EXAMPLES:
BAD (too long): "A stock is basically a piece of a company that you can buy. When you own stock, you own a small part of that company. If the company does well, your stock price goes up and you make money."
GOOD (crisp): "A stock is a piece of a company. Buy it, and if the company does well, you make money."

BAD: "The company is struggling because the overall economy is having issues right now, which means people aren't spending as much money."
GOOD: "The company's struggling because the economy sucks and people aren't spending."

Tone: Like a smart friend giving quick advice. Be direct, casual, and super brief.`;

    // Convert messages to Claude format (Claude uses 'user' and 'assistant' roles, system is separate)
    const claudeMessages = requestBody.messages
      .filter((msg: any) => msg && msg.role !== 'system' && msg.content)
      .map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: typeof msg.content === 'string' ? msg.content : String(msg.content || ''),
      }));
    
    if (claudeMessages.length === 0) {
      return createErrorResponse('No valid messages found. Each message must have "role" and "content" fields.', 400);
    }
    
    console.log(`Processing ${claudeMessages.length} messages`);

    console.log('Calling Claude API with:', {
      model: "claude-3-haiku-20240307",
      messageCount: claudeMessages.length,
      hasApiKey: !!ANTHROPIC_API_KEY,
      apiKeyPrefix: ANTHROPIC_API_KEY ? ANTHROPIC_API_KEY.substring(0, 10) + '...' : 'missing'
    });

    let response: Response;
    try {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          system: customSystemPrompt ?? systemPrompt,
          messages: claudeMessages,
          max_tokens: customMaxTokens ?? 150,
          stream: true,
        }),
      });
    } catch (fetchError) {
      console.error("Failed to call Claude API:", fetchError);
      return createErrorResponse(`Failed to connect to Claude API: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`, 500);
    }

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorText = await response.text();
        errorDetails = errorText;
        console.error("Claude API error:", response.status, errorText);
      } catch (e) {
        console.error("Claude API error (could not read body):", response.status);
      }
      
      if (response.status === 401) {
        return createErrorResponse("Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY secret.", 500);
      }
      if (response.status === 429) {
        return createErrorResponse("Rate limits exceeded, please try again later.", 429);
      }
      if (response.status === 400) {
        return createErrorResponse(`Claude API request error: ${errorDetails || 'Invalid request format'}`, 400);
      }
      
      return createErrorResponse(`Claude API error (${response.status}): ${errorDetails || 'Unknown error'}`, 500);
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
                    // Convert to OpenAI SSE format
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
                    // Send final chunk
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
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error && error.stack ? `\n\nStack: ${error.stack.substring(0, 500)}` : '';
    return createErrorResponse(`Internal server error: ${errorMessage}${errorDetails}`, 500);
  }
});
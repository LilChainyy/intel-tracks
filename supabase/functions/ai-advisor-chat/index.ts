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

const HF_EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const PINECONE_TOP_K = 5;

const FALLBACK_SYSTEM_PROMPT = `You are the Adamsmyth AI Advisor. Explain stocks and investing in simple terms.
Keep answers 2-3 sentences. Write like a smart friend. No financial advice when appropriate.`;

// Helper function to create error responses
function createErrorResponse(error: string, status: number): Response {
  return new Response(
    JSON.stringify({ error }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/** Embed text using Hugging Face Inference API (sentence-transformer) */
async function embedWithHF(text: string): Promise<number[]> {
  const apiKey = Deno.env.get("HUGGINGFACE_API_KEY");
  if (!apiKey) throw new Error("HUGGINGFACE_API_KEY not configured");

  const res = await fetch(
    `https://api-inference.huggingface.co/models/${HF_EMBED_MODEL}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HF embedding failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  if (Array.isArray(data)) return data as number[];
  if (Array.isArray(data?.[0])) return data[0] as number[];
  throw new Error("Unexpected HF embedding response format");
}

/** Query Pinecone for similar chunks, return text content from metadata */
async function queryPinecone(vector: number[], topK: number): Promise<string[]> {
  const apiKey = Deno.env.get("PINECONE_API_KEY");
  const indexHost = Deno.env.get("PINECONE_INDEX_HOST");

  if (!apiKey || !indexHost) {
    throw new Error("PINECONE_API_KEY or PINECONE_INDEX_HOST not configured");
  }

  const url = `https://${indexHost}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vector,
      topK,
      includeMetadata: true,
      includeValues: false,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone query failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const matches = data?.matches || [];
  return matches
    .filter((m: any) => m?.metadata?.text)
    .map((m: any) => m.metadata.text as string);
}

/** Build augmented system prompt with RAG context */
function buildRagPrompt(contextChunks: string[]): string {
  const context = contextChunks
    .map((c) => `---\n${c}\n---`)
    .join("\n\n");
  return `You are the Adamsmyth AI Advisor. Use ONLY the following context to answer. If the context doesn't cover the question, say so briefly.

CONTEXT:
${context}

Keep answers 2-3 sentences. No financial advice disclaimer when appropriate.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

        if (supabaseUrl && supabaseAnonKey) {
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
          }
        }
      } catch (authErr) {
        console.warn('Auth check failed (continuing without auth):', authErr);
      }
    }

    let requestBody: any = {}
    try {
      requestBody = await req.json()
    } catch {
      requestBody = {
        messages: [{ role: 'user', content: 'Hello, can you explain what a stock is?' }],
      };
    }

    const customSystemPrompt = requestBody?.systemPrompt || null;
    const customMaxTokens = requestBody?.maxTokens ?? 600;

    const messages = requestBody?.messages || []
    if (!Array.isArray(messages) || messages.length === 0) {
      requestBody.messages = [{ role: 'user', content: 'Hello, can you explain what a stock is?' }];
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      return createErrorResponse("GROQ_API_KEY is not configured", 500);
    }

    const chatMessages = requestBody.messages
      .filter((msg: any) => msg && msg.role !== 'system' && msg.content)
      .map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: typeof msg.content === 'string' ? msg.content : String(msg.content || ''),
      }));

    if (chatMessages.length === 0) {
      return createErrorResponse('No valid messages found.', 400);
    }

    const lastUserMessage = chatMessages.filter((m: any) => m.role === 'user').pop();
    const queryText = lastUserMessage?.content || '';

    let systemPrompt = customSystemPrompt ?? FALLBACK_SYSTEM_PROMPT;

    try {
      const queryVector = await embedWithHF(queryText);
      const chunks = await queryPinecone(queryVector, PINECONE_TOP_K);
      if (chunks.length > 0) {
        systemPrompt = buildRagPrompt(chunks);
        console.log(`RAG: retrieved ${chunks.length} chunks`);
      }
    } catch (ragError) {
      console.warn('RAG fallback (no context):', ragError);
      systemPrompt = customSystemPrompt ?? FALLBACK_SYSTEM_PROMPT;
    }

    console.log('Calling Groq API, messageCount:', chatMessages.length);

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
        max_tokens: customMaxTokens,
        stream: true,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq API error:", groqResponse.status, errText);
      if (groqResponse.status === 401) {
        return createErrorResponse("Invalid Groq API key.", 500);
      }
      if (groqResponse.status === 429) {
        return createErrorResponse("Rate limits exceeded, please try again later.", 429);
      }
      return createErrorResponse(`Groq API error: ${errText || groqResponse.status}`, 500);
    }

    const reader = groqResponse.body?.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }

        try {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const chunk = parsed.choices?.[0]?.delta?.content;
                  if (chunk) {
                    const openAIFormat = {
                      id: 'chatcmpl',
                      object: 'chat.completion.chunk',
                      created: Math.floor(Date.now() / 1000),
                      model: 'llama-3.1-8b',
                      choices: [{ index: 0, delta: { content: chunk }, finish_reason: null }],
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIFormat)}\n\n`));
                  }
                  if (parsed.choices?.[0]?.finish_reason === 'stop') {
                    const finalChunk = {
                      id: 'chatcmpl',
                      object: 'chat.completion.chunk',
                      created: Math.floor(Date.now() / 1000),
                      model: 'llama-3.1-8b',
                      choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }

          if (buffer && buffer.startsWith('data: ')) {
            const data = buffer.slice(6).trim();
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                const chunk = parsed.choices?.[0]?.delta?.content;
                if (chunk) {
                  const openAIFormat = {
                    id: 'chatcmpl',
                    object: 'chat.completion.chunk',
                    created: Math.floor(Date.now() / 1000),
                    model: 'llama-3.1-8b',
                    choices: [{ index: 0, delta: { content: chunk }, finish_reason: null }],
                  };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIFormat)}\n\n`));
                }
              } catch {
                // ignore
              }
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse(`Internal server error: ${errorMessage}`, 500);
  }
});

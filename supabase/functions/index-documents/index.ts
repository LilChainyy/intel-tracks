// Index external documents into Pinecone for RAG.
// POST body: { documents: [{ id, title, content }] }
// Chunks content with overlapping windows (~512 chars, 64 overlap), then embeds and upserts.

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

declare const Deno: { env: { get(key: string): string | undefined } }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HF_EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const NAMESPACE = "ai-advisor";
const CHUNK_SIZE = 512;
const CHUNK_OVERLAP = 64;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end).trim());
    start = end - CHUNK_OVERLAP;
    if (start >= text.length) break;
  }
  return chunks.filter((c) => c.length > 0);
}

async function embedWithHF(text: string): Promise<number[]> {
  const apiKey = Deno.env.get("HUGGINGFACE_API_KEY");
  if (!apiKey) throw new Error("HUGGINGFACE_API_KEY not configured");

  const res = await fetch(
    `https://api-inference.huggingface.co/models/${HF_EMBED_MODEL}`,
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: text }),
    }
  );
  if (!res.ok) throw new Error(`HF embed failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  if (Array.isArray(data)) return data as number[];
  if (Array.isArray(data?.[0])) return data[0] as number[];
  throw new Error("Unexpected HF response");
}

async function upsertToPinecone(vectors: { id: string; values: number[]; metadata: Record<string, string> }[]) {
  const apiKey = Deno.env.get("PINECONE_API_KEY");
  const indexHost = Deno.env.get("PINECONE_INDEX_HOST");
  if (!apiKey || !indexHost) throw new Error("Pinecone not configured");

  const res = await fetch(`https://${indexHost}/vectors/upsert`, {
    method: "POST",
    headers: { "Api-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      vectors: vectors.map((v) => ({ id: v.id, values: v.values, metadata: v.metadata })),
      namespace: NAMESPACE,
    }),
  });
  if (!res.ok) throw new Error(`Pinecone upsert failed: ${res.status} ${await res.text()}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const documents = body.documents || [];
    if (!Array.isArray(documents) || documents.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing documents array in body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allChunks: { id: string; text: string; source: string }[] = [];
    for (const doc of documents) {
      const id = doc.id || `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const title = doc.title || "Untitled";
      const content = doc.content || doc.text || "";
      const chunks = chunkText(content);
      chunks.forEach((text, i) => {
        allChunks.push({
          id: `${id}-chunk-${i}`,
          text: `${title}\n\n${text}`,
          source: `doc:${id}`,
        });
      });
    }

    const BATCH = 5;
    const vectors: { id: string; values: number[]; metadata: Record<string, string> }[] = [];

    for (let i = 0; i < allChunks.length; i++) {
      const c = allChunks[i];
      const values = await embedWithHF(c.text);
      vectors.push({ id: c.id, values, metadata: { text: c.text, source: c.source } });
      if (vectors.length >= BATCH) {
        await upsertToPinecone(vectors.splice(0, vectors.length));
      }
    }
    if (vectors.length > 0) await upsertToPinecone(vectors);

    return new Response(
      JSON.stringify({ indexed: allChunks.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Index error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

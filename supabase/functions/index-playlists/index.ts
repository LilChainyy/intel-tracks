// Index playlists into Pinecone for RAG.
// Invoke with: POST body { playlists: [{ id, title, signal, thesis, fullAnalysis?, stocks: [...] }] }
// Or call from scripts/index-playlists.ts which reads from src/data/playlists

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

declare const Deno: { env: { get(key: string): string | undefined } }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HF_EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const NAMESPACE = "ai-advisor";

interface PlaylistChunk {
  id: string;
  text: string;
  source: string;
}

function chunkPlaylists(playlists: any[]): PlaylistChunk[] {
  const chunks: PlaylistChunk[] = [];
  for (const p of playlists) {
    const source = `playlist:${p.id}`;
    if (p.title && p.signal) {
      chunks.push({ id: `${p.id}-signal`, text: `${p.title} | ${p.signal}`, source });
    }
    if (p.thesis) {
      chunks.push({ id: `${p.id}-thesis`, text: p.thesis, source });
    }
    if (p.fullAnalysis) {
      chunks.push({ id: `${p.id}-analysis`, text: p.fullAnalysis, source });
    }
    if (p.stocks?.length) {
      for (const s of p.stocks) {
        if (s.ticker && s.name && s.description) {
          chunks.push({
            id: `${p.id}-stock-${s.ticker}`,
            text: `${s.ticker} ${s.name}: ${s.description}`,
            source,
          });
        }
      }
    }
  }
  return chunks;
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
      vectors: vectors.map((v) => ({
        id: v.id,
        values: v.values,
        metadata: v.metadata,
      })),
      namespace: NAMESPACE,
    }),
  });
  if (!res.ok) throw new Error(`Pinecone upsert failed: ${res.status} ${await res.text()}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const playlists = body.playlists || [];
    if (!Array.isArray(playlists) || playlists.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing playlists array in body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const chunks = chunkPlaylists(playlists);
    const vectors: { id: string; values: number[]; metadata: Record<string, string> }[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const values = await embedWithHF(c.text);
      vectors.push({
        id: c.id,
        values,
        metadata: { text: c.text, source: c.source },
      });
      if (i % 5 === 4) {
        await upsertToPinecone(vectors.splice(0, vectors.length));
      }
    }
    if (vectors.length > 0) await upsertToPinecone(vectors);

    return new Response(
      JSON.stringify({ indexed: chunks.length }),
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

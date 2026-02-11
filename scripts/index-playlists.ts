/**
 * Index playlists into Pinecone for RAG.
 * Run: npx tsx scripts/index-playlists.ts
 * Requires: HUGGINGFACE_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_HOST in .env
 *
 * Or invoke the Edge Function:
 * curl -X POST https://<project>.supabase.co/functions/v1/index-playlists \
 *   -H "Authorization: Bearer <anon-key>" -H "Content-Type: application/json" \
 *   -d '{"playlists": [...]}'
 */

import { playlists } from "../src/data/playlists";

const HF_EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const NAMESPACE = "ai-advisor";

async function embedWithHF(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch(
    `https://api-inference.huggingface.co/models/${HF_EMBED_MODEL}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: text }),
    }
  );
  if (!res.ok) throw new Error(`HF embed failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as number[] | number[][];
  if (Array.isArray(data) && typeof data[0] === "number") return data as number[];
  if (Array.isArray(data) && Array.isArray(data[0])) return data[0] as number[];
  throw new Error("Unexpected HF response");
}

async function upsertToPinecone(
  vectors: { id: string; values: number[]; metadata: Record<string, string> }[],
  apiKey: string,
  indexHost: string
) {
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

function chunkPlaylists(pl: typeof playlists): { id: string; text: string; source: string }[] {
  const chunks: { id: string; text: string; source: string }[] = [];
  for (const p of pl) {
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

async function main() {
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  const pineconeKey = process.env.PINECONE_API_KEY;
  const pineconeHost = process.env.PINECONE_INDEX_HOST;

  if (!hfKey || !pineconeKey || !pineconeHost) {
    console.error(
      "Missing env: HUGGINGFACE_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_HOST. Add to .env and run with dotenv."
    );
    process.exit(1);
  }

  const chunks = chunkPlaylists(playlists);
  console.log(`Indexing ${chunks.length} chunks from ${playlists.length} playlists...`);

  const BATCH = 5;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const vectors = await Promise.all(
      batch.map(async (c) => ({
        id: c.id,
        values: await embedWithHF(c.text, hfKey),
        metadata: { text: c.text, source: c.source },
      }))
    );
    await upsertToPinecone(vectors, pineconeKey, pineconeHost);
    console.log(`Upserted ${Math.min(i + BATCH, chunks.length)}/${chunks.length}`);
  }

  console.log(`Done. Indexed ${chunks.length} chunks.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

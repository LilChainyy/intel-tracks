# RAG AI Advisor Setup

The AI Advisor uses a RAG (Retrieval-Augmented Generation) pipeline:
- **R**: Hugging Face (sentence-transformers) for embeddings, Pinecone for vector search
- **A**: Augmented prompt with retrieved chunks
- **G**: Groq (Llama) for generation

## 1. Create Pinecone Index

1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Create an index:
   - Name: `ai-advisor-index`
   - Dimension: `384` (all-MiniLM-L6-v2)
   - Metric: cosine

3. Note your index host (e.g. `xxx.svc.us-east1.pinecone.io`)

## 2. Supabase Secrets

Add these secrets in Supabase Dashboard → Project Settings → Edge Functions:

| Secret | Description |
|--------|-------------|
| `HUGGINGFACE_API_KEY` | From [Hugging Face](https://huggingface.co/settings/tokens) |
| `PINECONE_API_KEY` | From [Pinecone Console](https://app.pinecone.io/) |
| `PINECONE_INDEX_HOST` | Your index host (no `https://`) |
| `GROQ_API_KEY` | From [Groq Console](https://console.groq.com/) |

## 3. Index Playlists

Run locally (requires keys in `.env`):

```bash
npm run index-playlists
```

Or invoke the Edge Function after deploying:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/index-playlists \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"playlists": [...]}'
```

## 4. Index External Documents (Optional)

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/index-documents \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"documents": [{"id": "glossary", "title": "Investing Glossary", "content": "..."}]}'
```

## 5. Deploy Functions

```bash
supabase functions deploy ai-advisor-chat
supabase functions deploy index-playlists
supabase functions deploy index-documents
```

## Fallback

If Pinecone or Hugging Face fails, the advisor falls back to Groq with a generic system prompt (no RAG context).

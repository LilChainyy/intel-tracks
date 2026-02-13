#!/bin/bash
# Create Pinecone index for RAG AI Advisor (384 dims, cosine, no integrated embedding)
# Requires: PINECONE_API_KEY in env or .env
set -e

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$PINECONE_API_KEY" ]; then
  echo "Error: PINECONE_API_KEY not set. Add to .env or run: export PINECONE_API_KEY=your-key"
  exit 1
fi

echo "Creating Pinecone index ai-advisor-index (384 dims, cosine)..."

curl -X POST "https://api.pinecone.io/indexes" \
  -H "Api-Key: $PINECONE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ai-advisor-index",
    "dimension": 384,
    "metric": "cosine",
    "spec": {
      "serverless": {
        "cloud": "aws",
        "region": "us-east-1"
      }
    }
  }'

echo ""
echo "Done. Check status at https://app.pinecone.io/"

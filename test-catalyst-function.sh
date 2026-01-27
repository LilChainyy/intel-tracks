#!/bin/bash

# Test the fetch-catalysts Edge Function
# Replace YOUR_ANON_KEY with your actual anon key from Supabase dashboard

PROJECT_URL="https://joafocyskbvvfltwfefu.supabase.co"
ANON_KEY="YOUR_ANON_KEY"  # Get this from: Settings → API → anon public key

echo "Testing fetch-catalysts function..."
echo ""

curl -X POST "${PROJECT_URL}/functions/v1/fetch-catalysts" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo "✅ If you see catalysts data above, the function is working!"
echo "❌ If you see an error, check:"
echo "   1. FINNHUB_API_KEY is set in Supabase Secrets"
echo "   2. Function is deployed"
echo "   3. ANON_KEY is correct"

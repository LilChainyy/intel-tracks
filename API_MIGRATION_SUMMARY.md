# API Migration Summary

## Changes Made

### 1. ✅ Alpha Vantage → Finnhub (Stock Quotes)

**File:** `supabase/functions/fetch-stock-data/index.ts`

**Changes:**
- Replaced Alpha Vantage GLOBAL_QUOTE endpoint with Finnhub Quote API
- Updated API key from `ALPHA_VANTAGE_API_KEY` to `FINNHUB_API_KEY`
- Improved rate limiting: 1 second delay (60 calls/min) instead of 12 seconds (5 calls/min)
- Finnhub response format: `{ c: price, d: change, dp: changePercent }`

**Benefits:**
- ✅ Better rate limits (60/min vs 5/min)
- ✅ Already have Finnhub API key (using for catalysts)
- ✅ Same data quality
- ✅ One less API to manage

---

### 2. ✅ Lovable API → Claude API (All AI Chat Features)

**Files Updated:**
- `supabase/functions/ai-advisor-chat/index.ts`
- `supabase/functions/company-advisor-chat/index.ts`
- `supabase/functions/stock-analysis/index.ts`
- `supabase/functions/analyze-learning/index.ts`

**Changes:**
- Replaced Lovable API gateway with Anthropic Claude API
- Updated API key from `LOVABLE_API_KEY` to `ANTHROPIC_API_KEY`
- Updated endpoint: `https://api.anthropic.com/v1/messages`
- Updated headers: `x-api-key` and `anthropic-version: 2023-06-01`
- Converted message format (Claude uses `system` field, not system role in messages)
- Added SSE stream conversion for streaming responses (Claude → OpenAI format for frontend compatibility)
- Updated tool calling format for `stock-analysis` (Claude uses `input_schema` instead of `parameters`)

**Model Used:**
- `claude-3-5-sonnet-20241022` (replaces `google/gemini-3-flash-preview` and `google/gemini-2.5-flash`)

**Benefits:**
- ✅ Direct API access (no gateway dependency)
- ✅ Better control over API usage
- ✅ More reliable (no third-party gateway)
- ✅ Same functionality maintained

---

## Required Secrets

### ✅ Keep These:
- `FINNHUB_API_KEY` - Used for stock quotes and catalysts

### ⚠️ Add This:
- `ANTHROPIC_API_KEY` - **NEW** - Required for all AI chat features

### ❌ Remove These (No Longer Needed):
- `ALPHA_VANTAGE_API_KEY` - Replaced by Finnhub
- `LOVABLE_API_KEY` - Replaced by Anthropic

---

## How to Get Anthropic API Key

1. Go to: https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key
6. Add it to Supabase: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/settings/functions
   - Secret name: `ANTHROPIC_API_KEY`
   - Secret value: (paste your key)

---

## Testing Checklist

After deploying updated functions:

- [ ] Stock quotes load correctly (uses Finnhub)
- [ ] AI advisor chat works (uses Claude)
- [ ] Company advisor chat works (uses Claude)
- [ ] Stock analysis works (uses Claude with tools)
- [ ] Learning analysis works (uses Claude)
- [ ] No errors in function logs

---

## Notes

- All functions maintain the same frontend interface (no frontend changes needed)
- Streaming responses are converted from Claude format to OpenAI format for compatibility
- Tool calling in `stock-analysis` uses Claude's native format
- Rate limits are improved for stock data fetching (60/min vs 5/min)

---

## Migration Status

✅ All code changes complete
⚠️ Need to add `ANTHROPIC_API_KEY` secret to Supabase
⚠️ Need to deploy updated functions to Supabase

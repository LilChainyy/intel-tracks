# API Usage Analysis & Recommendations

## Current API Usage

### 1. Alpha Vantage API
**Used in:** `fetch-stock-data` Edge Function

**What it does:**
- Gets **current stock quotes** (price, change percent)
- Returns: `currentPrice`, `ytdChange`, `isPositive`
- Rate limit: **5 calls/minute** (very restrictive!)

**Example:**
```typescript
// Gets: AAPL current price = $150.00, change = +2.5%
GET https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=KEY
```

---

### 2. Lovable API
**Used in:** 4 Edge Functions

**What it does:**
- Powers **AI chat features** (explains stocks to teenagers)
- Uses Google Gemini model (`gemini-3-flash-preview`, `gemini-2.5-flash`)
- Provides casual, simple explanations (not formal financial advice)

**Used in:**
1. `ai-advisor-chat` - General AI advisor chat
2. `company-advisor-chat` - Company-specific advisor
3. `analyze-learning` - Analyzes user learning progress
4. `stock-analysis` - Stock analysis with AI

**Example:**
```typescript
// Sends messages to AI, gets streaming responses
POST https://ai.gateway.lovable.dev/v1/chat/completions
// Returns: Casual explanations like "The company is doing well because..."
```

---

### 3. Finnhub API
**Used in:** `fetch-catalysts` Edge Function

**What it does:**
- Gets **market news/catalysts** (what we just set up)
- Can also get: stock quotes, company profiles, financials, etc.

---

## Can Finnhub Replace Alpha Vantage? ✅ YES!

### Finnhub Stock Quote API

**Finnhub has:**
- **Quote endpoint**: `/quote?symbol=AAPL` - Real-time price
- **Company profile**: Company info, financials
- **Stock candles**: Historical price data (for charts)

**Comparison:**

| Feature | Alpha Vantage | Finnhub |
|---------|--------------|---------|
| **Current Price** | ✅ | ✅ |
| **Price Change** | ✅ | ✅ |
| **Rate Limit (Free)** | 5 calls/min ⚠️ | 60 calls/min ✅ |
| **Cost** | Free (limited) | Free (better limits) |
| **News/Catalysts** | ❌ | ✅ (already using!) |

**Finnhub Quote API:**
```typescript
GET https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_KEY
// Returns: { c: 150.00, d: 2.5, dp: 1.67, ... }
// c = current price, d = change, dp = change percent
```

---

## Recommendation: Replace Alpha Vantage with Finnhub ✅

### Why:
1. **Better rate limits**: 60 calls/min vs 5 calls/min
2. **You already have Finnhub**: One API key for everything
3. **Same data**: Both provide current price & change
4. **Cost**: Free tier is better

### What to Update:
- `fetch-stock-data` function: Switch from Alpha Vantage to Finnhub Quote API
- Remove `ALPHA_VANTAGE_API_KEY` secret (not needed)
- Keep `FINNHUB_API_KEY` (already have it!)

---

## Lovable API - Keep It ✅

**Why keep it:**
- Powers all AI chat features
- Provides the casual, teenager-friendly explanations
- Not replaceable with Finnhub (different purpose)

**What it does:**
- Takes user questions about stocks
- Returns simple, casual explanations
- Example: "The company is struggling because the economy sucks right now" (not formal)

---

## Summary

| API | Replace? | Why |
|-----|----------|-----|
| **Alpha Vantage** | ✅ **YES** | Replace with Finnhub (better limits, already have it) |
| **Lovable API** | ❌ **NO** | Powers AI chat - keep it |
| **Finnhub** | ✅ **KEEP** | Using for catalysts, can also use for stock quotes |

---

## Next Steps

1. **Update `fetch-stock-data`** to use Finnhub instead of Alpha Vantage
2. **Remove** `ALPHA_VANTAGE_API_KEY` secret (not needed)
3. **Keep** `LOVABLE_API_KEY` (needed for AI chat)
4. **Keep** `FINNHUB_API_KEY` (using for catalysts + stock quotes)

Would you like me to update the `fetch-stock-data` function to use Finnhub instead?

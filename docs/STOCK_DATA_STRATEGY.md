# Stock Data Strategy

## Overview

No RAG. No hallucinations. Yahoo Finance + curated knowledge only.

---

## Data Sources

### Primary: Yahoo Finance API (Free)
- **Endpoint**: `query1.finance.yahoo.com/v10/finance/quoteSummary`
- **No API key needed**
- **Rate limit**: ~2000 requests/hour per IP
- **Data freshness**: 15-minute delay (free tier)
- **Covers**: Price, market cap, sector, basic company info

### Secondary: Yahoo Finance News
- **Endpoint**: `query2.finance.yahoo.com/v1/finance/search`
- **Returns**: Last 5 news items per ticker
- **Filter**: Past 30 days only
- **Sources**: Reuters, Bloomberg, Yahoo Finance

### Curated Knowledge: `src/data/stockKnowledge.ts`
- **Manually maintained** (quarterly review)
- **Purpose**: Prevent LLM hallucinations
- **Contains**:
  - `description`: 2-3 sentence explainer
  - `keyProducts`: Max 5 items
  - `whyItMatters`: Investment thesis (1-2 sentences)
  - `themes`: Maps to playlist IDs

---

## Data Freshness

### Market Hours (9:30 AM - 4:00 PM ET)
- **Cache TTL**: 5 minutes
- **Why**: Prices change constantly, but don't hammer Yahoo

### After Hours / Weekends
- **Cache TTL**: 1 hour
- **Why**: Prices don't move, save API calls

### News
- **Fetch once per session**
- **Display timestamp**: "Updated 3 hours ago"
- **Filter**: Only show news from last 30 days

---

## Error Handling

### 1. Invalid Ticker (User types "APPEL")
**Response:**
```json
{
  "ok": false,
  "error": {
    "type": "not_found",
    "message": "Couldn't find APPEL",
    "suggestion": "Did you mean AAPL?"
  }
}
```

**UI Action:**
- Show error message
- Display suggestion as clickable link
- Log to analytics

**Implementation**: `src/data/stockKnowledge.ts` → `findTickerSuggestion()`

---

### 2. Rate Limit Hit
**Response:**
```json
{
  "ok": false,
  "error": {
    "type": "rate_limit",
    "message": "Market data is busy. Try again in 30s"
  }
}
```

**UI Action:**
- Show friendly error
- Retry with exponential backoff (5s, 15s, 30s)
- Use cached data if available

---

### 3. Yahoo Finance Down
**Response:**
```json
{
  "ok": false,
  "error": {
    "type": "service_down",
    "message": "Market data unavailable right now"
  }
}
```

**UI Action:**
- Show cached data with timestamp
- Disable real-time features
- Retry every 60 seconds in background

---

### 4. Private Company (e.g., Stripe, SpaceX)
**Response:**
```json
{
  "ok": false,
  "error": {
    "type": "not_found",
    "message": "This company isn't publicly traded yet"
  }
}
```

**UI Action:**
- Show educational message
- Suggest related public companies
- Explain what "IPO" means

---

## Theme Grouping Logic

### Manual Curation (No Algorithms)
All theme assignments are hardcoded in `src/data/stockKnowledge.ts`.

**Why manual?**
- LLMs hallucinate sector classifications
- Yahoo Finance sectors are too broad
- We control the narrative

**Example:**
```typescript
CCJ: {
  themes: ["nuclear"], // Maps to playlist ID
  ...
}
```

### Review Process
1. **Quarterly**: Review all stock classifications
2. **Major events**: Update immediately (e.g., company pivots)
3. **New themes**: Add new playlist → tag relevant stocks

---

## Regulatory Compliance

### What We Do ✅
- Educational content only
- Display disclaimers: "This is not financial advice"
- No "buy/sell" recommendations
- Cite data sources (Yahoo Finance, news outlets)
- Show analyst consensus (not our opinion)

### What We DON'T Do ❌
- Promise returns ("This will go up 50%!")
- Give personalized advice ("You should buy X")
- Hide conflicts of interest
- Show backtested performance without disclaimers

### Legal Language
**Display on every stock page:**
> "Information provided for educational purposes only. Not financial advice. Do your own research before investing."

**In advisor chat:**
> "I'm here to help you learn, not tell you what to buy. Always do your own research."

---

## Prompt Engineering Strategy

### Base Principles
1. **Concise**: 2-3 sentences max
2. **Simple language**: Replace jargon
3. **Grounded**: Only use provided context
4. **Follow-up**: End with ONE question to continue conversation
5. **Educational**: Teach, don't advise

### Example Prompts

**User asks: "Should I buy NFLX?"**

**Bad Response:**
> "Yes! Netflix is a great buy right now because..."

**Good Response:**
> "Netflix survived the streaming wars and is now profitable with 260M+ subscribers. The stock's up 45% this year, so it's not exactly cheap. Want to know about their competition or what analysts are saying?"

---

### Structured Response Template

When user asks about a specific stock:

```
[2-3 sentence answer to their question]

[1 relevant data point from context]

[ONE follow-up question]
```

**Example:**
> "Netflix makes money from subscriptions and ads. They have 260M+ subscribers globally and just added live sports like WWE and NFL. Current price is $675 with a $290B market cap. Want to know how they compare to Disney+?"

---

## Testing Checklist

Before deploying any stock data changes:

- [ ] Test invalid ticker (APPEL)
- [ ] Test rate limit (spam 100 requests)
- [ ] Test Yahoo Finance downtime (kill VPN)
- [ ] Test private company (SPACEX)
- [ ] Test market hours vs after hours caching
- [ ] Test news filtering (only last 30 days)
- [ ] Test theme mapping for all curated stocks
- [ ] Verify disclaimers show on all pages
- [ ] Check mobile UI for long company names
- [ ] Validate price formatting ($1.23, not 1.23456789)

---

## Future Improvements (NOT Now)

### Phase 2 (Q2 2024)
- Add earnings dates + beat/miss indicators
- Show analyst ratings (Buy/Hold/Sell consensus)
- Display 52-week high/low range

### Phase 3 (Q3 2024)
- Add company fundamentals (P/E, debt, revenue growth)
- Show insider trading activity
- Display institutional ownership

### Phase 4 (Q4 2024)
- Real-time prices (paid Yahoo Finance API)
- Earnings call transcripts
- Competitor comparison tool

---

## File Reference

| File | Purpose |
|------|---------|
| `src/types/stockData.ts` | TypeScript interfaces |
| `src/data/stockKnowledge.ts` | Curated stock descriptions |
| `supabase/functions/fetch-enhanced-stock/` | Yahoo Finance fetcher |
| `supabase/functions/advisor-chat-v2/` | AI advisor with structured prompts |
| `docs/STOCK_DATA_STRATEGY.md` | This document |

---

## Contact & Questions

**When adding new stocks:**
1. Add to `src/data/stockKnowledge.ts`
2. Add to relevant playlist in `src/data/playlists.ts`
3. Test with advisor chat
4. Update this doc if classification logic changes

**When Yahoo Finance breaks:**
1. Check status: `https://finance.yahoo.com/`
2. Switch to cached data
3. Show user-friendly error
4. Post in #engineering Slack channel

---

**Last Updated**: 2024-02-13
**Owner**: Engineering Team
**Review Cadence**: Quarterly

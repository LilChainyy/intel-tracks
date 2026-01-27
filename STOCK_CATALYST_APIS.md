# Stock Market Catalyst APIs - Implementation Guide

## Complexity & Cost Assessment

### Complexity: **LOW to MODERATE** ⭐⭐
- You already have Supabase Edge Functions set up (like `fetch-stock-data`)
- Weekly fetch = simple scheduled job
- Filtering top 20 = basic sorting/filtering logic
- **Estimated implementation time: 2-4 hours**

### Cost: **$0 - $50/month** 💰

---

## Recommended APIs (Ranked by Value)

### 🥇 **Option 1: Finnhub News API** (BEST VALUE)
**Cost:** Free tier: 60 calls/minute, 1M calls/month | Paid: $14/month (unlimited)
**Why:** 
- Specifically designed for stock market news
- Free tier is generous for weekly updates
- Clean API, good documentation
- Returns news with ticker symbols attached

**API Endpoint:**
```
GET https://finnhub.io/api/v1/news?category=general&token=YOUR_API_KEY
GET https://finnhub.io/api/v1/company-news?symbol=AAPL&from=2024-01-01&to=2024-01-07&token=YOUR_API_KEY
```

**Free Tier Limits:**
- 60 API calls/minute
- 1,000,000 calls/month
- Perfect for weekly batch job (1 call/week = 52 calls/year!)

---

### 🥈 **Option 2: Alpha Vantage News & Sentiment** (YOU ALREADY USE THEM!)
**Cost:** Free tier: 5 calls/minute, 500 calls/day | Paid: $49.99/month
**Why:**
- You're already using Alpha Vantage for stock quotes
- Same API key works
- Has news sentiment endpoint

**API Endpoint:**
```
GET https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL&apikey=YOUR_API_KEY
```

**Free Tier Limits:**
- 5 API calls/minute (very restrictive)
- 500 calls/day
- ⚠️ **Problem:** Too slow for fetching multiple tickers

---

### 🥉 **Option 3: NewsAPI + Stock Filtering** (MOST FLEXIBLE)
**Cost:** Free tier: 100 requests/day | Paid: $449/month (Business)
**Why:**
- General news API, but you can filter by keywords
- Good for broad market events
- Free tier might be enough if you're smart about caching

**API Endpoint:**
```
GET https://newsapi.org/v2/everything?q=stock+market+OR+earnings+OR+FDA&sortBy=popularity&apiKey=YOUR_API_KEY
```

**Free Tier Limits:**
- 100 requests/day
- ⚠️ **Problem:** Free tier is too limited for production

---

### 🏆 **Option 4: Polygon.io News** (MOST PROFESSIONAL)
**Cost:** Free tier: 5 calls/minute | Paid: $29/month (Starter)
**Why:**
- Built specifically for financial data
- Real-time news feeds
- High quality, reliable

**API Endpoint:**
```
GET https://api.polygon.io/v2/reference/news?ticker=AAPL&apiKey=YOUR_API_KEY
```

**Free Tier Limits:**
- 5 calls/minute
- ⚠️ **Problem:** Free tier too restrictive for multiple tickers

---

## 🎯 **MY RECOMMENDATION: Finnhub** 

**Why:**
1. **Free tier is perfect** for weekly updates (1 call/week = 52/year)
2. **Clean, stock-focused** news data
3. **Easy to filter** by ticker symbols
4. **$14/month** if you need more (still very affordable)

---

## Implementation Plan

### Step 1: Create Supabase Edge Function
Create: `supabase/functions/fetch-catalysts/index.ts`

### Step 2: Weekly Cron Job
Use Supabase Cron or external scheduler (Vercel Cron, GitHub Actions, etc.)

### Step 3: Filter & Store Top 20
- Fetch news from Finnhub
- Filter by relevance (keywords: earnings, FDA, merger, partnership, etc.)
- Score by importance (volume, sentiment, ticker count)
- Store top 20 in database

### Step 4: Frontend Integration
Replace hardcoded `catalysts.ts` with database query

---

## Estimated Monthly Costs

| Solution | Monthly Cost | API Calls/Week | Notes |
|----------|-------------|----------------|-------|
| **Finnhub Free** | $0 | 1-2 | ✅ Perfect for weekly |
| **Finnhub Paid** | $14 | Unlimited | ✅ Best value |
| **Alpha Vantage** | $0 (free) | Limited | ⚠️ Too slow |
| **Alpha Vantage Paid** | $49.99 | Unlimited | 💰 Expensive |
| **Polygon.io** | $29 | Unlimited | 💰 Good but pricier |
| **NewsAPI** | $0 (free) | 100/day | ⚠️ Too limited |

---

## Next Steps

1. **Sign up for Finnhub** (free): https://finnhub.io/
2. **Get API key** (takes 2 minutes)
3. **I can help you implement** the Edge Function to fetch weekly catalysts
4. **Set up weekly cron job** to auto-update

Would you like me to:
- ✅ Create the Supabase Edge Function for fetching catalysts?
- ✅ Set up the database schema for storing catalysts?
- ✅ Update the frontend to use API data instead of hardcoded?

# Deploy Functions Now 🚀

## ✅ Secret Added!
Great! `ANTHROPIC_API_KEY` is now in Supabase.

## 🚀 Next: Deploy Updated Functions

Go to: **https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/functions**

### For Each Function Below:

1. Click on the function name (or "Create" if it doesn't exist)
2. Click **"Edit"** (or paste code if creating new)
3. **Copy the entire code** from the file listed
4. **Paste** into the editor
5. Click **"Deploy"** (or "Save")

---

## Functions to Deploy (In Order):

### 1. ✅ `ai-advisor-chat` - **UPDATE THIS**
- **File:** `supabase/functions/ai-advisor-chat/index.ts`
- **Status:** ✅ Code updated, ready to deploy
- **Changes:** Uses Claude API, optional auth, better error handling

### 2. ✅ `company-advisor-chat` - **UPDATE THIS**
- **File:** `supabase/functions/company-advisor-chat/index.ts`
- **Status:** ✅ Code updated, ready to deploy
- **Changes:** Uses Claude API, no Chinese content

### 3. ✅ `stock-analysis` - **UPDATE THIS**
- **File:** `supabase/functions/stock-analysis/index.ts`
- **Status:** ✅ Code updated, ready to deploy
- **Changes:** Uses Claude API with tool calling

### 4. ✅ `analyze-learning` - **UPDATE THIS**
- **File:** `supabase/functions/analyze-learning/index.ts`
- **Status:** ✅ Code updated, ready to deploy
- **Changes:** Uses Claude API

### 5. ✅ `fetch-stock-data` - **UPDATE THIS**
- **File:** `supabase/functions/fetch-stock-data/index.ts`
- **Status:** ✅ Code updated, ready to deploy
- **Changes:** Uses Finnhub instead of Alpha Vantage

### 6. ✅ `fetch-catalysts` - Already deployed
- **Status:** ✅ No changes needed

### 7. ⚠️ `refresh-stock-data` - Check if needed
- **File:** `supabase/functions/refresh-stock-data/index.ts`
- **Status:** Check if it uses Alpha Vantage (might need update)

### 8. ⚠️ `stock-chart` - Check if needed
- **File:** `supabase/functions/stock-chart/index.ts`
- **Status:** Check if it uses Alpha Vantage (might need update)

---

## 🧪 Test After Deploying

### Test 1: AI Advisor Chat
1. Go to Functions → `ai-advisor-chat`
2. Click **"Invoke function"**
3. Use this payload (or leave empty for default):
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is a stock?"
    }
  ]
}
```
4. Should return streaming response (not 500 error)

### Test 2: Company Advisor Chat
1. Go to Functions → `company-advisor-chat`
2. Click **"Invoke function"**
3. Use this payload:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Tell me about Apple"
    }
  ],
  "ticker": "AAPL",
  "companyName": "Apple Inc"
}
```

### Test 3: Stock Data
1. Go to Functions → `fetch-stock-data`
2. Click **"Invoke function"**
3. Use this payload:
```json
{
  "tickers": ["AAPL", "MSFT"]
}
```
4. Should return stock prices from Finnhub

---

## ✅ Success Checklist

After deploying and testing:

- [ ] `ai-advisor-chat` deployed and tested
- [ ] `company-advisor-chat` deployed and tested
- [ ] `stock-analysis` deployed (test from frontend)
- [ ] `analyze-learning` deployed (test from frontend)
- [ ] `fetch-stock-data` deployed and tested
- [ ] All functions return 200 (not 500/401)
- [ ] Frontend app works with new functions

---

## 🐛 If Something Fails

1. **Check Function Logs:**
   - Go to function → "Logs" tab
   - Look for error messages
   - Check if `ANTHROPIC_API_KEY` is being read

2. **Common Issues:**
   - **500 error:** Check logs for specific error
   - **401 error:** Auth issue (should be optional now)
   - **"API key not configured":** Secret not added correctly
   - **"Invalid API key":** Wrong key in secrets

3. **Verify Secret:**
   - Go to Settings → Functions → Secrets
   - Make sure `ANTHROPIC_API_KEY` is there
   - Check spelling (case-sensitive)

---

## 🎯 Priority Order

**Deploy these first (most important):**
1. `ai-advisor-chat` ← You just fixed this!
2. `company-advisor-chat`
3. `fetch-stock-data`

**Then test:**
4. Test each function
5. Test from frontend app

**Then deploy rest:**
6. `stock-analysis`
7. `analyze-learning`

---

## 💡 Tips

- **Deploy one at a time** - easier to debug
- **Test immediately after each deploy** - catch issues early
- **Check logs** - they show exactly what's happening
- **Copy entire file** - don't miss any code

Good luck! 🚀

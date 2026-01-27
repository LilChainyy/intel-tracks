# Next Steps - Deploy Updated Functions

## ✅ What's Done
- All functions updated (Alpha Vantage → Finnhub, Lovable → Claude)
- All Chinese content removed
- Code cleaned up (no duplicates, no linter errors)

## 🚀 Next Steps (Do These Now)

### Step 1: Get Anthropic API Key (5 minutes)

1. Go to: **https://console.anthropic.com/**
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **"Create Key"**
5. Copy the key (starts with `sk-ant-...`)

---

### Step 2: Add Secret to Supabase (2 minutes)

1. Go to: **https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/settings/functions**
2. Scroll to **"Secrets"** section
3. Click **"Add new secret"**
4. Name: `ANTHROPIC_API_KEY`
5. Value: (paste your Anthropic API key)
6. Click **"Save"**

---

### Step 3: Deploy Updated Functions (15-20 minutes)

Go to: **https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/functions**

For each function below, click **"Edit"** (or "Create" if it doesn't exist), copy the code, and click **"Deploy"**:

#### Functions to Deploy:

1. **`fetch-stock-data`** ✅ **UPDATE THIS**
   - File: `supabase/functions/fetch-stock-data/index.ts`
   - **Changed:** Now uses Finnhub instead of Alpha Vantage

2. **`ai-advisor-chat`** ✅ **UPDATE THIS**
   - File: `supabase/functions/ai-advisor-chat/index.ts`
   - **Changed:** Now uses Claude API instead of Lovable

3. **`company-advisor-chat`** ✅ **UPDATE THIS**
   - File: `supabase/functions/company-advisor-chat/index.ts`
   - **Changed:** Now uses Claude API, removed Chinese content

4. **`stock-analysis`** ✅ **UPDATE THIS**
   - File: `supabase/functions/stock-analysis/index.ts`
   - **Changed:** Now uses Claude API with tool calling

5. **`analyze-learning`** ✅ **UPDATE THIS**
   - File: `supabase/functions/analyze-learning/index.ts`
   - **Changed:** Now uses Claude API

6. **`fetch-catalysts`** ✅ Already deployed (no changes needed)

7. **`refresh-stock-data`** ⚠️ Check if it needs updates
   - File: `supabase/functions/refresh-stock-data/index.ts`

8. **`stock-chart`** ⚠️ Check if it needs updates
   - File: `supabase/functions/stock-chart/index.ts`

---

### Step 4: Test Everything (10 minutes)

After deploying, test these features:

1. **Stock Data:**
   - Open app → Go to any stock
   - Verify price loads (should use Finnhub now)

2. **AI Advisor Chat:**
   - Open AI advisor
   - Ask a question
   - Verify it responds (should use Claude now)

3. **Company Advisor:**
   - Open company advisor chat
   - Ask about a company
   - Verify it responds (should use Claude, English only)

4. **Stock Analysis:**
   - Use stock analysis feature
   - Verify it works (should use Claude with tools)

5. **Catalysts:**
   - Go to Market screen
   - Click "Refresh" button
   - Verify catalysts load

---

### Step 5: Check Function Logs (If Issues)

If something doesn't work:

1. Go to: **https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/functions**
2. Click on the function name
3. Click **"Logs"** tab
4. Look for error messages
5. Common issues:
   - **"ANTHROPIC_API_KEY is not configured"** → Add the secret (Step 2)
   - **"Rate limit exceeded"** → Wait a minute and try again
   - **"Invalid API key"** → Check the key is correct

---

## 📋 Quick Checklist

- [ ] Got Anthropic API key from console.anthropic.com
- [ ] Added `ANTHROPIC_API_KEY` secret to Supabase
- [ ] Deployed `fetch-stock-data` (updated to Finnhub)
- [ ] Deployed `ai-advisor-chat` (updated to Claude)
- [ ] Deployed `company-advisor-chat` (updated to Claude)
- [ ] Deployed `stock-analysis` (updated to Claude)
- [ ] Deployed `analyze-learning` (updated to Claude)
- [ ] Tested stock data loading
- [ ] Tested AI advisor chat
- [ ] Tested company advisor chat
- [ ] Tested stock analysis
- [ ] Tested catalysts refresh

---

## 🎯 Priority Order

**Do these first:**
1. Get Anthropic API key
2. Add secret to Supabase
3. Deploy the 5 updated functions (fetch-stock-data, ai-advisor-chat, company-advisor-chat, stock-analysis, analyze-learning)

**Then test:**
4. Test each feature
5. Check logs if anything fails

---

## 💡 Tips

- **Deploy one function at a time** - easier to debug if something goes wrong
- **Test after each deployment** - catch issues early
- **Check function logs** - they show exactly what's happening
- **Restart your dev server** after deploying: `npm run dev`

---

## ✅ You're Done When:

- All 5 functions are deployed
- `ANTHROPIC_API_KEY` secret is added
- All features work (stock data, AI chat, analysis)
- No errors in function logs

Good luck! 🚀

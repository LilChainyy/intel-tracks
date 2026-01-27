# Migration Checklist ✅

## Quick Reference - Follow in Order

### ✅ Step 1: Helper Function (Do This First!)
- [ ] Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/sql/new
- [ ] Copy contents of: `supabase/migrations/000_helper_function.sql`
- [ ] Paste and Run

### ✅ Step 2: Database Migrations (Run in Order)

Open: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/sql/new

- [ ] **Migration 1:** `20251217035005_7a01db4c-b967-428c-8f89-9eac952755d1.sql` (stock_quotes)
- [ ] **Migration 2:** `20260105084126_198f9824-4d1a-473e-9371-b85a46682c00.sql` (user_theories, user_xp)
- [ ] **Migration 3:** `20260116232543_1a9a8bd4-639f-4033-a859-748a25d591e4.sql` (quiz_responses, archetype_stats)
- [ ] **Migration 4:** `20260117043621_3a7e00e3-7099-4ca6-b2a0-255c3e4a0e35.sql` (user_nudges policy)
- [ ] **Migration 5:** `20260121040144_091d200a-8f02-4f71-a878-d44c2d93683f.sql` (referral_codes)
- [ ] **Migration 6:** `20260121040311_3153f257-3cbc-4db4-b797-aae43ab51ee3.sql` (referral function)
- [ ] **Migration 7:** `20260121040417_3a56b3f8-f864-4e07-a8ee-2ab80c497266.sql` (referral policies)
- [ ] **Migration 8:** `20260121040446_5e770d53-cb11-4a59-990e-ef564a794282.sql` (referral grants)
- [ ] **Migration 9:** `20260122000000_create_catalysts_table.sql` ✅ (already done)

**Verify:** Run this query to check all tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

### ✅ Step 3: Deploy Edge Functions

Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/functions

For each function, click "Create a new function" and copy code from:
- [ ] `supabase/functions/fetch-stock-data/index.ts`
- [ ] `supabase/functions/refresh-stock-data/index.ts`
- [ ] `supabase/functions/stock-chart/index.ts`
- [ ] `supabase/functions/stock-analysis/index.ts`
- [ ] `supabase/functions/ai-advisor-chat/index.ts`
- [ ] `supabase/functions/company-advisor-chat/index.ts`
- [ ] `supabase/functions/analyze-learning/index.ts`
- [ ] `supabase/functions/fetch-catalysts/index.ts` ✅ (already done)

### ✅ Step 4: Configure Secrets

Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/settings/functions

**Required Secrets:**
- [ ] `FINNHUB_API_KEY` ✅ (already added - used for stock quotes and catalysts)
- [ ] `ANTHROPIC_API_KEY` ⚠️ **NEW** (replaces Lovable API - used for all AI chat features)

**Note:** 
- ❌ `ALPHA_VANTAGE_API_KEY` - **NOT NEEDED** (replaced by Finnhub)
- ❌ `LOVABLE_API_KEY` - **NOT NEEDED** (replaced by Claude/Anthropic API)
- ⚠️ Old project secrets are not accessible, so you'll need to get a new Anthropic API key

**Get Anthropic API Key:**
1. Go to: https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy it and add as `ANTHROPIC_API_KEY` secret in Supabase

### ✅ Step 5: Verify Everything

- [ ] All tables exist (use SQL query above)
- [ ] All functions deployed (check Functions page)
- [ ] All secrets configured
- [ ] `.env` file updated ✅ (already done)
- [ ] Restart dev server: `npm run dev`

### ✅ Step 6: Test

- [ ] App loads without errors
- [ ] Stock data works
- [ ] Catalysts refresh works
- [ ] AI advisor works
- [ ] Quiz works

---

## 🆘 If Something Fails

**"Function already exists"** → Skip it, it's already deployed

**"Table already exists"** → Skip that migration, table is already there

**"Secret not found"** → Add it in Settings → Functions → Secrets

**"App still using old project"** → Restart dev server, clear browser cache

---

## 📝 Notes

- Each migration is in: `supabase/migrations/[filename].sql`
- Each function is in: `supabase/functions/[name]/index.ts`
- Run migrations in order (they depend on each other)
- You can run multiple SQL statements at once if they don't conflict

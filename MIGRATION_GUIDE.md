# Step-by-Step Migration Guide: Old → New Supabase Project

## Overview
Migrating from: `emscbdwqqnvcjskrdmzp` (Lovable)  
Migrating to: `joafocyskbvvfltwfefu` (adamsmyth)

---

## Step 1: Run All Database Migrations

### 1.1 Open SQL Editor for New Project
1. Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/sql/new
2. Keep this tab open - you'll run all migrations here

### 1.2 Create Helper Function (Required First)

Before running migrations, create this helper function:

**File:** `supabase/migrations/000_helper_function.sql`
- Copy the entire file contents
- Paste into SQL Editor
- Click "Run"

This function is needed by Migration 2 (user_stock_theories).

### 1.3 Run Migrations in Order

**Migration 1: Stock Quotes Table**
```sql
-- Copy entire contents of: supabase/migrations/20251217035005_7a01db4c-b967-428c-8f89-9eac952755d1.sql
```
- Open the file in your editor
- Copy all SQL
- Paste into SQL Editor
- Click "Run"

**Migration 2: User Theories & XP**
- ⚠️ **Note:** This migration uses `update_updated_at_column()` function
- Make sure you ran the helper function in step 1.2 first!
```sql
-- Copy entire contents of: supabase/migrations/20260105084126_198f9824-4d1a-473e-9371-b85a46682c00.sql
```

**Migration 3: Quiz Responses & Archetype Stats**
```sql
-- Copy entire contents of: supabase/migrations/20260116232543_1a9a8bd4-639f-4033-a859-748a25d591e4.sql
```

**Migration 4: User Nudges Policies**
```sql
-- Copy entire contents of: supabase/migrations/20260117043621_3a7e00e3-7099-4ca6-b2a0-255c3e4a0e35.sql
```

**Migration 5: Referral Codes**
```sql
-- Copy entire contents of: supabase/migrations/20260121040144_091d200a-8f02-4f71-a878-d44c2d93683f.sql
```

**Migration 6: Referral Function**
```sql
-- Copy entire contents of: supabase/migrations/20260121040311_3153f257-3cbc-4db4-b797-aae43ab51ee3.sql
```

**Migration 7: Referral Policies**
```sql
-- Copy entire contents of: supabase/migrations/20260121040417_3a56b3f8-f864-4e07-a8ee-2ab80c497266.sql
```

**Migration 8: Referral Grants**
```sql
-- Copy entire contents of: supabase/migrations/20260121040446_5e770d53-cb11-4a59-990e-ef564a794282.sql
```

**Migration 9: Catalysts (Already Done ✅)**
- This was already run when we created the catalysts table

### 1.3 Verify Tables Were Created
Run this query in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- archetype_stats
- catalysts
- quiz_responses
- referral_codes
- stock_quotes
- user_research_xp
- user_stock_theories

---

## Step 2: Deploy All Edge Functions

### 2.1 Check Which Functions Need Deployment
Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/functions

Functions to deploy:
- [ ] fetch-stock-data
- [ ] refresh-stock-data
- [ ] stock-chart
- [ ] stock-analysis
- [ ] ai-advisor-chat
- [ ] company-advisor-chat
- [ ] analyze-learning
- [x] fetch-catalysts (already deployed)

### 2.2 Deploy Each Function

**Option A: Via Supabase Dashboard (Easiest)**

For each function:
1. Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/functions
2. Click "Create a new function"
3. Name it (e.g., `fetch-stock-data`)
4. Copy the entire contents of `supabase/functions/[function-name]/index.ts`
5. Paste into the editor
6. Click "Deploy"

**Option B: Via Supabase CLI (If you have access token)**

```bash
# Link to project
supabase link --project-ref joafocyskbvvfltwfefu

# Deploy each function
supabase functions deploy fetch-stock-data
supabase functions deploy refresh-stock-data
supabase functions deploy stock-chart
supabase functions deploy stock-analysis
supabase functions deploy ai-advisor-chat
supabase functions deploy company-advisor-chat
supabase functions deploy analyze-learning
```

---

## Step 3: Set Up Secrets

### 3.1 Go to Secrets Page
Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/settings/functions

### 3.2 Add Required Secrets

**FINNHUB_API_KEY** ✅ (Already added)
- Name: `FINNHUB_API_KEY`
- Value: Your Finnhub API key

**ALPHA_VANTAGE_API_KEY** (If used by stock functions)
- Name: `ALPHA_VANTAGE_API_KEY`
- Value: Your Alpha Vantage API key
- Check old project to see if this exists: https://supabase.com/dashboard/project/emscbdwqqnvcjskrdmzp/settings/functions

**LOVABLE_API_KEY** (If used by AI advisor)
- Name: `LOVABLE_API_KEY`
- Value: Your Lovable API key
- Check old project to see if this exists

---

## Step 4: Migrate Data (If You Have User Data)

### 4.1 Check If You Have Data to Migrate

**In Old Project:**
1. Go to: https://supabase.com/dashboard/project/emscbdwqqnvcjskrdmzp/editor
2. Check each table for row counts
3. If tables have data, you'll need to export/import

### 4.2 Export Data from Old Project

For each table with data:
1. Go to Table Editor in old project
2. Click on the table
3. Click "Export" or use SQL:
```sql
-- Example: Export stock_quotes
SELECT * FROM public.stock_quotes;
-- Copy the results
```

### 4.3 Import Data to New Project

1. Go to Table Editor in new project
2. Click on the table
3. Click "Insert" → "Insert row" or use SQL:
```sql
-- Example: Import stock_quotes
INSERT INTO public.stock_quotes (ticker, current_price, ytd_change, is_positive)
VALUES 
  ('AAPL', 150.00, 5.2, true),
  -- ... paste your data
;
```

**Note:** If you don't have user data yet, skip this step.

---

## Step 5: Update App Configuration

### 5.1 Verify .env File
Your `.env` should already be updated (we did this earlier):
```env
VITE_SUPABASE_PROJECT_ID="joafocyskbvvfltwfefu"
VITE_SUPABASE_URL="https://joafocyskbvvfltwfefu.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-key>"
```

### 5.2 Restart Dev Server
```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

---

## Step 6: Test Everything

### 6.1 Test Database Tables
1. Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/editor
2. Verify all tables exist
3. Try inserting a test row in each table

### 6.2 Test Edge Functions
1. Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/functions
2. Click on each function
3. Click "Invoke function" to test
4. Check logs for errors

### 6.3 Test in App
1. Start your app: `npm run dev`
2. Test features:
   - [ ] Stock data loads
   - [ ] Catalysts refresh works
   - [ ] AI advisor chat works
   - [ ] Quiz works
   - [ ] User theories save

---

## Step 7: Clean Up (Optional)

Once everything works on new project:
1. You can keep old project as backup
2. Or delete it if you're confident everything migrated

---

## Troubleshooting

### "Table already exists" error
- Some tables might already exist
- Use `CREATE TABLE IF NOT EXISTS` or skip that migration

### "Function already exists" error
- Function is already deployed
- Skip or update it

### "Secret not found" error
- Make sure all secrets are added in Settings → Functions → Secrets

### App still connecting to old project
- Restart dev server after .env changes
- Clear browser cache
- Check .env file is in project root

---

## Quick Checklist

- [ ] All migrations run on new project
- [ ] All Edge Functions deployed to new project
- [ ] All secrets configured
- [ ] Data migrated (if needed)
- [ ] .env file updated
- [ ] Dev server restarted
- [ ] Everything tested and working

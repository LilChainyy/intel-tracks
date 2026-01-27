# Catalyst API Setup Guide

## Quick Start (5 minutes)

### Step 1: Get Finnhub API Key (FREE)
1. Go to https://finnhub.io/
2. Click "Get Free API Key"
3. Sign up (takes 2 minutes)
4. Copy your API key

### Step 2: Add API Key to Supabase
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add new secret:
   - **Name:** `FINNHUB_API_KEY`
   - **Value:** (paste your API key)

### Step 3: Run Database Migration
```bash
# If using Supabase CLI
supabase db push

# Or run the migration manually in Supabase SQL Editor:
# Copy contents of: supabase/migrations/20260122000000_create_catalysts_table.sql
```

### Step 4: Deploy Edge Function
```bash
# Deploy the function
supabase functions deploy fetch-catalysts

# Or test locally first
supabase functions serve fetch-catalysts
```

### Step 5: Test the Function
```bash
# Call the function
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/fetch-catalysts \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## Weekly Auto-Update Setup

You have 3 options for weekly updates:

### Option 1: Supabase Cron (Recommended)
If you have Supabase Pro plan, you can use pg_cron:

```sql
-- Run every Monday at 9 AM UTC
SELECT cron.schedule(
  'fetch-weekly-catalysts',
  '0 9 * * 1',  -- Every Monday at 9 AM
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/fetch-catalysts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    )
  ) AS request_id;
  $$
);
```

### Option 2: GitHub Actions (FREE)
Create `.github/workflows/fetch-catalysts.yml`:

```yaml
name: Fetch Weekly Catalysts

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Fetch Catalysts
        run: |
          curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/fetch-catalysts \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

### Option 3: Vercel Cron (FREE)
If you deploy to Vercel, add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/fetch-catalysts",
    "schedule": "0 9 * * 1"
  }]
}
```

---

## Frontend Integration

Update your code to fetch from database instead of hardcoded data:

### Option A: Update `src/data/catalysts.ts`
```typescript
import { supabase } from '@/integrations/supabase/client';
import { Catalyst } from '@/context/AppContext';

// Fetch from database
export async function getCatalysts(): Promise<Catalyst[]> {
  const { data, error } = await supabase
    .from('catalysts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) {
    console.error('Error fetching catalysts:', error);
    return []; // Fallback to empty array
  }

  return data.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as Catalyst['category'],
    time: row.time,
    icon: row.icon,
    companies: row.companies || [],
    themeId: row.theme_id || '',
    impact: row.impact as Catalyst['impact'],
  }));
}

// Keep static data as fallback
export const catalysts: Catalyst[] = [
  // ... your existing hardcoded data
];
```

### Option B: Use React Hook
Create `src/hooks/useCatalysts.ts`:

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Catalyst } from '@/context/AppContext';

export function useCatalysts() {
  const [catalysts, setCatalysts] = useState<Catalyst[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCatalysts() {
      const { data, error } = await supabase
        .from('catalysts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setCatalysts(data.map(row => ({
          id: row.id,
          title: row.title,
          description: row.description,
          category: row.category as Catalyst['category'],
          time: row.time,
          icon: row.icon,
          companies: row.companies || [],
          themeId: row.theme_id || '',
          impact: row.impact as Catalyst['impact'],
        })));
      }
      setIsLoading(false);
    }

    fetchCatalysts();
  }, []);

  return { catalysts, isLoading };
}
```

---

## Cost Breakdown

### Monthly Costs:
- **Finnhub API:** $0 (free tier) or $14/month (paid)
- **Supabase:** $0 (free tier) or $25/month (Pro for cron)
- **Storage:** ~$0.01/month (catalysts are tiny)
- **Edge Function Calls:** $0 (free tier: 500K invocations/month)

**Total: $0 - $39/month** (depending on your plan)

### API Call Frequency:
- **1 call per week** = 4-5 calls/month
- **Free tier:** 1,000,000 calls/month ✅
- **You'll use 0.0005% of your quota!**

---

## Troubleshooting

### "FINNHUB_API_KEY not configured"
- Make sure you added the secret in Supabase dashboard
- Secret name must be exactly: `FINNHUB_API_KEY`

### "Table catalysts does not exist"
- Run the migration: `supabase db push`
- Or manually create the table using the SQL in the migration file

### "No catalysts returned"
- Check Finnhub API key is valid
- Check Edge Function logs in Supabase dashboard
- Verify the function deployed successfully

### Rate Limiting
- Free tier: 60 calls/minute (you only need 1/week)
- If you hit limits, upgrade to $14/month plan

---

## Next Steps

1. ✅ Get Finnhub API key
2. ✅ Add secret to Supabase
3. ✅ Run migration
4. ✅ Deploy Edge Function
5. ✅ Test manually
6. ✅ Set up weekly cron
7. ✅ Update frontend to use database

**Estimated total time: 15-20 minutes** ⏱️

# Supabase Configuration Check

## Issue: Two Supabase Projects

You have:
1. **Old project**: `emscbdwqqnvcjskrdmzp` (from Lovable)
2. **New project**: `joafocyskbvvfltwfefu` (adamsmyth)

## Current Configuration

- `supabase/config.toml`: `joafocyskbvvfltwfefu` ✅
- Environment variables: Check your `.env` file or deployment platform

## How to Check Which Project You're Using

1. **Check browser console** when app loads:
   - Look for Supabase connection logs
   - Check the URL being used

2. **Check environment variables**:
   - Look for `.env` file in project root
   - Or check your deployment platform (Vercel/Netlify) environment variables
   - Should be: `https://joafocyskbvvfltwfefu.supabase.co`

3. **Check Edge Function deployment**:
   - Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/functions
   - See if `fetch-catalysts` is listed there

## Fix Steps

1. **Update environment variables** to point to new project:
   ```
   VITE_SUPABASE_URL=https://joafocyskbvvfltwfefu.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key-from-adamsmyth-project>
   ```

2. **Deploy Edge Function** to new project:
   - Make sure `fetch-catalysts` is deployed to `joafocyskbvvfltwfefu`

3. **Verify database**:
   - Check that `catalysts` table exists in `joafocyskbvvfltwfefu` project

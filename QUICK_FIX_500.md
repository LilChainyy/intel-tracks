# Quick Fix for 500 Errors

## The Problem
"EarlyDrop" means the function is crashing immediately, likely due to:
1. Code syntax error
2. Import error
3. Secret access issue

## Solution: Deploy Test Function First

### Step 1: Delete and Recreate `test-secrets`

1. Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/functions
2. If `test-secrets` exists, **delete it**
3. Click **"Create a new function"**
4. Name: `test-secrets`
5. **Copy this ENTIRE code** (simplified version):

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const anthropic = Deno.env.get("ANTHROPIC_API_KEY")
    const finnhub = Deno.env.get("FINNHUB_API_KEY")
    
    return new Response(JSON.stringify({
      success: true,
      hasAnthropic: !!anthropic,
      hasFinnhub: !!finnhub,
      anthropicPrefix: anthropic ? anthropic.substring(0, 10) + "..." : "missing",
      finnhubPrefix: finnhub ? finnhub.substring(0, 10) + "..." : "missing",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
```

6. Click **"Deploy"**
7. Click **"Invoke function"** (leave payload empty)
8. **Check the response** - it should show if secrets are accessible

---

## What the Response Means:

### ✅ If you see:
```json
{
  "success": true,
  "hasAnthropic": true,
  "hasFinnhub": true,
  ...
}
```
**Good!** Secrets are accessible. The problem is in the other functions' code.

### ❌ If you see:
```json
{
  "success": true,
  "hasAnthropic": false,
  "hasFinnhub": false,
  ...
}
```
**Problem!** Secrets aren't accessible. Fix:
1. Go to Settings → Functions → Secrets
2. Verify `ANTHROPIC_API_KEY` exists (exact spelling, case-sensitive)
3. If missing, add it
4. Redeploy function

---

## If Test Function Works, Fix Other Functions

The issue is likely in how the other functions are structured. Common problems:

1. **Too many @ts-ignore comments** - might cause issues
2. **Complex error handling** - might be throwing errors
3. **Stream processing** - might be failing

### Quick Fix: Simplify `ai-advisor-chat`

Try this minimal version first to see if it works:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const key = Deno.env.get("ANTHROPIC_API_KEY")
    
    if (!key) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not found" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      hasKey: true,
      message: "API key is accessible"
    }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})
```

If this works, the problem is in the complex code. If this fails, it's a secret access issue.

---

## Next Steps:

1. **Deploy test-secrets** with the code above
2. **Test it** - see if secrets are accessible
3. **Share the result** - I'll help fix based on what you see

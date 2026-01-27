# Debug 500 Errors - Step by Step

## 🔍 Step 1: Check Function Logs

For each function giving 500 error:

1. Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/functions
2. Click on the function name
3. Click **"Logs"** tab
4. Look for the most recent error
5. **Copy the error message** - this tells us exactly what's wrong

Common errors you might see:
- `ANTHROPIC_API_KEY is not configured` → Secret not accessible
- `SyntaxError` → Code has syntax error
- `TypeError` → Code has type error
- `Claude API error: 401` → Invalid API key
- `Claude API error: 400` → Invalid request format

---

## 🔍 Step 2: Verify Secrets Are Set

1. Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/settings/functions
2. Scroll to **"Secrets"** section
3. Verify these secrets exist:
   - ✅ `ANTHROPIC_API_KEY` (should be there)
   - ✅ `FINNHUB_API_KEY` (should be there)
   - ✅ `SUPABASE_URL` (auto-set by Supabase)
   - ✅ `SUPABASE_ANON_KEY` (auto-set by Supabase)
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` (auto-set by Supabase)

**Important:** Secret names are **case-sensitive**!
- ✅ Correct: `ANTHROPIC_API_KEY`
- ❌ Wrong: `anthropic_api_key` or `Anthropic_Api_Key`

---

## 🔍 Step 3: Test Secret Access

Create a simple test function to verify secrets work:

1. Go to Functions → Create new function
2. Name: `test-secrets`
3. Code:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const anthropic = Deno.env.get("ANTHROPIC_API_KEY");
  const finnhub = Deno.env.get("FINNHUB_API_KEY");
  
  return new Response(JSON.stringify({
    hasAnthropic: !!anthropic,
    hasFinnhub: !!finnhub,
    anthropicPrefix: anthropic ? anthropic.substring(0, 10) + "..." : "missing",
    finnhubPrefix: finnhub ? finnhub.substring(0, 10) + "..." : "missing"
  }), {
    headers: { "Content-Type": "application/json" }
  });
});
```

4. Deploy and test
5. Should return `{"hasAnthropic": true, "hasFinnhub": true, ...}`

If this returns `false`, secrets aren't accessible.

---

## 🔍 Step 4: Check for Syntax Errors

The code might have syntax errors. Let me check each function:

### Common Issues:

1. **Missing imports**
2. **Type errors** (though @ts-ignore should handle these)
3. **Async/await issues**
4. **JSON parsing errors**

---

## 🔍 Step 5: Test with Minimal Code

Try deploying a minimal version first:

### Minimal `ai-advisor-chat` test:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const key = Deno.env.get("ANTHROPIC_API_KEY");
    
    if (!key) {
      return new Response(JSON.stringify({ 
        error: "ANTHROPIC_API_KEY not found",
        allEnvKeys: Object.keys(Deno.env.toObject())
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      hasKey: true,
      keyPrefix: key.substring(0, 10) + "..."
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
```

If this works, the secret is accessible. If not, there's a secret access issue.

---

## 🐛 Most Likely Issues:

### Issue 1: Secret Not Accessible
**Symptom:** Logs show "ANTHROPIC_API_KEY is not configured"
**Fix:**
1. Go to Settings → Functions → Secrets
2. Delete `ANTHROPIC_API_KEY`
3. Re-add it (make sure name is exactly `ANTHROPIC_API_KEY`)
4. Redeploy function

### Issue 2: Code Syntax Error
**Symptom:** Logs show "SyntaxError" or "TypeError"
**Fix:**
1. Check the function code for syntax errors
2. Make sure all imports are correct
3. Try the minimal test code above

### Issue 3: Invalid API Key
**Symptom:** Logs show "Claude API error: 401"
**Fix:**
1. Verify API key is correct in Anthropic console
2. Make sure you copied the full key
3. Re-add secret with correct key

### Issue 4: Request Format Error
**Symptom:** Logs show "Claude API error: 400"
**Fix:**
1. Check the request payload format
2. Make sure messages array is correct

---

## 📋 Action Plan:

1. **Check logs** for each function → Get exact error message
2. **Run test-secrets function** → Verify secrets are accessible
3. **If secrets not accessible** → Re-add them
4. **If code error** → Check syntax, try minimal version
5. **If API error** → Verify API key is correct

---

## 💡 Quick Fixes to Try:

1. **Redeploy function** (sometimes fixes deployment issues)
2. **Delete and re-add secret** (sometimes fixes access issues)
3. **Check function logs** (shows exact error)
4. **Try minimal test code** (isolates the issue)

---

**Next Step:** Check the function logs and tell me what error message you see. That will tell us exactly what's wrong!

# Fix Claude Model Name Issue

## Problem
The model name `claude-3-5-sonnet-20241022` doesn't exist. I've updated all functions to use `claude-3-sonnet-20240229` (the stable Claude 3 Sonnet model).

## Updated Model Names

All functions now use: **`claude-3-sonnet-20240229`**

This is the stable, widely available Claude 3 Sonnet model.

## If Still Getting 404 Error

### Option 1: Test Which Models Work

I created a test function to find which model works with your API key:

1. Deploy: `supabase/functions/test-claude-model/index.ts`
2. Test it - it will try different model names and tell you which one works
3. Use the recommended model from the test results

### Option 2: Check Your Anthropic Account

1. Go to: https://console.anthropic.com/
2. Check what models you have access to
3. Some accounts might only have access to certain models

### Option 3: Use Alternative Models

If Sonnet doesn't work, try these alternatives:

- `claude-3-haiku-20240307` (faster, cheaper)
- `claude-3-opus-20240229` (more powerful, more expensive)
- `claude-3-5-sonnet-20240620` (if you have access)

## Quick Fix: Update All Functions

All functions are already updated to use `claude-3-sonnet-20240229`. Just:

1. **Deploy the updated functions** (copy code from files)
2. **Test again**

If it still fails, deploy the `test-claude-model` function to find which model works with your API key.

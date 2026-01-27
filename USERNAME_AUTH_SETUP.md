# Username + Referral Code Authentication Setup

## Overview
The app now uses **username + referral code** authentication instead of email/password. Behind the scenes, Supabase Auth still requires email/password, so we auto-generate them:
- **Email**: `username@app.local` (auto-generated)
- **Password**: Generated from referral code (acts as password)

## Setup Steps

### 1. Run Database Migration
Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/sql/new

Run the migration file:
- `supabase/migrations/000_create_user_profiles.sql`

This creates:
- `user_profiles` table to store usernames
- Function to create/update user profiles
- Function to lookup users by username

### 2. Disable Email Confirmation (Important!)
Go to: https://supabase.com/dashboard/project/joafocyskbvvfltwfefu/auth/providers

1. Click on **Email** provider
2. **Disable** "Confirm email" toggle
3. Save changes

This allows users to sign in immediately without email verification (since emails are auto-generated anyway).

### 3. Test the Flow

**Signup:**
1. Enter username (3+ characters, alphanumeric + underscore only)
2. Enter referral code (`ALLTIME2026`, `20Al1`, or `20Al21`)
3. Click "Get Access"
4. Should create account and sign in immediately

**Login:**
1. Enter username
2. Enter referral code (same one used during signup)
3. Click "Sign In"
4. Should sign in successfully

## How It Works

1. **Signup Flow:**
   - User enters username + referral code
   - Validates referral code
   - Creates Supabase Auth user with auto-generated email/password
   - Creates user profile with username
   - Increments referral code usage
   - Signs user in automatically

2. **Login Flow:**
   - User enters username + referral code
   - Validates referral code
   - Looks up email from username (via auto-generated format)
   - Signs in with email + password (generated from referral code)

## Security Notes

- Referral code acts as both access key and password
- Usernames must be unique
- Referral codes are validated before signup/login
- Email addresses are auto-generated and not used by users

## Troubleshooting

**"Invalid login credentials" error:**
- Make sure username matches exactly (case-insensitive)
- Make sure referral code matches the one used during signup
- Check that user profile was created (check `user_profiles` table)

**"Username taken" error:**
- Username already exists
- Try a different username or sign in instead

**Email confirmation required:**
- Make sure email confirmation is disabled in Supabase settings
- Check Auth > Providers > Email settings

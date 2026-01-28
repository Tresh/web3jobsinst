
# Referral System Fix Plan

## Problem Summary

The referral system is **completely broken**. After investigating the database and code:

- **0 referrals recorded** (empty `scholar_referrals` table) despite 1,668 users
- **0 WJI earned** by anyone (empty `wji_balances` and `wji_transactions`)
- **20+ referral codes exist** but no referrals tracked

## Root Cause

The referral code is stored in `sessionStorage` during signup, but the actual referral record is only created when the user logs in after email confirmation. This fails because:

1. `sessionStorage` is cleared when the browser closes
2. Users often confirm email from a different device/browser
3. Even if same browser, the session might be lost

## Technical Solution

### Step 1: Capture Referral Code Immediately During Signup

Store the referral code in Supabase user metadata during signup (not just sessionStorage). This survives email confirmation and cross-device login.

**File: `src/contexts/AuthContext.tsx`**
- Modify `signUpWithEmail` to include referral code in user metadata
- The referral code should be passed from the signup form

**File: `src/pages/Signup.tsx`**
- Pass the referral code to `signUpWithEmail` function
- Code is already captured from URL parameter

### Step 2: Create Referral Record on First Login

Modify the `SIGNED_IN` event handler to:
1. First check `sessionStorage` (for same-session signups)
2. Then check `user.user_metadata.referral_code` (for cross-device confirmation)
3. Create the referral record if valid code found
4. Clear the metadata after successful tracking

**File: `src/contexts/AuthContext.tsx`**
- Update the `onAuthStateChange` handler
- Add fallback to user metadata for referral code

### Step 3: Update AuthContext Interface

Add referral code parameter to `signUpWithEmail`:
```typescript
signUpWithEmail: (email: string, password: string, fullName?: string, referralCode?: string) => Promise<{ error: Error | null }>;
```

## Files to Modify

1. **`src/contexts/AuthContext.tsx`**
   - Add `referralCode` parameter to `signUpWithEmail`
   - Store referral code in user metadata during signup
   - Check both sessionStorage AND user metadata in SIGNED_IN handler

2. **`src/pages/Signup.tsx`**
   - Pass `referralCode` to `signUpWithEmail`

## What This Fixes

- Referrals will be recorded immediately after first login
- Works even if user confirms email from different device
- WJI will be awarded when referred user completes first task
- Scholar dashboard will show accurate referral counts

## What Stays Unchanged

- XP system (not touched)
- Task submission logic (not touched)
- Fraud detection rules (not touched)
- Admin dashboards (not touched)
- WJI reward trigger logic (already correct, just needs referrals to exist)

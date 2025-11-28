# Trial Tracking Fix

## Problem
Users who had previously used a trial subscription were being offered another trial after cancelling. This happened because the `trialEndsAt` field was being cleared (set to `null`) when subscriptions were cancelled or updated.

## Root Cause
In the Stripe webhook handlers, we were explicitly setting `trialEndsAt: null` in several places:
1. `handleSubscriptionDeleted` - When a subscription was cancelled
2. `handleLifetimePayment` - When upgrading to lifetime
3. `handleCheckoutCompleted` - When subscribing without a trial (overwriting history)
4. `handleSubscriptionUpdate` - When subscription updated without trial (overwriting history)

## Solution Implemented
Modified `src/app/api/stripe/webhook/route.ts` to preserve the `trialEndsAt` field as a historical record:

1. **handleSubscriptionDeleted**: Removed `trialEndsAt: null` - now preserves the trial history when cancelling
2. **handleLifetimePayment**: Removed `trialEndsAt: null` - now preserves trial history when upgrading to lifetime
3. **handleCheckoutCompleted**: Changed to conditionally update - only sets `trialEndsAt` if a new trial is starting
4. **handleSubscriptionUpdate**: Changed to conditionally update - only sets `trialEndsAt` if a new trial is active

## Data Migration Required

### For Existing Users
Users who already had their `trialEndsAt` cleared need to be fixed. You can identify these users by looking at the `SubscriptionHistory` table to see who had trials in the past.

### Option 1: SQL Query to Fix Known Users
If you know specific users (like "buritco@gmail.com"), you can manually set their `trialEndsAt`:

```sql
-- Find the user's profile
SELECT p.id, p.trialEndsAt, u.email 
FROM "Profile" p
JOIN "User" u ON u.id = p.userId
WHERE u.email = 'buritco@gmail.com';

-- Set trialEndsAt to a past date to indicate they've used their trial
UPDATE "Profile"
SET "trialEndsAt" = '2025-11-27 00:00:00'
WHERE id IN (
  SELECT p.id 
  FROM "Profile" p
  JOIN "User" u ON u.id = p.userId
  WHERE u.email = 'buritco@gmail.com'
);
```

### Option 2: Automated Fix Based on Subscription History
This query finds all users who have subscription history indicating they had a trial, but currently have `trialEndsAt` set to null:

```sql
-- Find profiles that had trials but trialEndsAt is now null
SELECT DISTINCT p.id, u.email, sh.createdAt
FROM "Profile" p
JOIN "User" u ON u.id = p.userId
JOIN "SubscriptionHistory" sh ON sh.profileId = p.id
WHERE p.trialEndsAt IS NULL
  AND sh.notes LIKE '%trial%'
ORDER BY sh.createdAt DESC;

-- Update them to mark trial as used (set to the date of their first trial)
UPDATE "Profile" p
SET "trialEndsAt" = (
  SELECT MIN(sh.createdAt)
  FROM "SubscriptionHistory" sh
  WHERE sh.profileId = p.id
    AND sh.notes LIKE '%trial%'
)
WHERE p.id IN (
  SELECT DISTINCT p2.id
  FROM "Profile" p2
  JOIN "SubscriptionHistory" sh ON sh.profileId = p2.id
  WHERE p2.trialEndsAt IS NULL
    AND sh.notes LIKE '%trial%'
);
```

### Option 3: Check Stripe Directly
For the most accurate data, you can query Stripe's API to check if a customer ever had a trial:

```bash
# Using Stripe CLI
stripe customers list --email buritco@gmail.com
stripe subscriptions list --customer <customer_id> --limit 100
```

Then manually update the database based on Stripe's records.

## Testing
After applying the fix:

1. **Test with a user who has used a trial:**
   - Log in as the user
   - Go to subscription page
   - Verify "7 dní zadarmo" badge does NOT appear
   - Verify clicking "Zmeniť" does NOT offer a trial

2. **Test with a new user:**
   - Create a new account
   - Go to subscription page
   - Verify "7 dní zadarmo" badge DOES appear
   - Start a trial subscription
   - Cancel it
   - Verify "7 dní zadarmo" badge no longer appears

3. **Test subscription flows:**
   - Trial → Cancel → Should not get another trial
   - Trial → Upgrade to paid → Cancel → Should not get another trial
   - Paid → Cancel → Subscribe again → Should not get a trial (already used)

## Verification Query
To verify the fix is working, check that users with cancelled subscriptions still have their `trialEndsAt` preserved:

```sql
SELECT 
  u.email,
  p.subscriptionStatus,
  p.trialEndsAt,
  t.name as currentTier
FROM "Profile" p
JOIN "User" u ON u.id = p.userId
JOIN "Tier" t ON t.id = p.tierId
WHERE p.subscriptionStatus = 'CANCELLED'
  AND p.trialEndsAt IS NOT NULL
ORDER BY p.updatedAt DESC
LIMIT 10;
```

## Notes
- `trialEndsAt` now serves as a permanent record of whether a user has ever used a trial
- If `trialEndsAt` is not null (any date, past or future), the user has used their trial
- If `trialEndsAt` is null, the user has never used a trial and is eligible
- The actual trial status is determined by `subscriptionStatus` field, not `trialEndsAt`

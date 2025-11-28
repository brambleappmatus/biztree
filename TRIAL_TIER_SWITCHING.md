# Trial Tier Switching Issue

## Problem
When a user cancels their Business trial and then tries to switch to Pro trial by clicking "Obnoviť predplatné" on the Pro card, they get switched back to Business instead of Pro.

## Root Cause
The issue is likely in one of these areas:

### 1. **Reactivate Function** (Most Likely)
When clicking "Obnoviť predplatné" on a DIFFERENT tier (Pro) while having a cancelled subscription (Business), the system might be:
- Reactivating the old Business subscription instead of creating a new Pro subscription
- Not properly handling the tier change

### 2. **Possible Scenarios**

#### Scenario A: Pro card shows "Obnoviť predplatné" (Reactivate)
- This would reactivate the Business subscription (wrong)
- **Fix**: Pro card should show normal "Obnoviť predplatné" button that starts a NEW checkout for Pro

#### Scenario B: Pro card shows normal upgrade button
- Clicking it should start a new Pro trial
- If it's switching back to Business, the webhook might be using the wrong tier
- **Fix**: Check webhook logic to ensure it uses the tier from the NEW checkout, not the old subscription

## Solution

### Option 1: Allow Tier Switching During Cancelled Trial (Recommended)
When a subscription is cancelled:
1. **Current tier card** (Business): Show "Obnoviť predplatné" → Reactivates Business
2. **Other tier cards** (Pro): Show "Obnoviť predplatné" → Starts NEW Pro trial (cancels old Business trial)

This requires:
- Cancelling the old subscription before starting the new one
- Or: Treating cancelled subscriptions as "no active subscription" for upgrade purposes

### Option 2: Force Complete Cancellation First
1. User cancels Business trial
2. User must wait until trial ends
3. Then user can start Pro trial

This is simpler but worse UX.

## Implementation for Option 1

### Step 1: Modify Subscription Actions Logic
In `subscription-actions.tsx`, when `cancelAtPeriodEnd = true`:
- If this is the CURRENT tier: Show reactivate button
- If this is a DIFFERENT tier: Treat as new subscription (show upgrade button)

### Step 2: Handle Tier Change in Checkout
When creating a new checkout while having a cancelled subscription:
1. Cancel the old subscription immediately (don't wait for period end)
2. Create new subscription with new tier
3. Transfer remaining trial days to new subscription (optional)

### Step 3: Update Webhook
Ensure webhook uses the tier from the checkout session metadata, not from existing subscription.

## Quick Fix (Easiest)
The simplest solution: When a subscription is cancelled, treat it as "no active subscription" for the purpose of showing upgrade buttons on other tiers.

Change in `pricing-section.tsx`:
```tsx
const hasActiveSubscription = !!activeSubscription && !activeSubscription.cancelAtPeriodEnd;
```

This way:
- Cancelled Business: Shows as "has no active subscription"
- Pro card: Shows normal upgrade button
- Clicking Pro: Starts new Pro trial, old Business trial is cancelled

## Testing
1. Start Business trial
2. Cancel Business trial
3. Click "Obnoviť predplatné" on Pro card
4. Verify you get Pro tier, not Business
5. Verify trial period continues (or restarts)

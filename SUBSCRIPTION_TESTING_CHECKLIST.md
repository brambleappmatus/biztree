# Subscription System Testing Checklist

## 🎯 Overview
This checklist covers all the subscription features and improvements implemented, including trial management, UI refinements, dynamic pricing, and cancellation flows.

---

## ✅ 1. Dynamic Pricing from Stripe

### Test: Prices Display Correctly
- [ ] **Landing Page** (`/`)
  - [ ] Monthly prices match Stripe Dashboard
  - [ ] Yearly prices match Stripe Dashboard (with -25% badge)
  - [ ] Lifetime prices match Stripe Dashboard (if enabled)
  - [ ] All prices update automatically when changed in Stripe (no code changes needed)

- [ ] **Subscription Page** (`/admin/subscription`)
  - [ ] Monthly prices match Stripe Dashboard
  - [ ] Yearly prices match Stripe Dashboard
  - [ ] Lifetime prices match Stripe Dashboard (if enabled)
  - [ ] Prices are fetched dynamically on page load

### How to Test:
1. Check current prices in Stripe Dashboard
2. Compare with prices shown on landing page and subscription page
3. (Optional) Change a price in Stripe, restart dev server, verify UI updates

---

## ✅ 2. Trial Management & Abuse Prevention

### Test: Single Trial Window (No Multiple Trials)
- [ ] **New User - First Trial**
  - [ ] Create a new account
  - [ ] Go to subscription page
  - [ ] "7 dní zadarmo" badge IS visible on monthly Business/Pro plans
  - [ ] "7 dní zadarmo" badge is NOT visible on yearly plans
  - [ ] "7 dní zadarmo" badge is NOT visible on lifetime plans
  - [ ] Start a trial subscription
  - [ ] Verify trial starts successfully

- [ ] **After Trial Used - No More Trials**
  - [ ] Cancel the trial (or let it expire)
  - [ ] Return to subscription page
  - [ ] "7 dní zadarmo" badge is NOT visible on any plan
  - [ ] Clicking "Zmeniť" does NOT offer a trial
  - [ ] Checkout proceeds directly to payment (no trial period)

- [ ] **Existing User with Past Trial**
  - [ ] Log in as user who previously had a trial (e.g., buritco@gmail.com)
  - [ ] Go to subscription page
  - [ ] "7 dní zadarmo" badge is NOT visible
  - [ ] Cannot get another trial

### Database Verification:
```sql
-- Check that trialEndsAt is preserved after cancellation
SELECT u.email, p.subscriptionStatus, p.trialEndsAt, t.name as tier
FROM "Profile" p
JOIN "User" u ON u.id = p.userId
JOIN "Tier" t ON t.id = p.tierId
WHERE u.email = 'buritco@gmail.com';
-- trialEndsAt should NOT be null if user had a trial
```

---

## ✅ 3. Yearly & Lifetime Plans - No Trial

### Test: Immediate Payment Required
- [ ] **Yearly Plans**
  - [ ] "7 dní zadarmo" badge is NOT shown
  - [ ] Clicking "Zmeniť" goes directly to payment
  - [ ] No trial period is offered in Stripe checkout
  - [ ] Subscription starts immediately upon payment

- [ ] **Lifetime Plans** (if enabled)
  - [ ] "7 dní zadarmo" badge is NOT shown
  - [ ] Clicking "Zmeniť" goes directly to payment
  - [ ] No trial period is offered
  - [ ] Payment is one-time (not recurring)
  - [ ] User gets lifetime access immediately

---

## ✅ 4. Subscription Cancellation UI

### Test: Cancellation Notice & Badge
- [ ] **Active Subscription - Before Cancellation**
  - [ ] Banner shows "Aktívne predplatné" badge (green)
  - [ ] Current tier card shows "Spravovať fakturáciu" and "Zrušiť predplatné" buttons
  - [ ] Other tier cards show "Zmeniť" button

- [ ] **During Cancellation - Still Active**
  - [ ] Click "Zrušiť predplatné"
  - [ ] Confirm cancellation
  - [ ] Banner shows "Zrušené" badge (orange) instead of "Aktívne predplatné"
  - [ ] Banner shows "Platné do" instead of "Ďalšia platba"
  - [ ] Current tier card shows "Ukončené" notice with info tooltip
  - [ ] Current tier card shows "Obnoviť predplatné" button
  - [ ] Tooltip on hover shows: "Predplatné bude zrušené na konci obdobia..."

- [ ] **After Expiration - Back to Free**
  - [ ] Wait for subscription to expire (or manually update DB)
  - [ ] Refresh subscription page
  - [ ] "Zrušené" badge is GONE (no badge shown)
  - [ ] User is on "Free Member" tier
  - [ ] Banner shows "Zdarma" price
  - [ ] No "Ďalšia platba" section shown

### How to Test Expiration Quickly:
```sql
-- Manually expire a subscription for testing
UPDATE "Profile"
SET "subscriptionExpiresAt" = NOW() - INTERVAL '1 day',
    "subscriptionStatus" = 'CANCELLED'
WHERE id = 'YOUR_PROFILE_ID';
```

---

## ✅ 5. Free Tier Handling

### Test: Free Tier Display
- [ ] **User on Free Tier**
  - [ ] Banner shows "Free Member"
  - [ ] Banner shows "Zdarma" price
  - [ ] No "Ďalšia platba" section
  - [ ] Free tier card shows "Aktuálny plán" button (disabled/grey)
  - [ ] Free tier card does NOT show "Zmeniť" button
  - [ ] Other tier cards (Business/Pro) show "Zmeniť" button

---

## ✅ 6. Subscription Management Buttons

### Test: Button Visibility & Styling
- [ ] **On Current Tier Card**
  - [ ] If subscription is active (not cancelled):
    - [ ] Shows "Spravovať fakturáciu" (grey text link)
    - [ ] Shows "Zrušiť predplatné" (grey text, turns red on hover)
    - [ ] Both buttons are centered vertically
  - [ ] If subscription is cancelled:
    - [ ] Shows "Ukončené" notice with tooltip
    - [ ] Shows "Obnoviť predplatné" button

- [ ] **On Other Tier Cards**
  - [ ] Shows "Zmeniť" button (blue gradient)
  - [ ] Does NOT show management buttons
  - [ ] Clicking "Zmeniť" starts checkout for that tier

- [ ] **On Free Tier Card (when user is on Free)**
  - [ ] Shows "Aktuálny plán" (grey, disabled)
  - [ ] Does NOT show "Zmeniť"

---

## ✅ 7. Trial Tier Switching

### Test: Switching Plans During Cancelled Trial
- [ ] **Setup**
  - [ ] Start a Business trial
  - [ ] Cancel it (but don't let it expire yet)
  - [ ] Go to subscription page

- [ ] **Switch to Different Tier**
  - [ ] Business card shows "Ukončené" and "Obnoviť predplatné"
  - [ ] Pro card shows "Zmeniť" button (not "Obnoviť")
  - [ ] Click "Zmeniť" on Pro card
  - [ ] Verify it starts a NEW checkout for Pro
  - [ ] Complete checkout
  - [ ] Verify user is now on Pro tier
  - [ ] Verify remaining trial period is preserved (if applicable)

---

## ✅ 8. Discount Badge

### Test: Yearly Discount Display
- [ ] **Subscription Page**
  - [ ] Click "Ročne" tab
  - [ ] Verify "-25%" badge is shown (green)
  - [ ] Verify yearly prices are displayed
  - [ ] Verify savings calculation is correct (e.g., "Ušetríte €14.8 ročne")

---

## ✅ 9. Promo Code Removal

### Test: No Promo Code Field
- [ ] **Subscription Page**
  - [ ] Check all tier cards
  - [ ] Verify there is NO promo code input field
  - [ ] Verify there is NO "Mám promo kód" button
  - [ ] Checkout flow does NOT include promo code option

---

## ✅ 10. Webhook & Database Updates

### Test: Stripe Webhooks Preserve Trial History
- [ ] **Start a Trial**
  - [ ] Subscribe to a plan with trial
  - [ ] Check database: `trialEndsAt` should be set to future date
  
- [ ] **Cancel Trial**
  - [ ] Cancel the subscription
  - [ ] Check database: `trialEndsAt` should STILL be set (not null)
  - [ ] `subscriptionStatus` should be 'CANCELLED'

- [ ] **Subscribe Without Trial (after using trial)**
  - [ ] Subscribe to a plan (no trial offered)
  - [ ] Check database: `trialEndsAt` should STILL be the old date (preserved)
  - [ ] `subscriptionStatus` should be 'ACTIVE'

### Database Query:
```sql
SELECT 
  u.email,
  p.subscriptionStatus,
  p.trialEndsAt,
  p.subscriptionExpiresAt,
  t.name as tier
FROM "Profile" p
JOIN "User" u ON u.id = p.userId
JOIN "Tier" t ON t.id = p.tierId
WHERE u.email = 'YOUR_TEST_EMAIL';
```

---

## ✅ 11. Edge Cases

### Test: Various Scenarios
- [ ] **Downgrade from Business to Pro**
  - [ ] User on Business subscription
  - [ ] Click "Zmeniť" on Pro card
  - [ ] Verify downgrade flow works
  - [ ] Verify change happens at end of period

- [ ] **Downgrade from Pro to Free**
  - [ ] User on Pro subscription
  - [ ] Click "Zmeniť" on Free card
  - [ ] Confirm cancellation
  - [ ] Verify subscription is cancelled
  - [ ] Verify user downgrades to Free at end of period

- [ ] **Upgrade from Free to Paid**
  - [ ] User on Free tier
  - [ ] Click "Zmeniť" on Business or Pro
  - [ ] Complete checkout
  - [ ] Verify upgrade happens immediately

- [ ] **Reactivate Cancelled Subscription**
  - [ ] User with cancelled subscription (still active)
  - [ ] Click "Obnoviť predplatné"
  - [ ] Verify subscription is reactivated
  - [ ] Verify "Zrušené" badge disappears
  - [ ] Verify "Aktívne predplatné" badge appears

---

## ✅ 12. UI/UX Polish

### Test: Visual & Interaction Quality
- [ ] **Subscription Banner**
  - [ ] Gradient background looks good
  - [ ] Text is readable
  - [ ] Badge colors are appropriate (green=active, orange=cancelled, blue=trial)
  - [ ] Layout is responsive on mobile

- [ ] **Pricing Cards**
  - [ ] Cards are aligned properly
  - [ ] Current tier has blue border
  - [ ] Hover effects work smoothly
  - [ ] Trial badge is visible and styled correctly
  - [ ] Discount badge on yearly tab is visible

- [ ] **Buttons & Links**
  - [ ] "Zmeniť" button has gradient and hover effect
  - [ ] "Spravovať fakturáciu" is subtle grey text
  - [ ] "Zrušiť predplatné" turns red on hover
  - [ ] "Aktuálny plán" is disabled and grey
  - [ ] All buttons have smooth transitions

- [ ] **Tooltips**
  - [ ] "Ukončené" info icon shows tooltip on hover
  - [ ] Tooltip is centered and readable
  - [ ] Tooltip disappears when not hovering

---

## 🔧 Testing Tools

### Stripe CLI (for webhook testing)
```bash
# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

### Database Queries
```sql
-- Check all users with trials
SELECT u.email, p.trialEndsAt, p.subscriptionStatus
FROM "Profile" p
JOIN "User" u ON u.id = p.userId
WHERE p.trialEndsAt IS NOT NULL;

-- Check active subscriptions
SELECT u.email, s.status, s.currentPeriodEnd, s.cancelAtPeriodEnd
FROM "Subscription" s
JOIN "Profile" p ON p.id = s.profileId
JOIN "User" u ON u.id = p.userId
WHERE s.status IN ('ACTIVE', 'TRIAL', 'TRIALING');
```

---

## 📝 Notes

- **Trial Badge Logic**: Shows only if `mode === 'subscription' && !isYearly && !hasUsedTrial && !isFree`
- **Trial Eligibility**: Determined by `profile.trialEndsAt === null`
- **Cancelled Badge**: Shows only if `cancelAtPeriodEnd === true && expiresAt > now`
- **Dynamic Pricing**: Fetched from Stripe on every page load (server-side)
- **Trial Preservation**: `trialEndsAt` is never cleared after being set

---

## ✅ Success Criteria

All items in this checklist should pass for the subscription system to be considered fully functional and production-ready.

**Priority Issues** (must fix before production):
- [ ] Trial abuse prevention working (no multiple trials)
- [ ] Prices match Stripe Dashboard
- [ ] Cancelled badge disappears after expiration
- [ ] Webhooks preserve trial history

**Nice to Have** (can be addressed later):
- [ ] Email notifications for trial ending
- [ ] Email notifications for subscription cancelled
- [ ] Admin panel to manually adjust user trials

# Stripe Payment Fixes - Implementation Summary

## ✅ Fixes Implemented

### 1. **Extended Price ID Mapping** (Fixed yearly & lifetime tier detection)
**File**: `src/app/api/stripe/webhook/route.ts`
**Function**: `getTierFromPriceId()`

Added support for yearly and lifetime price IDs:
- Monthly: `STRIPE_BUSINESS_PRICE_ID`, `STRIPE_PRO_PRICE_ID`
- Yearly: `STRIPE_BUSINESS_YEARLY_PRICE_ID`, `STRIPE_PRO_YEARLY_PRICE_ID`
- Lifetime: `STRIPE_BUSINESS_LIFETIME_PRICE_ID`, `STRIPE_PRO_LIFETIME_PRICE_ID`

**Impact**: Yearly subscriptions will now correctly map to Business/Pro tiers.

---

### 2. **Added Lifetime Payment Handler** (Fixed lifetime payments not switching tiers)
**File**: `src/app/api/stripe/webhook/route.ts`
**Function**: `handleLifetimePayment()`

Created new webhook handler specifically for one-time lifetime payments:
- Detects `mode: 'payment'` in checkout session
- Retrieves price ID from line items
- Updates profile with `subscriptionStatus: "LIFETIME"`
- Sets `subscriptionExpiresAt: null` (never expires)
- Creates subscription record with far-future end date (2099-12-31)

**Impact**: Lifetime payments will now upgrade users immediately after payment.

---

### 3. **Modified Checkout Completed Handler** (Routing logic)
**File**: `src/app/api/stripe/webhook/route.ts`
**Function**: `handleCheckoutCompleted()`

Added mode detection:
- If `mode === 'payment'` → Routes to `handleLifetimePayment()`
- If `mode === 'subscription'` → Uses existing subscription logic

**Impact**: Webhook now handles both recurring subscriptions and one-time payments correctly.

---

## 🔧 Required Actions

### **CRITICAL: Add Missing Environment Variables**

You need to add these environment variables to your `.env` file:

```env
# Yearly Price IDs (create these in Stripe Dashboard)
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx

# Lifetime Price IDs (create these in Stripe Dashboard)
STRIPE_BUSINESS_LIFETIME_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_LIFETIME_PRICE_ID=price_xxxxxxxxxxxxx

# Enable lifetime deals
ENABLE_LIFETIME_DEALS=true

# Lifetime prices for display (optional, defaults in code)
STRIPE_BUSINESS_LIFETIME_PRICE=69
STRIPE_PRO_LIFETIME_PRICE=119
```

### **How to Create Price IDs in Stripe:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Find your Business and Pro products
3. For each product, create new prices:
   - **Yearly**: Recurring, billed yearly
   - **Lifetime**: One-time payment
4. Copy the price IDs (format: `price_xxxxxxxxxxxxx`)
5. Add them to your `.env` file

### **Update Vercel Environment Variables** (if deployed)

Don't forget to add these same variables to your Vercel project settings:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all the new price IDs
3. Redeploy your application

---

## 🧪 Testing Checklist

Once you've added the environment variables, test these scenarios:

### ✅ Monthly Subscription (Should already work)
- [ ] Subscribe to Business Monthly
- [ ] Verify tier switches immediately after checkout
- [ ] Check webhook logs for success message

### 🆕 Yearly Subscription (Now fixed)
- [ ] Subscribe to Business Yearly
- [ ] Verify "Nedostupné" (Unavailable) button is now showing price
- [ ] Complete checkout and verify tier switches
- [ ] Check profile shows correct expiration date (1 year from now)

### 🆕 Lifetime Payment (Now fixed)
- [ ] Purchase Business Lifetime
- [ ] Verify tier switches immediately after checkout
- [ ] Check `subscriptionStatus` is "LIFETIME"
- [ ] Verify `subscriptionExpiresAt` is null
- [ ] Confirm no renewal events will occur

---

## 🔍 How to Monitor Webhooks

### Local Development:
```bash
# Terminal 1: Run your dev server
npm run dev

# Terminal 2: Forward Stripe webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Production:
Check Stripe Dashboard → Developers → Webhooks → Your endpoint → Events

Look for these events:
- `checkout.session.completed` (for all payments)
- `customer.subscription.created` (for monthly/yearly)
- `invoice.payment_succeeded` (for renewals)

---

## 📊 Expected Webhook Logs

### For Lifetime Payment:
```
=== WEBHOOK: Checkout Completed ===
Mode: payment
🔄 Detected lifetime payment, routing to handleLifetimePayment
=== WEBHOOK: Lifetime Payment ===
Price ID from line items: price_xxxxxxxxxxxxx
Found tier: { id: 'xxx', name: 'Business' }
✅ Lifetime payment processed for profile xxx
✅ Upgraded to tier: Business (LIFETIME)
```

### For Yearly Subscription:
```
=== WEBHOOK: Checkout Completed ===
Mode: subscription
Price ID from subscription: price_xxxxxxxxxxxxx
Found tier: { id: 'xxx', name: 'Business' }
✅ Checkout completed successfully for profile xxx
✅ Updated to tier: Business
```

---

## 🐛 Troubleshooting

### Issue: "Nedostupné" still showing for yearly
**Solution**: Check that `STRIPE_BUSINESS_YEARLY_PRICE_ID` is set in `.env` and restart dev server

### Issue: Lifetime payment completes but tier doesn't change
**Solution**: 
1. Check webhook logs for errors
2. Verify `STRIPE_BUSINESS_LIFETIME_PRICE_ID` is in the price mapping
3. Ensure webhook secret is correct

### Issue: Webhook signature verification failed
**Solution**: 
- Local: Use `stripe listen` and copy the webhook secret it provides
- Production: Use the webhook secret from Stripe Dashboard

---

## 📝 Summary of Changes

| Issue | Status | Solution |
|-------|--------|----------|
| Monthly payments work, yearly doesn't switch tier | ✅ Fixed | Added yearly price IDs to `getTierFromPriceId()` |
| Yearly Business tier shows "unavailable" | ⚠️ Needs env vars | User must add `STRIPE_BUSINESS_YEARLY_PRICE_ID` |
| Lifetime payment doesn't switch tier | ✅ Fixed | Created `handleLifetimePayment()` function |

---

## 🚀 Next Steps

1. **Add environment variables** (see above)
2. **Restart your dev server** (`npm run dev`)
3. **Test each payment type** using Stripe test mode
4. **Deploy to production** and update Vercel env vars
5. **Monitor webhook logs** for any issues

---

## 💡 Additional Notes

- All changes are backward compatible with existing monthly subscriptions
- The webhook handler is idempotent (safe to receive duplicate events)
- Lifetime subscriptions use a far-future date (2099-12-31) for database consistency
- Error logging has been improved for easier debugging

---

**Need help?** Check the webhook logs in Stripe Dashboard or your server console for detailed error messages.

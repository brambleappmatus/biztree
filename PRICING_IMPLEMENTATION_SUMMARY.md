# Pricing Implementation Summary

## ✅ What's Been Implemented

Your subscription page now supports **three pricing options**:

### 1. **Monthly Subscriptions**
- Business: €3.90/month
- Pro: €8.90/month
- Includes 7-day free trial

### 2. **Yearly Subscriptions** 
- Business: €35.00/year (save €11.80/year vs monthly)
- Pro: €79.00/year (save €27.80/year vs monthly)
- Includes 7-day free trial

### 3. **Lifetime Deals** (Can be toggled on/off)
- Business: €69.00 (one-time payment)
- Pro: €119.00 (one-time payment)
- No trial, immediate access

## 🎨 UI Features

- ✅ **Toggle between pricing options** - Users can switch between Monthly/Yearly/Lifetime
- ✅ **Discount badge** - Shows "-20%" on yearly toggle button
- ✅ **Savings display** - Shows "Ušetríte €X ročne" under yearly prices
- ✅ **Free tier hidden** - Only shows Business and Pro for yearly/lifetime views
- ✅ **Smart trial badge** - Only shows "7 dní zadarmo" for subscriptions, not lifetime
- ✅ **Lifetime toggle** - Can be hidden via `ENABLE_LIFETIME_DEALS=false`

## 📝 Environment Variables Needed

Add these to your `.env` file:

```env
# Yearly Subscriptions
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_xxxxx  # From "Business Yearly License"
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx       # From "Pro Yearly License"

# Lifetime One-Time Payments
STRIPE_BUSINESS_LIFETIME_PRICE_ID=price_xxxxx  # From "Business Lifetime"
STRIPE_PRO_LIFETIME_PRICE_ID=price_xxxxx       # From "Pro Lifetime"
STRIPE_BUSINESS_LIFETIME_PRICE=69
STRIPE_PRO_LIFETIME_PRICE=119

# Toggle lifetime deals on/off
ENABLE_LIFETIME_DEALS=true  # Set to 'false' to hide lifetime option
```

## 🔧 Files Modified

1. **`/src/app/admin/subscription/actions.ts`**
   - Added `mode` parameter to support one-time payments
   - Handles both 'subscription' and 'payment' modes

2. **`/src/components/subscription/subscription-actions.tsx`**
   - Accepts `mode` prop
   - Hides trial badge for lifetime purchases

3. **`/src/components/subscription/pricing-section.tsx`** (NEW)
   - Client component with pricing toggle
   - Filters Free tier for yearly/lifetime views
   - Shows savings calculation for yearly

4. **`/src/app/admin/subscription/page.tsx`**
   - Refactored to use PricingSection component
   - Defines all price IDs and prices
   - Passes data to PricingSection

## 🚀 Next Steps

1. **Get Price IDs from Stripe**
   - You already have the products created (I can see them in your screenshot)
   - Go to each product and copy the price ID
   - Add them to your `.env` file

2. **Set Lifetime Toggle**
   ```env
   ENABLE_LIFETIME_DEALS=true  # Show lifetime option
   # or
   ENABLE_LIFETIME_DEALS=false  # Hide lifetime option (for limited-time deals)
   ```

3. **Restart Dev Server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

4. **Test the Page**
   - Navigate to `/admin/subscription`
   - Toggle between Monthly, Yearly, and Lifetime
   - Verify prices display correctly
   - Test checkout flow

## 💡 How It Works

### Payment Flow

**Monthly/Yearly (Subscriptions):**
1. User clicks "Zmeniť" button
2. Creates Stripe checkout session with `mode: 'subscription'`
3. Includes 7-day trial
4. Recurring billing after trial

**Lifetime (One-time Payment):**
1. User clicks "Zmeniť" button
2. Creates Stripe checkout session with `mode: 'payment'`
3. No trial - immediate payment
4. One-time charge, permanent access

### Webhook Handling

You'll need to handle the webhook events to grant permanent access for lifetime purchases:
- `checkout.session.completed` - Check if mode is 'payment'
- If lifetime purchase, set user's tier permanently (no expiration date)

## 📊 Pricing Comparison

| Plan | Monthly | Yearly | Lifetime | Yearly Savings |
|------|---------|--------|----------|----------------|
| Business | €3.90/mo | €35/yr | €69 | €11.80/yr |
| Pro | €8.90/mo | €79/yr | €119 | €27.80/yr |

**Yearly vs Monthly:**
- Business: 25% discount (€35 vs €46.80)
- Pro: 26% discount (€79 vs €106.80)

## ✨ Ready to Test!

Once you add the environment variables and restart the server, your pricing page will be fully functional with all three pricing options!

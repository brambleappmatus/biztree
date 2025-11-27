# Pricing Environment Variables Setup

## Required Environment Variables

Add the following environment variables to your `.env` file:

### Monthly Pricing (Existing)
```env
STRIPE_BUSINESS_PRICE_ID=price_xxxxx  # Already exists
STRIPE_PRO_PRICE_ID=price_xxxxx       # Already exists
```

### Yearly Pricing (NEW - 20% off annual)
```env
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_xxxxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx
```

### Lifetime Pricing (NEW - One-time payment)
```env
STRIPE_BUSINESS_LIFETIME_PRICE_ID=price_xxxxx
STRIPE_PRO_LIFETIME_PRICE_ID=price_xxxxx

# Lifetime prices (for display)
STRIPE_BUSINESS_LIFETIME_PRICE=69
STRIPE_PRO_LIFETIME_PRICE=119

# Enable/disable lifetime deals
ENABLE_LIFETIME_DEALS=true  # Set to 'false' to hide lifetime option
```

## Stripe Setup Instructions

### 1. Create Yearly Subscription Prices in Stripe

Based on your current monthly prices:
- **Business Monthly**: €3.90/month
- **Pro Monthly**: €8.90/month

Your yearly prices (as shown in Stripe):
- **Business Yearly**: €35.00/year
- **Pro Yearly**: €79.00/year

**Steps:**
1. Go to Stripe Dashboard → Products
2. Find "Business Yearly License" and "Pro Yearly License"
3. Copy the price IDs (they start with `price_`)
4. Add them to your `.env` file

### 2. Create Lifetime One-Time Payment Prices

Based on your screenshot:
- **Business Lifetime**: €69.00 (one-time)
- **Pro Lifetime**: €119.00 (one-time)

**Steps:**
1. Go to Stripe Dashboard → Products
2. Find "Business Lifetime" and "Pro Lifetime"
3. Make sure they are set as **one-time payments** (not recurring)
4. Copy the price IDs
5. Add them to your `.env` file

### 3. Toggle Lifetime Deals

To enable/disable lifetime deals without removing the Stripe products:

```env
# Show lifetime option
ENABLE_LIFETIME_DEALS=true

# Hide lifetime option (limited-time deal ended)
ENABLE_LIFETIME_DEALS=false
```

## How It Works

### Pricing Display
- **Monthly**: Shows monthly recurring prices
- **Yearly**: Shows annual prices with 20% discount badge
- **Lifetime**: Shows one-time payment prices (if enabled)

### Payment Flow
- **Monthly/Yearly**: Creates Stripe subscription with 7-day trial
- **Lifetime**: Creates one-time payment (no trial, immediate access)

### Features
- ✅ Toggle between Monthly, Yearly, and Lifetime pricing
- ✅ 20% discount automatically calculated for yearly
- ✅ Lifetime deals can be turned on/off via environment variable
- ✅ Promo codes work for all pricing options
- ✅ Existing subscription management unchanged

## Testing

1. Add all environment variables to `.env`
2. Restart your dev server: `npm run dev`
3. Navigate to `/admin/subscription`
4. Test the pricing toggle
5. Verify prices display correctly
6. Test checkout flow for each option

## Notes

- The current tier detection is simplified and assumes monthly subscriptions
- You may want to track the billing cycle in the database for more accurate "current plan" detection
- Lifetime purchases should update the user's tier permanently (webhook handling needed)

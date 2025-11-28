# Environment Variables Needed

## Add these to your .env file:

# Yearly Price IDs
STRIPE_BUSINESS_YEARLY_PRICE_ID=
STRIPE_PRO_YEARLY_PRICE_ID=

# Lifetime Price IDs  
STRIPE_BUSINESS_LIFETIME_PRICE_ID=
STRIPE_PRO_LIFETIME_PRICE_ID=

# Enable lifetime deals
ENABLE_LIFETIME_DEALS=true

# Lifetime prices for display
STRIPE_BUSINESS_LIFETIME_PRICE=69
STRIPE_PRO_LIFETIME_PRICE=119

## Instructions:
1. Create these prices in Stripe Dashboard (https://dashboard.stripe.com/products)
2. Copy the price IDs (format: price_xxxxxxxxxxxxx)
3. Paste them into your .env file
4. Restart your dev server: npm run dev
5. Test each payment type

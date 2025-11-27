# Stripe Subscription Issue - Tier Not Upgrading After Payment

## Problem
After completing a Stripe checkout successfully (URL shows `success=true&session_id=...`), the user's tier remains as "Free Member" instead of upgrading to the paid tier they purchased.

## Root Cause
The tier upgrade is handled by **Stripe webhooks**, not by the success page redirect. When testing locally with Stripe in test/sandbox mode, webhooks are **not automatically delivered** to `localhost:3000`.

## Solution

### For Local Development (Testing)

#### Step 1: Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

#### Step 2: Login to Stripe
```bash
stripe login
```
This will open your browser to authenticate with your Stripe account.

#### Step 3: Start Webhook Forwarding
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Important:** Keep this terminal window open while testing!

The CLI will output a webhook signing secret like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

#### Step 4: Update Environment Variables
Copy the webhook secret from the CLI output and add it to your `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

#### Step 5: Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C in the terminal running npm run dev)
npm run dev
```

#### Step 6: Test the Flow
1. Navigate to `/admin/subscription`
2. Click "Zmeniť" on a paid tier (Business or Pro)
3. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
4. Complete the checkout
5. Watch the Stripe CLI terminal - you should see webhook events being delivered:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `invoice.payment_succeeded`
6. After 3 seconds, you'll be redirected back and your tier should be upgraded!

### For Production

#### Step 1: Configure Webhook Endpoint in Stripe Dashboard
1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your production URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`

#### Step 2: Copy Webhook Signing Secret
After creating the endpoint, Stripe will show you a signing secret (starts with `whsec_`).

Add this to your production environment variables:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_production_secret
```

## How It Works

### Payment Flow
1. User clicks "Zmeniť" on a tier
2. `createCheckoutSession()` creates a Stripe Checkout session
3. User is redirected to Stripe's hosted checkout page
4. User completes payment
5. Stripe redirects back to: `/admin/subscription?success=true&session_id=xxx`
6. **Meanwhile**, Stripe sends webhook events to your server

### Webhook Processing
The webhook handler (`/api/stripe/webhook/route.ts`) processes these events:

1. **`checkout.session.completed`**
   - Creates/updates subscription record in database
   - Updates profile tier
   - Sets subscription status (TRIAL or ACTIVE)
   - Creates subscription history record

2. **`customer.subscription.updated`**
   - Handles tier changes
   - Updates subscription period
   - Handles trial-to-paid conversion

3. **`invoice.payment_succeeded`**
   - Renews subscription
   - Updates expiration date

4. **`customer.subscription.deleted`**
   - Downgrades to Free tier
   - Marks subscription as cancelled

## Troubleshooting

### Issue: Tier still not upgrading
**Check:**
1. Is the Stripe CLI running? (`stripe listen --forward-to localhost:3000/api/stripe/webhook`)
2. Is `STRIPE_WEBHOOK_SECRET` in your `.env` file?
3. Did you restart the dev server after adding the secret?
4. Check the Stripe CLI terminal for webhook delivery logs
5. Check your Next.js terminal for webhook handler logs

### Issue: "Webhook signature verification failed"
**Solution:**
- Make sure you're using the secret from `stripe listen` output, NOT from the Stripe dashboard
- The dashboard secret only works for production webhooks
- Restart both the Stripe CLI and your dev server

### Issue: Webhooks delivered but tier not upgrading
**Check the logs:**
1. Look for errors in the Next.js terminal
2. Common issues:
   - Price ID mismatch (check `.env` variables match Stripe dashboard)
   - Database connection issues
   - Missing tier in database (run `npx prisma db seed` if needed)

### Issue: "Could not find tier for price: price_xxx"
**Solution:**
1. Verify your `.env` has the correct price IDs:
   ```env
   STRIPE_BUSINESS_PRICE_ID=price_xxxxxxxxxxxxx
   STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
   ```
2. These must match the price IDs in your Stripe dashboard
3. Go to Stripe Dashboard > Products > [Your Product] > Pricing
4. Copy the exact price ID (starts with `price_`)

## What Changed

### New Files
1. **`STRIPE_WEBHOOK_SETUP.md`** - Detailed setup guide
2. **`src/components/subscription/subscription-success-handler.tsx`** - Shows success/cancel feedback

### Modified Files
1. **`src/app/admin/subscription/page.tsx`** - Added success handler component
2. **`src/app/admin/subscription/actions.ts`** - Improved error handling and logging

### User Experience Improvements
- Success modal shows after payment completion
- Clear feedback while waiting for webhook processing
- Automatic page refresh after 3 seconds
- Better error messages if something goes wrong

## Testing Checklist

- [ ] Stripe CLI installed and logged in
- [ ] `stripe listen` running in a terminal
- [ ] `STRIPE_WEBHOOK_SECRET` added to `.env`
- [ ] Dev server restarted
- [ ] Can see webhook events in Stripe CLI terminal
- [ ] Tier upgrades after successful payment
- [ ] Success modal appears after checkout
- [ ] Page refreshes and shows new tier

## Next Steps for Production

1. Set up webhook endpoint in Stripe dashboard
2. Add production webhook secret to environment variables
3. Test with real payment (or use Stripe test mode in production)
4. Monitor webhook delivery in Stripe dashboard
5. Set up error alerting for failed webhooks

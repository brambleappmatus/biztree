# Stripe Webhook Setup for Local Development

## Problem
When you complete a Stripe checkout in test mode on localhost, the tier doesn't upgrade because webhooks aren't being delivered to your local server.

## Solution: Use Stripe CLI

### 1. Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### 2. Login to Stripe
```bash
stripe login
```
This will open your browser to authenticate.

### 3. Forward webhooks to localhost
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This command will:
- Start listening for Stripe events
- Forward them to your local webhook endpoint
- Display a **webhook signing secret** (starts with `whsec_...`)

### 4. Copy the webhook secret
The CLI will output something like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

Copy this secret and add it to your `.env` file:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 5. Restart your dev server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 6. Test the payment flow
1. Go to `/admin/subscription`
2. Click "Zmeniť" on a paid tier
3. Use test card: `4242 4242 4242 4242`
4. Complete the checkout
5. You should see webhook events in the Stripe CLI terminal
6. Your tier should now upgrade automatically!

## Webhook Events to Watch For
- `checkout.session.completed` - Triggers tier upgrade
- `customer.subscription.created` - Creates subscription record
- `invoice.payment_succeeded` - Renews subscription

## Troubleshooting

### "No webhook secret" error
- Make sure `STRIPE_WEBHOOK_SECRET` is in your `.env` file
- Restart your dev server after adding it

### Tier still not upgrading
- Check the Stripe CLI terminal for webhook delivery logs
- Check your Next.js terminal for webhook handler logs
- Verify the price IDs in `.env` match your Stripe dashboard

### Webhook signature verification failed
- Make sure you're using the secret from `stripe listen`, not from the Stripe dashboard
- The dashboard webhook secret won't work for local development

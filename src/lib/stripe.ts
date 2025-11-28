import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("STRIPE_SECRET_KEY is not set in environment variables. Stripe features will not work.");
}

export const stripe = new Stripe(stripeKey, {
    apiVersion: "2023-10-16" as any,
    typescript: true,
});

/**
 * Create a Stripe customer
 */
export async function createStripeCustomer(email: string, name?: string) {
    return await stripe.customers.create({
        email,
        name,
        metadata: {
            source: "biztree"
        }
    });
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, string>
) {
    return await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
    });
}

/**
 * Create a subscription directly
 */
export async function createSubscription(customerId: string, priceId: string) {
    return await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
    });
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
    if (cancelAtPeriodEnd) {
        return await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });
    } else {
        return await stripe.subscriptions.cancel(subscriptionId);
    }
}

/**
 * Update a subscription (upgrade/downgrade)
 */
export async function updateSubscription(subscriptionId: string, newPriceId: string) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return await stripe.subscriptions.update(subscriptionId, {
        items: [
            {
                id: subscription.items.data[0].id,
                price: newPriceId,
            },
        ],
        proration_behavior: "always_invoice",
    });
}

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
) {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(customerId: string, returnUrl: string) {
    return await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
}

/**
 * Retrieve prices from Stripe
 */
export async function getStripePrices(priceIds: string[]) {
    // Filter out empty IDs
    const validIds = priceIds.filter(id => id && id.length > 0);

    if (validIds.length === 0) return [];

    try {
        // Use list to fetch multiple prices efficiently if possible, but retrieve is safer for specific IDs
        // For a small number of IDs, parallel retrieve is fine
        const prices = await Promise.all(
            validIds.map(async (id) => {
                try {
                    const price = await stripe.prices.retrieve(id);
                    return {
                        id,
                        unit_amount: price.unit_amount,
                        currency: price.currency,
                    };
                } catch (error) {
                    console.error(`Error fetching price ${id}:`, error);
                    return null;
                }
            })
        );
        return prices.filter((p): p is NonNullable<typeof p> => p !== null);
    } catch (error) {
        console.error("Error fetching Stripe prices:", error);
        return [];
    }
}

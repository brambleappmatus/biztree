import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

// Replace all console.log and console.error with log function
// This is a global replacement strategy for the file content below

export async function POST(request: NextRequest) {

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { error: "No signature" },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json(
            { error: `Webhook Error: ${err.message}` },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            case "customer.subscription.created":
            case "customer.subscription.updated":
                await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
                break;

            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            case "invoice.payment_succeeded":
                await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;

            case "invoice.payment_failed":
                await handlePaymentFailed(event.data.object as Stripe.Invoice);
                break;

            case "customer.subscription.trial_will_end":
                await handleTrialWillEnd(event.data.object as Stripe.Subscription);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("Webhook handler error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    console.log("=== WEBHOOK: Checkout Completed ===");
    const { customer, subscription, metadata, mode } = session;
    console.log("Customer:", customer);
    console.log("Subscription:", subscription);
    console.log("Metadata:", metadata);
    console.log("Mode:", mode);

    // Check if this is a lifetime payment (one-time payment)
    if (mode === 'payment') {
        console.log("🔄 Detected lifetime payment, routing to handleLifetimePayment");
        await handleLifetimePayment(session);
        return;
    }

    // For subscription mode, we need subscription object
    if (!customer || !subscription || !metadata?.profileId) {
        console.error("Missing required data in checkout session", { customer, subscription, metadata });
        return;
    }

    const subscriptionId = typeof subscription === 'string' ? subscription : subscription.id;
    const customerId = typeof customer === 'string' ? customer : customer.id;

    // Get subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log(`Stripe Subscription retrieved: ${stripeSubscription.id}, status: ${stripeSubscription.status}`);
    console.log(`Raw current_period_end: ${(stripeSubscription as any).current_period_end}`);

    // Get tier from price ID
    const priceId = stripeSubscription.items.data[0].price.id;
    console.log("Price ID from subscription:", priceId);
    const tier = await getTierFromPriceId(priceId);
    console.log("Found tier:", tier);

    if (!tier) {
        console.error("Could not find tier for price:", priceId);
        console.error("Available price IDs:", {
            business: process.env.STRIPE_BUSINESS_PRICE_ID,
            pro: process.env.STRIPE_PRO_PRICE_ID
        });
        return;
    }

    // Calculate expiration date
    const trialEnd = stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null;

    // Handle trial subscriptions that may not have billing periods yet
    const currentPeriodStart = (stripeSubscription as any).current_period_start
        ? new Date((stripeSubscription as any).current_period_start * 1000)
        : new Date(); // Fallback to now if not set

    let currentPeriodEnd: Date;
    if ((stripeSubscription as any).current_period_end) {
        currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000);
    } else if (trialEnd) {
        currentPeriodEnd = trialEnd;
    } else {
        console.warn(`⚠️ Missing current_period_end for subscription ${subscriptionId}, falling back to 30 days`);
        currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Create or update subscription record
    await prisma.subscription.upsert({
        where: { stripeSubscriptionId: subscriptionId },
        create: {
            profileId: metadata.profileId,
            tierId: tier.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            status: stripeSubscription.status.toUpperCase(),
            currentPeriodStart,
            currentPeriodEnd,
        },
        update: {
            status: stripeSubscription.status.toUpperCase(),
            currentPeriodEnd,
        }
    });

    // Update profile
    await prisma.profile.update({
        where: { id: metadata.profileId },
        data: {
            tierId: tier.id,
            subscriptionStatus: trialEnd ? "TRIAL" : "ACTIVE",
            subscriptionExpiresAt: currentPeriodEnd,
            ...(trialEnd ? { trialEndsAt: trialEnd } : {}),
        }
    });

    // Create history record
    await prisma.subscriptionHistory.create({
        data: {
            profileId: metadata.profileId,
            action: "UPGRADED",
            newTierId: tier.id,
            performedBy: "USER",
            performedByUserId: metadata.userId,
            notes: `Subscribed to ${tier.name} via Stripe checkout${trialEnd ? ' with 7-day trial' : ''}`
        }
    });

    console.log(`✅ Checkout completed successfully for profile ${metadata.profileId}`);
    console.log(`✅ Updated to tier: ${tier.name}`);
}

async function handleLifetimePayment(session: Stripe.Checkout.Session) {
    console.log("=== WEBHOOK: Lifetime Payment ===");
    const { customer, metadata } = session;

    if (!customer || !metadata?.profileId) {
        console.error("Missing required data for lifetime payment", { customer, metadata });
        return;
    }

    const customerId = typeof customer === 'string' ? customer : customer.id;

    // Get the line items to determine which tier was purchased
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;

    console.log("Price ID from line items:", priceId);

    if (!priceId) {
        console.error("No price ID found in checkout session");
        return;
    }

    // Get tier from price ID
    const tier = await getTierFromPriceId(priceId);
    console.log("Found tier:", tier);

    if (!tier) {
        console.error("Could not find tier for price:", priceId);
        return;
    }

    // Create or update subscription record for lifetime
    // Note: We use a far future date for currentPeriodEnd since lifetime never expires
    const farFutureDate = new Date('2099-12-31');

    // Find existing subscription for this profile
    const existingSubscription = await prisma.subscription.findFirst({
        where: { profileId: metadata.profileId }
    });

    if (existingSubscription) {
        // Update existing subscription
        await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: {
                tierId: tier.id,
                status: "ACTIVE",
                stripePriceId: priceId,
                stripeCustomerId: customerId,
                currentPeriodEnd: farFutureDate,
            }
        });
    } else {
        // Create new subscription
        await prisma.subscription.create({
            data: {
                profileId: metadata.profileId,
                tierId: tier.id,
                stripeCustomerId: customerId,
                stripePriceId: priceId,
                status: "ACTIVE",
                currentPeriodStart: new Date(),
                currentPeriodEnd: farFutureDate,
            }
        });
    }

    // Update profile with lifetime status
    await prisma.profile.update({
        where: { id: metadata.profileId },
        data: {
            tierId: tier.id,
            subscriptionStatus: "LIFETIME",
            subscriptionExpiresAt: null, // Lifetime never expires
        }
    });

    // Create history record
    await prisma.subscriptionHistory.create({
        data: {
            profileId: metadata.profileId,
            action: "UPGRADED",
            newTierId: tier.id,
            performedBy: "USER",
            performedByUserId: metadata.userId,
            notes: `Purchased ${tier.name} lifetime license`
        }
    });

    console.log(`✅ Lifetime payment processed for profile ${metadata.profileId}`);
    console.log(`✅ Upgraded to tier: ${tier.name} (LIFETIME)`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    console.log("=== WEBHOOK: Subscription Update/Create ===");
    const { id, customer, status, current_period_end, current_period_start, trial_end, items, metadata, cancel_at_period_end } = subscription as any;
    console.log(`Subscription ID: ${id}, Status: ${status}, Period End: ${current_period_end}, Cancel At Period End: ${cancel_at_period_end}`);

    const customerId = typeof customer === 'string' ? customer : customer.id;
    const priceId = items.data[0].price.id;
    console.log(`Price ID: ${priceId}, Customer: ${customerId}`);

    const tier = await getTierFromPriceId(priceId);

    if (!tier) {
        console.error("Could not find tier for price:", priceId);
        return;
    }

    const trialEnd = trial_end ? new Date(trial_end * 1000) : null;
    const currentPeriodEnd = new Date(current_period_end * 1000);
    const currentPeriodStart = current_period_start ? new Date(current_period_start * 1000) : new Date();

    console.log(`Calculated dates - Period End: ${currentPeriodEnd.toISOString()}, Trial End: ${trialEnd?.toISOString() || 'none'}`);

    // Find existing subscription or get profileId from metadata
    const existingSubscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: id },
        include: { profile: true }
    });

    let profileId: string;

    if (existingSubscription) {
        profileId = existingSubscription.profileId;
        console.log(`Found existing subscription for profile: ${profileId}`);
    } else if (metadata?.profileId) {
        profileId = metadata.profileId;
        console.log(`New subscription, using profileId from metadata: ${profileId}`);
    } else {
        console.error("Cannot determine profileId for subscription:", id);
        return;
    }

    const isTrialEnding = existingSubscription?.profile.subscriptionStatus === "TRIAL" && !trialEnd;

    // Upsert subscription (handles both create and update)
    await prisma.subscription.upsert({
        where: { stripeSubscriptionId: id },
        create: {
            profileId,
            tierId: tier.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: id,
            stripePriceId: priceId,
            status: status.toUpperCase(),
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: cancel_at_period_end || false,
        },
        update: {
            status: status.toUpperCase(),
            tierId: tier.id,
            stripePriceId: priceId,
            currentPeriodEnd,
            currentPeriodStart,
            cancelAtPeriodEnd: cancel_at_period_end || false,
        }
    });

    // Update profile
    await prisma.profile.update({
        where: { id: profileId },
        data: {
            tierId: tier.id,
            subscriptionStatus: trialEnd ? "TRIAL" : status.toUpperCase(),
            subscriptionExpiresAt: currentPeriodEnd,
            ...(trialEnd ? { trialEndsAt: trialEnd } : {}),
        }
    });

    // Create history record
    if (existingSubscription && existingSubscription.tierId !== tier.id) {
        await prisma.subscriptionHistory.create({
            data: {
                profileId,
                action: "UPGRADED",
                previousTierId: existingSubscription.tierId,
                newTierId: tier.id,
                performedBy: "USER",
                notes: `Changed plan to ${tier.name}`
            }
        });
    } else if (isTrialEnding) {
        await prisma.subscriptionHistory.create({
            data: {
                profileId,
                action: "RENEWED",
                performedBy: "SYSTEM",
                notes: "Trial ended, subscription activated"
            }
        });
    } else if (!existingSubscription) {
        await prisma.subscriptionHistory.create({
            data: {
                profileId,
                action: "UPGRADED",
                newTierId: tier.id,
                performedBy: "USER",
                notes: `Subscribed to ${tier.name}${trialEnd ? ' with trial' : ''}`
            }
        });
    }

    console.log(`✅ Subscription ${existingSubscription ? 'updated' : 'created'} for profile ${profileId}, tier: ${tier.name}, expires: ${currentPeriodEnd.toISOString()}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const { id } = subscription;

    const existingSubscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: id }
    });

    if (!existingSubscription) {
        console.error("Subscription not found:", id);
        return;
    }

    // Get Free tier
    const freeTier = await prisma.tier.findUnique({
        where: { name: "Free" }
    });

    if (!freeTier) {
        console.error("Free tier not found");
        return;
    }

    // Update subscription status
    await prisma.subscription.update({
        where: { stripeSubscriptionId: id },
        data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
        }
    });

    // Downgrade profile to Free
    await prisma.profile.update({
        where: { id: existingSubscription.profileId },
        data: {
            tierId: freeTier.id,
            subscriptionStatus: "CANCELLED",
            subscriptionExpiresAt: null,
            bgImage: "dark-gray", // Reset background
        }
    });

    // Create history record
    await prisma.subscriptionHistory.create({
        data: {
            profileId: existingSubscription.profileId,
            action: "CANCELLED",
            previousTierId: existingSubscription.tierId,
            newTierId: freeTier.id,
            performedBy: "USER",
            notes: "Subscription cancelled"
        }
    });

    console.log(`Subscription cancelled: ${id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const { subscription, customer } = invoice as any;

    if (!subscription) return;

    const subscriptionId = typeof subscription === 'string' ? subscription : subscription.id;

    const existingSubscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId }
    });

    if (!existingSubscription) {
        console.error("Subscription not found:", subscriptionId);
        return;
    }

    // Get updated subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
    const currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000);

    // Update subscription period
    await prisma.subscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
            currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
            currentPeriodEnd,
            status: "ACTIVE",
        }
    });

    // Update profile expiration
    await prisma.profile.update({
        where: { id: existingSubscription.profileId },
        data: {
            subscriptionExpiresAt: currentPeriodEnd,
            subscriptionStatus: "ACTIVE",
        }
    });

    // Create history record
    await prisma.subscriptionHistory.create({
        data: {
            profileId: existingSubscription.profileId,
            action: "RENEWED",
            performedBy: "SYSTEM",
            notes: `Payment succeeded, subscription renewed until ${currentPeriodEnd.toISOString()}`
        }
    });

    console.log(`Payment succeeded for subscription: ${subscriptionId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const { subscription } = invoice as any;

    if (!subscription) return;

    const subscriptionId = typeof subscription === 'string' ? subscription : subscription.id;

    const existingSubscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId }
    });

    if (!existingSubscription) {
        console.error("Subscription not found:", subscriptionId);
        return;
    }

    // Update subscription status
    await prisma.subscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
            status: "PAST_DUE",
        }
    });

    // Update profile status
    await prisma.profile.update({
        where: { id: existingSubscription.profileId },
        data: {
            subscriptionStatus: "PAST_DUE",
        }
    });

    console.log(`Payment failed for subscription: ${subscriptionId}`);
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
    // This is a notification event - you can send an email to the user
    console.log(`Trial will end soon for subscription: ${subscription.id}`);
    // TODO: Send email notification
}

async function getTierFromPriceId(priceId: string): Promise<{ id: string; name: string } | null> {
    // Map Stripe price IDs to tiers (monthly, yearly, and lifetime)
    const priceToTierMap: Record<string, string> = {
        // Monthly
        [process.env.STRIPE_BUSINESS_PRICE_ID!]: "Business",
        [process.env.STRIPE_PRO_PRICE_ID!]: "Pro",
        // Yearly
        [process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID!]: "Business",
        [process.env.STRIPE_PRO_YEARLY_PRICE_ID!]: "Pro",
        // Lifetime
        [process.env.STRIPE_BUSINESS_LIFETIME_PRICE_ID!]: "Business",
        [process.env.STRIPE_PRO_LIFETIME_PRICE_ID!]: "Pro",
    };

    const tierName = priceToTierMap[priceId];
    if (!tierName) {
        console.error("❌ Unknown price ID:", priceId);
        console.error("Available price mappings:", Object.keys(priceToTierMap).filter(k => k !== 'undefined'));
        return null;
    }

    return await prisma.tier.findUnique({
        where: { name: tierName },
        select: { id: true, name: true }
    });
}

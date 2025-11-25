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
    const { customer, subscription, metadata } = session;
    console.log("Customer:", customer);
    console.log("Subscription:", subscription);
    console.log("Metadata:", metadata);

    if (!customer || !subscription || !metadata?.profileId) {
        console.error("Missing required data in checkout session", { customer, subscription, metadata });
        return;
    }

    const subscriptionId = typeof subscription === 'string' ? subscription : subscription.id;
    const customerId = typeof customer === 'string' ? customer : customer.id;

    // Get subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

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
    const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);

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
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
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
            trialEndsAt: trialEnd,
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

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const { id, customer, status, current_period_end, trial_end, items, metadata } = subscription;

    const existingSubscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: id },
        include: { profile: true }
    });

    if (!existingSubscription) {
        console.error("Subscription not found:", id);
        return;
    }

    const priceId = items.data[0].price.id;
    const tier = await getTierFromPriceId(priceId);

    if (!tier) {
        console.error("Could not find tier for price:", priceId);
        return;
    }

    const trialEnd = trial_end ? new Date(trial_end * 1000) : null;
    const currentPeriodEnd = new Date(current_period_end * 1000);
    const isTrialEnding = existingSubscription.profile.subscriptionStatus === "TRIAL" && !trialEnd;

    // Update subscription
    await prisma.subscription.update({
        where: { stripeSubscriptionId: id },
        data: {
            status: status.toUpperCase(),
            tierId: tier.id,
            stripePriceId: priceId,
            currentPeriodEnd,
        }
    });

    // Update profile
    await prisma.profile.update({
        where: { id: existingSubscription.profileId },
        data: {
            tierId: tier.id,
            subscriptionStatus: trialEnd ? "TRIAL" : status.toUpperCase(),
            subscriptionExpiresAt: currentPeriodEnd,
            trialEndsAt: trialEnd,
        }
    });

    // Create history record
    if (existingSubscription.tierId !== tier.id) {
        await prisma.subscriptionHistory.create({
            data: {
                profileId: existingSubscription.profileId,
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
                profileId: existingSubscription.profileId,
                action: "RENEWED",
                performedBy: "SYSTEM",
                notes: "Trial ended, subscription activated"
            }
        });
    }

    console.log(`Subscription updated: ${id}`);
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
            trialEndsAt: null,
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
    const { subscription, customer } = invoice;

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
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);

    // Update subscription period
    await prisma.subscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
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
    const { subscription } = invoice;

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
    // Map Stripe price IDs to tiers
    const priceToTierMap: Record<string, string> = {
        [process.env.STRIPE_BUSINESS_PRICE_ID!]: "Business",
        [process.env.STRIPE_PRO_PRICE_ID!]: "Pro",
    };

    const tierName = priceToTierMap[priceId];
    if (!tierName) return null;

    return await prisma.tier.findUnique({
        where: { name: tierName },
        select: { id: true, name: true }
    });
}

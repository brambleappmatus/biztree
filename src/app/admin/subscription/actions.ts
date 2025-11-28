"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(priceId: string, promoCode?: string, mode: 'subscription' | 'payment' = 'subscription') {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        // Get user's profile
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                profiles: {
                    select: {
                        id: true,
                        trialEndsAt: true,
                        subscriptions: {
                            where: {
                                stripeCustomerId: { not: null }
                            },
                            take: 1
                        }
                    }
                }
            }
        });

        if (!user || !user.profiles || user.profiles.length === 0) {
            throw new Error("Profile not found");
        }

        const profile = user.profiles[0];

        // Get or create Stripe customer
        let customerId: string;
        const existingSubscription = profile.subscriptions[0];

        if (existingSubscription?.stripeCustomerId) {
            customerId = existingSubscription.stripeCustomerId;
        } else {
            const customer = await stripe.customers.create({
                email: user.email!,
                name: user.name || undefined,
                metadata: {
                    profileId: profile.id,
                    userId: user.id
                }
            });
            customerId = customer.id;
        }

        // Check if this is a yearly or lifetime plan (no trial)
        const isYearly = [
            process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID,
            process.env.STRIPE_PRO_YEARLY_PRICE_ID
        ].includes(priceId);

        const isLifetime = [
            process.env.STRIPE_BUSINESS_LIFETIME_PRICE_ID,
            process.env.STRIPE_PRO_LIFETIME_PRICE_ID
        ].includes(priceId);

        // Check if user has already used a trial
        // If trialEndsAt is set (even in the past), they have used a trial
        const hasUsedTrial = !!profile.trialEndsAt;

        // Determine if trial should be applied
        // No trial for yearly/lifetime plans
        // No trial if user has already used one
        const shouldApplyTrial = !isYearly && !isLifetime && !hasUsedTrial;

        // Prepare session configuration
        const sessionConfig: any = {
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: mode,
            success_url: `${process.env.NEXTAUTH_URL}/admin/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/admin/subscription?canceled=true`,
            allow_promotion_codes: true,
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            metadata: {
                profileId: profile.id,
                userId: user.id,
                promoCode: promoCode || ''
            }
        };

        // Add subscription-specific data only if mode is subscription
        if (mode === 'subscription') {
            sessionConfig.subscription_data = {
                metadata: {
                    profileId: profile.id,
                    userId: user.id,
                    promoCode: promoCode || ''
                },
            };

            // Only add trial period if eligible
            if (shouldApplyTrial) {
                sessionConfig.subscription_data.trial_period_days = 7;
            }
        } else {
            // For one-time payments (lifetime), we might want to store metadata on the payment intent
            sessionConfig.payment_intent_data = {
                metadata: {
                    profileId: profile.id,
                    userId: user.id,
                    promoCode: promoCode || ''
                }
            };
        }

        // Create checkout session
        const checkoutSession = await stripe.checkout.sessions.create(sessionConfig);

        return checkoutSession.url;
    } catch (error: any) {
        console.error("Checkout session error:", error);
        throw new Error(error.message || "Failed to create checkout session");
    }
}

export async function createPortalSession() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        // Get user's profile with subscription
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                profiles: {
                    include: {
                        subscriptions: {
                            where: {
                                stripeCustomerId: { not: null },
                                status: { in: ['ACTIVE', 'PAST_DUE'] }
                            },
                            take: 1
                        }
                    }
                }
            }
        });

        if (!user || !user.profiles || user.profiles.length === 0) {
            throw new Error("Profile not found");
        }

        const profile = user.profiles[0];
        const subscription = profile.subscriptions[0];

        if (!subscription?.stripeCustomerId) {
            throw new Error("No active subscription found");
        }

        // Create Stripe billing portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: subscription.stripeCustomerId,
            return_url: `${process.env.NEXTAUTH_URL}/admin/subscription`,
        });

        return portalSession.url;
    } catch (error: any) {
        console.error("Portal session error:", error);
        throw new Error(error.message || "Failed to create portal session");
    }
}

export async function cancelSubscription() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        console.log("Cancelling subscription for user:", session.user.id);

        // Get user's subscription
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                profiles: {
                    include: {
                        subscriptions: {
                            where: {
                                status: { in: ['ACTIVE', 'TRIAL', 'TRIALING'] }
                            },
                            take: 1
                        },
                        tier: true
                    }
                }
            }
        });

        if (!user || !user.profiles || user.profiles.length === 0) {
            console.error("Profile not found");
            throw new Error("Profile not found");
        }

        // Find the profile that has an active subscription
        const profileWithSubscription = user.profiles.find(p => p.subscriptions.length > 0);
        const subscription = profileWithSubscription?.subscriptions[0];

        if (!subscription) {
            console.error("No active subscription found");
            throw new Error("No active subscription found");
        }

        // If there's a Stripe subscription ID, cancel it in Stripe
        if (subscription.stripeSubscriptionId) {
            console.log("Cancelling Stripe subscription:", subscription.stripeSubscriptionId);

            // Cancel at period end (user keeps access until then)
            await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
                cancel_at_period_end: true,
            });

            // Update local subscription
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    cancelAtPeriodEnd: true,
                }
            });
        } else {
            // For trial subscriptions without Stripe ID, just cancel locally
            console.log("Cancelling local trial subscription:", subscription.id);

            // Get the Free tier
            const freeTier = await prisma.tier.findFirst({
                where: { name: 'Free' }
            });

            if (!freeTier) {
                throw new Error("Free tier not found");
            }

            // Delete the subscription and downgrade to Free tier
            await prisma.subscription.delete({
                where: { id: subscription.id }
            });

            // Update profile to Free tier
            await prisma.profile.update({
                where: { id: profileWithSubscription.id },
                data: {
                    tierId: freeTier.id,
                    subscriptionStatus: null,
                    subscriptionExpiresAt: null,
                    trialEndsAt: null
                }
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error in cancelSubscription:", error);
        throw new Error(error.message || "Failed to cancel subscription");
    }
}

export async function reactivateSubscription() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        console.log("Reactivating subscription for user:", session.user.id);

        // Get user's subscription
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                profiles: {
                    include: {
                        subscriptions: {
                            where: {
                                cancelAtPeriodEnd: true
                            },
                            take: 1
                        }
                    }
                }
            }
        });

        if (!user || !user.profiles || user.profiles.length === 0) {
            console.error("Profile not found");
            throw new Error("Profile not found");
        }

        // Find the profile that has a subscription to reactivate
        const profileWithSubscription = user.profiles.find(p => p.subscriptions.length > 0);
        const subscription = profileWithSubscription?.subscriptions[0];

        if (!subscription?.stripeSubscriptionId) {
            console.error("No subscription found to reactivate");
            throw new Error("No subscription found");
        }

        console.log("Reactivating Stripe subscription:", subscription.stripeSubscriptionId);

        // Reactivate subscription
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: false,
        });

        // Update local subscription
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                cancelAtPeriodEnd: false,
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error in reactivateSubscription:", error);
        throw new Error(error.message || "Failed to reactivate subscription");
    }
}

export async function getSubscriptionDetails() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            profiles: {
                include: {
                    subscriptions: {
                        where: {
                            status: { in: ['ACTIVE', 'TRIAL', 'TRIALING', 'PAST_DUE'] }
                        },
                        take: 1
                    }
                }
            }
        }
    });

    if (!user || !user.profiles || user.profiles.length === 0) {
        return null;
    }

    return user.profiles[0].subscriptions[0] || null;
}

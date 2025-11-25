"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(priceId: string, promoCode?: string) {
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

        // Create checkout session with 7-day trial
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            subscription_data: {
                trial_period_days: 7,
                metadata: {
                    profileId: profile.id,
                    userId: user.id,
                    promoCode: promoCode || ''
                },
            },
            success_url: `${process.env.NEXTAUTH_URL}/admin/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/admin/subscription?canceled=true`,
            allow_promotion_codes: true,
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
        });

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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Get user's subscription
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            profiles: {
                include: {
                    subscriptions: {
                        where: {
                            status: { in: ['ACTIVE', 'TRIAL'] }
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

    const subscription = user.profiles[0].subscriptions[0];

    if (!subscription?.stripeSubscriptionId) {
        throw new Error("No active subscription found");
    }

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

    return { success: true };
}

export async function reactivateSubscription() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

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
        throw new Error("Profile not found");
    }

    const subscription = user.profiles[0].subscriptions[0];

    if (!subscription?.stripeSubscriptionId) {
        throw new Error("No subscription found");
    }

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
                            status: { in: ['ACTIVE', 'TRIAL', 'PAST_DUE'] }
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

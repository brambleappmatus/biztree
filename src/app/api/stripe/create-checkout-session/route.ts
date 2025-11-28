import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { priceId, promoCode } = await request.json();

        if (!priceId) {
            return NextResponse.json(
                { error: "Price ID is required" },
                { status: 400 }
            );
        }

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
                            orderBy: { createdAt: 'desc' },
                            take: 1
                        }
                    }
                }
            }
        });

        if (!user || !user.profiles || user.profiles.length === 0) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            );
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

        // Validate promo code if provided
        let discounts: any[] | undefined;
        if (promoCode) {
            const validation = await fetch(`${request.nextUrl.origin}/api/promo-codes/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode })
            }).then(r => r.json());

            if (validation.valid && validation.promoCode.type === 'PERCENTAGE') {
                // Create Stripe coupon for percentage discount
                const coupon = await stripe.coupons.create({
                    percent_off: parseFloat(validation.promoCode.value),
                    duration: 'once',
                    name: validation.promoCode.code
                });
                discounts = [{ coupon: coupon.id }];
            }
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
        const hasUsedTrial = !!profile.trialEndsAt;

        // Determine if trial should be applied
        const shouldApplyTrial = !isYearly && !isLifetime && !hasUsedTrial;

        // Create checkout session
        const sessionConfig: any = {
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            subscription_data: {
                metadata: {
                    profileId: profile.id,
                    userId: user.id,
                    promoCode: promoCode || ''
                },
            },
            discounts,
            success_url: `${request.nextUrl.origin}/admin/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.nextUrl.origin}/admin/subscription?canceled=true`,
            allow_promotion_codes: true,
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
        };

        if (shouldApplyTrial) {
            sessionConfig.subscription_data.trial_period_days = 7;
        }

        const checkoutSession = await stripe.checkout.sessions.create(sessionConfig);

        return NextResponse.json({
            url: checkoutSession.url
        });
    } catch (error: any) {
        console.error("Checkout session error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}

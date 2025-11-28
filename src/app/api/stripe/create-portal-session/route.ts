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
        const subscription = profile.subscriptions[0];

        if (!subscription?.stripeCustomerId) {
            return NextResponse.json(
                { error: "No active subscription found" },
                { status: 404 }
            );
        }

        // Create Stripe billing portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: subscription.stripeCustomerId,
            return_url: `${request.nextUrl.origin}/admin/subscription`,
        });

        return NextResponse.json({
            url: portalSession.url
        });
    } catch (error: any) {
        console.error("Portal session error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create portal session" },
            { status: 500 }
        );
    }
}

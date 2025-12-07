
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
    try {
        const { priceId } = await request.json();

        if (!priceId) {
            return NextResponse.json(
                { error: "Price ID is required" },
                { status: 400 }
            );
        }

        // Validate that this is a known price ID
        const validPriceIds = [
            process.env.STRIPE_BUSINESS_LIFETIME_PRICE_ID,
            process.env.STRIPE_PRO_LIFETIME_PRICE_ID
        ];

        if (!validPriceIds.includes(priceId)) {
            return NextResponse.json(
                { error: "Invalid Price ID" },
                { status: 400 }
            );
        }

        // Create checkout session for guest
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment', // One-time payment for lifetime deals
            success_url: `${request.nextUrl.origin}/?payment_success=true`,
            cancel_url: `${request.nextUrl.origin}/?canceled=true`,
            // We want to collect the email address to contact them later
            customer_email: undefined, // Let Stripe collect it
            phone_number_collection: {
                enabled: true,
            },
            metadata: {
                is_christmas_deal: 'true',
                source: 'landing_page_guest'
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            custom_text: {
                submit: {
                    message: 'We will contact you shortly after purchase to set up your account.',
                },
            },
        });

        return NextResponse.json({
            url: session.url
        });
    } catch (error: any) {
        console.error("Guest checkout error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}

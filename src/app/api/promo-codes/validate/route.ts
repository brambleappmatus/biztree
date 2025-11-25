import { NextRequest, NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/licensing";

export async function POST(request: NextRequest) {
    try {
        const { code, tierId } = await request.json();

        if (!code) {
            return NextResponse.json(
                { error: "Promo code is required" },
                { status: 400 }
            );
        }

        const result = await validatePromoCode(code, tierId);

        if (!result.valid) {
            return NextResponse.json(
                { valid: false, error: result.error },
                { status: 200 }
            );
        }

        return NextResponse.json({
            valid: true,
            promoCode: result.promoCode
        });
    } catch (error) {
        console.error("Promo code validation error:", error);
        return NextResponse.json(
            { error: "Failed to validate promo code" },
            { status: 500 }
        );
    }
}

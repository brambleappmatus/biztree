import { getGoogleOAuthClient } from "@/lib/google-calendar";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(new URL("/admin/services?error=google_auth_error", request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL("/admin/services?error=no_code", request.url));
    }

    try {
        const origin = new URL(request.url).origin;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/google-calendar/callback`;

        const oauth2Client = getGoogleOAuthClient(redirectUri);
        const { tokens } = await oauth2Client.getToken(code);

        const profileId = searchParams.get("state");

        if (!profileId) {
            return NextResponse.redirect(new URL("/admin/services?error=no_profile_id", request.url));
        }

        // Update profile with tokens
        await prisma.profile.update({
            where: { id: profileId },
            data: {
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token,
                googleTokenExpiry: tokens.expiry_date ? BigInt(tokens.expiry_date) : undefined,
            } as any
        });

        return NextResponse.redirect(new URL("/admin/services?success=google_connected", request.url));
    } catch (error) {
        console.error("Error exchanging code for tokens:", error);
        return NextResponse.redirect(new URL("/admin/services?error=token_exchange_failed", request.url));
    }
}

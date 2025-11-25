import { getGoogleOAuthClient } from "@/lib/google-calendar";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
        return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/google-calendar/callback`;

    const oauth2Client = getGoogleOAuthClient(redirectUri);

    const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent', // Force consent to ensure we get a refresh token
        state: profileId, // Pass profileId as state
    });

    return NextResponse.redirect(url);
}
